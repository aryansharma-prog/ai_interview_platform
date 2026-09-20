import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Lightbulb,
  ChevronRight,
  Bookmark,
  ArrowUp,
  ArrowDown,
  Terminal,
  MessageSquare,
  Sparkles,
  HelpCircle,
  Cpu,
  Shield,
  Zap,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SignalBars from '@/components/ui/SignalBars';
import Skeleton from '@/components/ui/Skeleton';
import CodeEditor from '@/components/coding/CodeEditor';
import TestResultsPanel from '@/components/coding/TestResultsPanel';
import VoiceSpeechControls from '@/components/interview/VoiceSpeechControls';
import { useInterviewIntegrity } from '@/hooks/useInterviewIntegrity';
import {
  interviewService,
  questionService,
  resultService,
  codeService,
} from '@/services/interviewService';
import type { Question, ExecutionResults, ComplexityAnalysis } from '@/types';

type AdaptEvent = { direction: 'up' | 'down' | 'same'; from: string; to: string } | null;

export default function InterviewSession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [generatingNext, setGeneratingNext] = useState(false);
  const [adaptEvent, setAdaptEvent] = useState<AdaptEvent>(null);

  // Coding Studio states
  const [activeTab, setActiveTab] = useState<'text' | 'code'>('text');
  const [candidateCode, setCandidateCode] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [executionResults, setExecutionResults] = useState<ExecutionResults | null>(null);
  const [complexityAnalysis, setComplexityAnalysis] = useState<ComplexityAnalysis | null>(null);

  // Cross-Questioning multi-turn state
  const [isCrossQuestioning, setIsCrossQuestioning] = useState(false);

  // Integrity Monitoring Hook
  const { tabSwitches, focusLoss, status: integrityStatus } = useInterviewIntegrity(id, true);

  const { data: interview, isLoading } = useQuery({
    queryKey: ['interview', id],
    queryFn: () => interviewService.get(id!).then((r) => r.data.data.interview),
    enabled: !!id,
  });

  // Seed question list
  useEffect(() => {
    if (interview?.questions?.length && questions.length === 0) {
      const qList = interview.questions as Question[];
      setQuestions(qList);
      if (qList[0]?.questionType === 'coding' || interview.interviewType === 'coding') {
        setActiveTab('code');
        setCandidateCode(qList[0]?.starterCode || '// Write your algorithmic solution here\n');
      }
    }
  }, [interview]);

  const current = questions[currentIndex];
  const totalQuestions = interview?.numQuestions ?? questions.length;

  useEffect(() => {
    setStartTime(Date.now());
    setAnswer('');
    setShowHint(false);
    setExecutionResults(null);
    setComplexityAnalysis(null);

    if (current?.questionType === 'coding' || interview?.interviewType === 'coding') {
      setActiveTab('code');
      setCandidateCode(current?.starterCode || '// Write your solution here\n');
    } else {
      setActiveTab('text');
    }
  }, [currentIndex, current]);

  const finishMutation = useMutation({
    mutationFn: () => resultService.generate(id!),
    onSuccess: () => {
      toast.success('Interview concluded! Generating multi-dimensional assessment...');
      navigate(`/interview/result/${id}`);
    },
    onError: () => toast.error('Could not generate final result'),
  });

  // Run Code in Sandbox
  const handleRunCode = async () => {
    if (!candidateCode.trim()) {
      toast.error('Please write some code before running tests.');
      return;
    }
    setIsRunningCode(true);
    try {
      const res = await codeService.run({
        questionId: current?._id,
        candidateCode,
        language: codeLanguage,
        testCases: current?.testCases,
      });

      setExecutionResults(res.data.data.executionResults);
      setComplexityAnalysis(res.data.data.complexityAnalysis);

      if (res.data.data.executionResults.passed) {
        toast.success('All test cases passed!');
      } else {
        toast.error('Some test cases failed. Check output.');
      }
    } catch (err: any) {
      toast.error('Execution failed in sandbox');
    } finally {
      setIsRunningCode(false);
    }
  };

  // Request Cross-Question Challenge
  const handleRequestCrossQuestion = async () => {
    const candidateResponse = activeTab === 'code' ? candidateCode : answer;
    if (!candidateResponse.trim()) {
      toast.error('Please provide an initial answer or approach before requesting a cross-examination follow-up.');
      return;
    }

    setIsCrossQuestioning(true);
    try {
      const res = await questionService.crossQuestion(current._id, candidateResponse);
      toast('Interviewer challenged your technical claim!', { icon: '🎯' });

      // Update question's turns locally
      setQuestions((prev) =>
        prev.map((q, idx) => (idx === currentIndex ? { ...q, turns: res.data.data.turns } : q))
      );
    } catch (err: any) {
      toast.error('Could not generate cross-question');
    } finally {
      setIsCrossQuestioning(false);
    }
  };

  // Submit Answer & Step Adaptive Next Question
  const handleSubmit = async () => {
    const finalAnswer = activeTab === 'code' ? candidateCode : answer;
    if (!finalAnswer.trim()) {
      toast.error('Please provide an answer or code solution before submitting.');
      return;
    }

    setSubmitting(true);
    const timeTakenSeconds = Math.round((Date.now() - startTime) / 1000);

    try {
      await questionService.submitAnswer(current._id, {
        answer: finalAnswer,
        timeTakenSeconds,
        testResults: executionResults,
        codeLanguage,
      });

      const isLastSlot = currentIndex + 1 >= totalQuestions;
      if (isLastSlot) {
        await interviewService.complete(id!);
        finishMutation.mutate();
        return;
      }

      setSubmitting(false);
      setGeneratingNext(true);

      const { data } = await interviewService.next(id!);
      if (data.data.done) {
        await interviewService.complete(id!);
        finishMutation.mutate();
        return;
      }

      setQuestions((prev) => [...prev, data.data.question]);
      setAdaptEvent({
        direction: data.data.direction,
        from: data.data.previousDifficulty,
        to: data.data.newDifficulty,
      });
      setCurrentIndex((i) => i + 1);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
      setGeneratingNext(false);
    }
  };

  if (isLoading || (!current && !generatingNext)) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (generatingNext || !current) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 py-32 text-center">
        <SignalBars className="h-12 text-signal" />
        <h3 className="font-display text-lg font-semibold text-paper">
          Analyzing your response & calibrating difficulty...
        </h3>
        <p className="font-mono text-xs text-slate-light max-w-md">
          The AI engine is adapting the next technical round based on your accuracy, trade-offs, and claims.
        </p>
      </div>
    );
  }

  const isCodingQuestion = current.questionType === 'coding' || interview?.interviewType === 'coding';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-signal">
            <SignalBars className="h-4" />
            <span className="font-mono text-xs font-semibold tracking-wider">LIVE ADAPTIVE ENGINE</span>
          </div>
          <Badge tone="default">
            Question {currentIndex + 1} of {totalQuestions}
          </Badge>
          <Badge tone="signal">{current.difficulty} Level</Badge>
        </div>

        {/* Proctoring Integrity & Voice */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-light bg-ink-800 px-3 py-1 rounded-lg border border-neutral/10">
            <Shield className="h-3.5 w-3.5 text-mint" />
            <span>Integrity: {integrityStatus}</span>
            {tabSwitches > 0 && <span className="text-coral text-[10px]">({tabSwitches} tabs)</span>}
          </div>

          <VoiceSpeechControls
            questionText={current.text}
            onTranscript={(text) => setAnswer((prev) => (prev ? `${prev} ${text}` : text))}
          />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral/5">
        <div
          className="h-full bg-signal transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Adaptive Level Change Notification */}
      <AnimatePresence>
        {adaptEvent && adaptEvent.direction !== 'same' && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-medium ${
              adaptEvent.direction === 'up'
                ? 'border-mint/20 bg-mint/10 text-mint'
                : 'border-coral/20 bg-coral/10 text-coral'
            }`}
          >
            {adaptEvent.direction === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            {adaptEvent.direction === 'up'
              ? `Strong technical demonstration — stepping up to ${adaptEvent.to} level questions`
              : `Calibrating back to ${adaptEvent.to} to test foundational mechanics`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Question & Conversation Thread */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge tone="signal">{current.topic || interview?.category}</Badge>
                {current.claimChallenged && (
                  <Badge tone="coral" className="truncate max-w-[200px]">
                    Claim: {current.claimChallenged}
                  </Badge>
                )}
              </div>
              <button
                onClick={() => questionService.toggleBookmark(current._id)}
                className="text-slate-light hover:text-signal transition-colors p-1"
                title="Bookmark question"
              >
                <Bookmark className="h-4 w-4" />
              </button>
            </div>

            {/* Question Text */}
            <div className="p-3.5 rounded-xl bg-ink-700/60 border border-neutral/10">
              <p className="font-display text-base font-semibold leading-relaxed text-paper">
                {current.text}
              </p>
            </div>

            {/* Hints Section */}
            {showHint && current.hints?.length > 0 && (
              <div className="rounded-xl border border-signal/20 bg-signal/5 p-3 text-xs text-signal-soft space-y-1">
                <div className="flex items-center gap-1 font-semibold text-signal">
                  <Lightbulb className="h-3.5 w-3.5" /> Architectural Hint
                </div>
                <p>{current.hints[0]}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setShowHint((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-slate-light hover:text-signal transition-colors"
              >
                <Lightbulb className="h-3.5 w-3.5" /> {showHint ? 'Hide hint' : 'Show hint'}
              </button>

              <button
                onClick={handleRequestCrossQuestion}
                disabled={isCrossQuestioning}
                className="flex items-center gap-1.5 text-xs text-signal hover:underline disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {isCrossQuestioning ? 'Analyzing claim...' : 'Challenge My Claim'}
              </button>
            </div>
          </Card>

          {/* Conversation & Cross-Questioning History */}
          {current.turns && current.turns.length > 1 && (
            <Card className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate uppercase tracking-wider">
                <MessageSquare className="h-3.5 w-3.5 text-signal" /> Live Cross-Questioning Thread
              </div>
              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {current.turns.map((turn, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl text-xs ${
                      turn.sender === 'interviewer'
                        ? 'bg-signal/5 border border-signal/20 text-paper'
                        : 'bg-ink-700 border border-neutral/10 text-slate-light'
                    }`}
                  >
                    <span className="block font-semibold text-[10px] text-slate mb-0.5">
                      {turn.sender === 'interviewer' ? 'AI Senior Interviewer' : 'Your Response'}
                    </span>
                    <p className="leading-relaxed">{turn.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN: Candidate Studio (Text vs Code) */}
        <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 p-1 bg-ink-800 rounded-xl border border-neutral/10 text-xs">
              <button
                onClick={() => setActiveTab('text')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'text'
                    ? 'bg-signal/20 text-signal font-semibold'
                    : 'text-slate-light hover:text-paper'
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" /> Structured Explanation
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'code'
                    ? 'bg-signal/20 text-signal font-semibold'
                    : 'text-slate-light hover:text-paper'
                }`}
              >
                <Terminal className="h-3.5 w-3.5" /> Code Studio & Tests
              </button>
            </div>

            <span className="text-[11px] text-slate font-mono">
              {activeTab === 'code' ? 'Sandbox Runner Active' : 'Speech / Text Mode'}
            </span>
          </div>

          {/* Tab 1: Code Studio */}
          {activeTab === 'code' ? (
            <div className="space-y-4">
              <CodeEditor
                initialCode={candidateCode}
                language={codeLanguage}
                onCodeChange={(c) => setCandidateCode(c)}
                onRunCode={handleRunCode}
                isRunning={isRunningCode}
              />
              <TestResultsPanel
                executionResults={executionResults}
                complexityAnalysis={complexityAnalysis}
                isLoading={isRunningCode}
              />
            </div>
          ) : (
            /* Tab 2: Text Explanation */
            <Card className="flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-light flex items-center justify-between">
                  <span>Candidate Response</span>
                  <span className="text-[10px] text-slate font-normal">
                    Tip: Structure with Approach, Trade-Offs, and Concrete Examples
                  </span>
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={12}
                  placeholder="Articulate your engineering response here. Describe internal mechanics, trade-offs, and failure mode mitigations..."
                  className="w-full resize-none rounded-xl border border-neutral/10 bg-ink-700 p-4 text-sm text-paper placeholder:text-slate outline-none focus:border-signal/60 font-sans leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate pt-2 border-t border-neutral/10">
                <span>Words: {answer.trim() ? answer.trim().split(/\s+/).length : 0}</span>
                <span className="text-signal-soft">Live evaluation triggers upon submit</span>
              </div>
            </Card>
          )}

          {/* Submission Bar */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="secondary"
              onClick={handleRequestCrossQuestion}
              isLoading={isCrossQuestioning}
              className="gap-1.5 text-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-signal" /> Request Interviewer Challenge
            </Button>

            <Button
              onClick={handleSubmit}
              isLoading={submitting || finishMutation.isPending}
              size="lg"
              className="gap-2 shadow-glow"
            >
              {currentIndex + 1 < totalQuestions ? 'Submit & Adapt Next Round' : 'Finish Mock Simulation'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
