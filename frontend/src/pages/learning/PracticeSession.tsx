import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import {
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { learningService } from '@/services/interviewService';
import type { PracticeSession as PracticeSessionType } from '@/types';

export default function PracticeSession() {
  const { skillName } = useParams<{ skillName: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<PracticeSessionType | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  const startMutation = useMutation({
    mutationFn: (skill: string) =>
      learningService.startPractice({ skillName: decodeURIComponent(skill) }),
    onSuccess: (res) => {
      setSession(res.data.data.session);
      setSelectedAnswers({});
      setIsSubmitted(false);
      setResultData(null);
    },
    onError: () => toast.error('Could not start practice session'),
  });

  const submitMutation = useMutation({
    mutationFn: () => {
      const answersPayload = Object.entries(selectedAnswers).map(([qIdx, optIdx]) => ({
        questionIndex: Number(qIdx),
        selectedOptionIndex: optIdx,
      }));
      return learningService.submitPractice(session!._id, answersPayload);
    },
    onSuccess: (res) => {
      setIsSubmitted(true);
      setResultData(res.data.data);
      const score = res.data.data.session.score;

      if (score >= 75) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        toast.success(`Outstanding! Skill mastery updated (+${res.data.data.masteryGain}% gain)`);
      } else {
        toast('Drill completed. Review the model explanations below.', { icon: '📝' });
      }
    },
    onError: () => toast.error('Submission failed'),
  });

  useEffect(() => {
    if (skillName) {
      startMutation.mutate(skillName);
    }
  }, [skillName]);

  if (startMutation.isPending || !session) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const allAnswered = session.questions.length > 0 && Object.keys(selectedAnswers).length === session.questions.length;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="signal" className="font-mono text-xs">
              TARGETED DRILL
            </Badge>
            <Badge tone="default">{session.difficulty}</Badge>
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold text-paper">
            {session.skillName} Practice Station
          </h2>
          <p className="text-xs text-slate-light">
            Targeted mini-quiz & scenario trade-off drills. Directly calibrates your Skill Profile mastery.
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => startMutation.mutate(skillName!)}
          className="gap-1.5 text-xs text-slate-light hover:text-paper"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset Drill
        </Button>
      </div>

      {/* 2. Completion Result Banner */}
      {isSubmitted && resultData && (
        <Card className="text-center py-6 border-signal/30 bg-gradient-to-b from-signal/10 to-ink-800">
          <p className="text-xs uppercase tracking-wider text-signal font-semibold">Drill Performance</p>
          <p className="font-display text-5xl font-bold text-paper mt-1">
            {resultData.session.score}%
          </p>
          <p className="text-xs text-mint font-medium mt-1 flex items-center justify-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> +{resultData.masteryGain}% Mastery Boost Applied to Profile
          </p>

          <div className="mt-4 flex justify-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => startMutation.mutate(skillName!)}
              className="gap-1 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Re-attempt Drill
            </Button>
            <Link to="/skills">
              <Button size="sm" className="gap-1 text-xs shadow-glow">
                Explore Skill Map <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* 3. Questions List */}
      <div className="space-y-6">
        {session.questions.map((q, qIdx) => {
          const selected = selectedAnswers[qIdx];
          const isCorrect = isSubmitted && selected === q.correctOptionIndex;

          return (
            <Card key={qIdx} className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-signal/20 font-mono text-[10px] font-bold text-signal">
                    {qIdx + 1}
                  </span>
                  <Badge tone={q.questionType === 'scenario' ? 'coral' : 'default'} className="text-[10px]">
                    {q.questionType === 'scenario' ? 'Production Scenario' : 'Conceptual Check'}
                  </Badge>
                </div>

                {isSubmitted && (
                  <span className="flex items-center gap-1 text-xs font-semibold">
                    {isCorrect ? (
                      <span className="text-mint flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Correct
                      </span>
                    ) : (
                      <span className="text-coral flex items-center gap-1">
                        <XCircle className="h-4 w-4" /> Incorrect
                      </span>
                    )}
                  </span>
                )}
              </div>

              <p className="font-semibold text-sm text-paper leading-relaxed">{q.prompt}</p>

              {/* Options */}
              <div className="space-y-2 pt-1">
                {q.options.map((opt, optIdx) => {
                  const isOptSelected = selected === optIdx;
                  let optStyle = 'border-neutral/10 bg-ink-700/60 text-slate-light hover:border-neutral/20';

                  if (isSubmitted) {
                    if (optIdx === q.correctOptionIndex) {
                      optStyle = 'border-mint/60 bg-mint/10 text-mint font-semibold';
                    } else if (isOptSelected && !isCorrect) {
                      optStyle = 'border-coral/60 bg-coral/10 text-coral';
                    }
                  } else if (isOptSelected) {
                    optStyle = 'border-signal bg-signal/15 text-signal font-semibold';
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(qIdx, optIdx)}
                      className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-3 ${optStyle}`}
                    >
                      <span className="font-mono text-slate text-[11px] font-bold">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <span className="leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Model Explanation after submit */}
              {isSubmitted && q.modelExplanation && (
                <div className="mt-3 p-3 rounded-xl border border-signal/20 bg-signal/5 text-xs text-signal-soft space-y-1">
                  <div className="flex items-center gap-1 font-semibold text-signal">
                    <Sparkles className="h-3.5 w-3.5" /> Evaluator Explanation
                  </div>
                  <p className="text-[11px] leading-relaxed">{q.modelExplanation}</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* 4. Bottom Submit Button */}
      {!isSubmitted && (
        <div className="flex justify-end pt-4">
          <Button
            size="lg"
            disabled={!allAnswered}
            isLoading={submitMutation.isPending}
            onClick={() => submitMutation.mutate()}
            className="gap-2 shadow-glow"
          >
            Submit Drill & Update Mastery <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
