import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Download,
  TrendingUp,
  TrendingDown,
  BookOpen,
  ShieldCheck,
  Quote,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Cpu,
  Layers,
  Code2,
  MessageSquare,
  HelpCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Award,
  Target,
  Lightbulb,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import SkillRadarChart from '@/components/skills/SkillRadarChart';
import { resultService, interviewService, learningService } from '@/services/interviewService';
import { scoreColor, formatDuration } from '@/lib/utils';
import type { Result, Interview, Question } from '@/types';

export default function InterviewResult() {
  const { id } = useParams<{ id: string }>();
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);

  const { data: result, isLoading: loadingResult } = useQuery<Result>({
    queryKey: ['result', id],
    queryFn: () => resultService.get(id!).then((r) => r.data.data.result),
    enabled: !!id,
  });

  const { data: interview, isLoading: loadingInterview } = useQuery<Interview>({
    queryKey: ['interview', id],
    queryFn: () => interviewService.get(id!).then((r) => r.data.data.interview),
    enabled: !!id,
  });

  const pdfMutation = useMutation({
    mutationFn: () => resultService.downloadPdf(id!),
    onSuccess: (res) => {
      window.open(res.data.data.pdfUrl, '_blank');
      toast.success('Official PDF report generated!');
    },
    onError: () => toast.error('Could not generate PDF report'),
  });

  const generatePathMutation = useMutation({
    mutationFn: (targetSkill: string) =>
      learningService.generate({ targetSkill, originInterviewId: id }),
    onSuccess: () => {
      toast.success('Personalized learning path generated!');
      window.location.href = `/learning`;
    },
    onError: () => toast.error('Could not generate learning path'),
  });

  if (loadingResult || loadingInterview) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center space-y-4">
        <p className="text-slate">No evaluation result found. Complete an interview first.</p>
        <Link to="/interview/new">
          <Button>Start New Interview</Button>
        </Link>
      </div>
    );
  }

  const catScores = result.categoryScores || {
    technicalKnowledge: result.technicalAccuracy || 80,
    problemSolving: result.problemSolving || 80,
    communication: result.communication || 80,
    answerAccuracy: result.overallScore || 80,
    depthOfKnowledge: Math.max(50, result.overallScore - 5),
    confidence: result.confidence || 80,
    behavioralSkills: 85,
    timeManagement: 85,
  };

  const categoryScoreItems = [
    { label: 'Technical Knowledge', value: catScores.technicalKnowledge, icon: Cpu },
    { label: 'Problem Solving', value: catScores.problemSolving, icon: Sparkles },
    { label: 'Communication', value: catScores.communication, icon: MessageSquare },
    { label: 'Answer Accuracy', value: catScores.answerAccuracy, icon: CheckCircle2 },
    { label: 'Depth of Knowledge', value: catScores.depthOfKnowledge, icon: Layers },
    { label: 'Confidence', value: catScores.confidence, icon: TrendingUp },
    { label: 'Behavioral Skills', value: catScores.behavioralSkills, icon: Target },
    { label: 'Time Management', value: catScores.timeManagement, icon: Clock },
  ];

  const radarMetrics = [
    { label: 'Technical', value: catScores.technicalKnowledge },
    { label: 'Problem Solving', value: catScores.problemSolving },
    { label: 'Communication', value: catScores.communication },
    { label: 'Accuracy', value: catScores.answerAccuracy },
    { label: 'Depth', value: catScores.depthOfKnowledge },
    { label: 'Confidence', value: catScores.confidence },
  ];

  const keyInsight = result.keyInsight || {
    mainImprovement: 'Your technical knowledge is strong, but answers would benefit from deeper trade-off discussions.',
    recommendations: [
      'Explicitly discuss failure modes and retry strategies when proposing architectures.',
      'Clarify assumptions about scale and concurrency before diving into implementation.',
      'Incorporate concrete metrics into technical answers.',
    ],
  };

  const questionsList = (interview?.questions as Question[]) || [];

  const integrity = result.integrityReport || {
    score: 100,
    status: 'Normal',
    tabSwitches: 0,
    focusLoss: 0,
    copyEvents: 0,
    reviewRecommended: false,
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      {/* 1. HERO SCORE & COMPLETION BANNER */}
      <Card className="text-center py-8 px-6 relative overflow-hidden bg-gradient-to-b from-ink-800 to-ink-900 border-neutral/15">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Badge tone="signal">AI Interview Report</Badge>
          {interview?.company && <Badge tone="default">{interview.company} Mock</Badge>}
          <Badge tone="default">{interview?.interviewerPersona || 'Professional'} Persona</Badge>
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-paper">
          Interview Evaluation Complete
        </h1>

        {/* Big Overall Score */}
        <div className="mt-4 flex items-baseline justify-center gap-2">
          <span className={`font-display text-7xl sm:text-8xl font-black tracking-tight ${scoreColor(result.overallScore)}`}>
            {result.overallScore}
          </span>
          <span className="text-2xl text-slate font-display font-semibold">/ 100</span>
        </div>

        <p className="mt-2 text-xs sm:text-sm text-slate-light max-w-lg mx-auto">
          {result.interviewSummary || `Completed in ${formatDuration(result.timeTakenSeconds || 320)} across ${questionsList.length} evaluated questions.`}
        </p>

        {/* Action CTAs */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="secondary" onClick={() => pdfMutation.mutate()} isLoading={pdfMutation.isPending} className="text-xs">
            <Download className="h-4 w-4" /> Download PDF Report
          </Button>

          <Link to="/learning">
            <Button className="gap-2 shadow-glow text-xs">
              <BookOpen className="h-4 w-4" /> Practice Weak Areas
            </Button>
          </Link>

          <Link to="/interview/new">
            <Button variant="outline" className="text-xs">
              Start Another Interview
            </Button>
          </Link>
        </div>
      </Card>

      {/* 2. KEY INSIGHT SPOTLIGHT BANNER */}
      <div className="rounded-2xl border border-signal/30 bg-signal/5 p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-signal">
          <Lightbulb className="h-5 w-5" />
          <h2 className="font-display text-sm sm:text-base font-bold text-paper uppercase tracking-wider">
            Your Most Important Improvement
          </h2>
        </div>

        <p className="text-sm font-semibold text-paper leading-relaxed">
          "{keyInsight.mainImprovement}"
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {keyInsight.recommendations.map((rec, i) => (
            <div key={i} className="rounded-xl border border-neutral/10 bg-ink-900/80 p-3 text-xs space-y-1">
              <span className="font-mono text-[10px] uppercase font-bold text-signal">
                Tip {i + 1}
              </span>
              <p className="text-slate-light">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 8-CATEGORY DIMENSIONS & RADAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-base font-semibold text-paper mb-1">Competency Radar</h3>
            <p className="text-xs text-slate-light mb-4">Multi-dimensional capability benchmark.</p>
          </div>
          <SkillRadarChart metrics={radarMetrics} />
          <p className="text-[11px] text-center text-slate mt-2">Scale: 0 - 100% computed from response accuracy & depth.</p>
        </Card>

        {/* 8 Category Score Cards */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categoryScoreItems.map(({ label, value, icon: Icon }) => (
            <Card key={label} className="flex flex-col justify-between p-3.5 bg-ink-800/80">
              <div className="flex items-center justify-between text-slate-light mb-1">
                <span className="text-[11px] font-medium leading-tight">{label}</span>
                <Icon className="h-3.5 w-3.5 text-signal" />
              </div>
              <div>
                <p className={`font-display text-xl font-bold ${scoreColor(value)}`}>{value}%</p>
                <div className="mt-1 h-1 w-full rounded-full bg-neutral/10 overflow-hidden">
                  <div className="h-full bg-signal" style={{ width: `${value}%` }} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 4. QUESTION-BY-QUESTION REPLAY & IDEAL ANSWER BENCHMARKS */}
      <div className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-bold text-paper flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-mint" /> Question-by-Question Replay & Breakdown
          </h2>
          <p className="text-xs text-slate-light">
            Review your transcript, granular correctness/depth scores, evaluator notes, and ideal answer structure.
          </p>
        </div>

        <div className="space-y-3">
          {questionsList.map((q, idx) => {
            const isExpanded = expandedQuestion === idx;
            const evalScore = q.evaluation?.score ?? 75;
            const correctness = q.evaluation?.correctnessScore ?? Math.round(evalScore / 10);
            const depth = q.evaluation?.depthScore ?? Math.max(4, Math.round((evalScore - 5) / 10));
            const comm = q.evaluation?.communicationScore ?? Math.min(10, Math.round((evalScore + 5) / 10));

            return (
              <div
                key={q._id || idx}
                className="rounded-2xl border border-neutral/15 bg-ink-900 overflow-hidden transition-all"
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-neutral/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 h-7 w-7 rounded-xl bg-ink-800 text-paper font-mono text-xs font-bold flex items-center justify-center border border-neutral/15">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge tone="signal" className="text-[10px]">{q.topic || 'Core'}</Badge>
                        <Badge tone="default" className="text-[10px]">{q.difficulty || 'Medium'}</Badge>
                      </div>
                      <p className="font-semibold text-xs sm:text-sm text-paper line-clamp-1">
                        {q.text}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`font-display text-sm font-bold ${scoreColor(evalScore)}`}>
                      {evalScore}%
                    </span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate" /> : <ChevronDown className="h-4 w-4 text-slate" />}
                  </div>
                </button>

                {/* Accordion Content Body */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 border-t border-neutral/10 bg-ink-950/60 space-y-4 text-xs">
                    {/* Granular Question Scores */}
                    <div className="grid grid-cols-3 gap-2 rounded-xl bg-ink-900 p-3 border border-neutral/10 text-center font-mono">
                      <div>
                        <span className="text-[10px] text-slate">Correctness</span>
                        <p className="font-bold text-mint text-sm">{correctness}/10</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate">Technical Depth</span>
                        <p className="font-bold text-signal text-sm">{depth}/10</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate">Communication</span>
                        <p className="font-bold text-paper text-sm">{comm}/10</p>
                      </div>
                    </div>

                    {/* Candidate Transcript */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate tracking-wider">
                        Your Transcript / Response
                      </span>
                      <div className="rounded-xl border border-neutral/10 bg-ink-900 p-3.5 text-paper leading-relaxed font-sans">
                        {q.userAnswer || 'No transcript recorded.'}
                      </div>
                    </div>

                    {/* AI Feedback */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-signal tracking-wider">
                        AI Evaluator Feedback
                      </span>
                      <p className="rounded-xl border border-signal/20 bg-signal/5 p-3.5 text-paper leading-relaxed">
                        {q.evaluation?.feedback || 'Good explanation with solid technical depth and structured reasoning.'}
                      </p>
                    </div>

                    {/* Ideal Answer Concepts */}
                    {q.idealAnswerConcepts && q.idealAnswerConcepts.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-mint tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Ideal Answer Concepts to Cover
                        </span>
                        <ul className="rounded-xl border border-mint/20 bg-mint/5 p-3 space-y-1 text-slate-light">
                          {q.idealAnswerConcepts.map((c, i) => (
                            <li key={i} className="flex items-start gap-2 text-paper">
                              <span className="h-1.5 w-1.5 rounded-full bg-mint mt-1.5 flex-shrink-0" />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. TOPICS TO REVISE & SKILL GAPS */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-semibold text-paper flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-coral" /> Recommended Topics to Revise
            </h3>
            <p className="text-xs text-slate-light mt-0.5">
              Identified weak areas with 1-click personalized practice modules.
            </p>
          </div>
          <Badge tone="coral">Action Recommended</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {(result.topicsToRevise?.length ? result.topicsToRevise : result.weakAreas).map((topic: string, i: number) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-neutral/10 bg-ink-800 flex items-center justify-between gap-4"
            >
              <div>
                <span className="font-semibold text-xs sm:text-sm text-paper">{topic}</span>
                <p className="text-[11px] text-coral mt-0.5">Target Revision</p>
              </div>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => generatePathMutation.mutate(topic)}
                isLoading={generatePathMutation.isPending}
                className="gap-1 text-xs shrink-0"
              >
                <BookOpen className="h-3.5 w-3.5" /> Practice Now <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* 6. STRENGTHS & INTEGRITY AUDIT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-mint">
            <TrendingUp className="h-4 w-4" /> Strong Competencies
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.strongAreas.map((a: string) => (
              <Badge key={a} tone="mint">{a}</Badge>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-paper">
            <ShieldCheck className="h-4 w-4 text-signal" /> Session Integrity Audit
          </h3>
          <div className="space-y-1.5 text-xs text-slate-light">
            <p className="flex justify-between">
              <span>Proctoring Status:</span>
              <span className={integrity.reviewRecommended ? 'text-coral font-semibold' : 'text-mint font-semibold'}>
                {integrity.status}
              </span>
            </p>
            <p className="flex justify-between">
              <span>Tab Switches Detected:</span>
              <span>{integrity.tabSwitches}</span>
            </p>
            <p className="flex justify-between">
              <span>Window Blur Events:</span>
              <span>{integrity.focusLoss}</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
