import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Volume2,
  VolumeX,
  Clock,
  Wifi,
  Shield,
  Bot,
  Sparkles,
  Send,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  LogOut,
  Maximize2,
  Settings,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import SignalBars from '@/components/ui/SignalBars';
import Skeleton from '@/components/ui/Skeleton';
import SystemCheckModal from '@/components/interview/SystemCheckModal';
import InterviewLobby from '@/components/interview/InterviewLobby';
import { useInterviewIntegrity } from '@/hooks/useInterviewIntegrity';
import { useAuth } from '@/context/AuthContext';
import {
  interviewService,
  questionService,
  resultService,
} from '@/services/interviewService';
import type { Question, Interview, InterviewerPersona } from '@/types';

type AIState = 'idle' | 'speaking' | 'listening' | 'processing';

export default function LiveInterviewRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Stage: 'SYSTEM_CHECK' | 'LOBBY' | 'ROOM'
  const [stage, setStage] = useState<'SYSTEM_CHECK' | 'LOBBY' | 'ROOM'>('ROOM');
  const [hasCompletedSystemCheck, setHasCompletedSystemCheck] = useState(false);

  // Interview state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [aiState, setAiState] = useState<AIState>('idle');
  const [submittingTurn, setSubmittingTurn] = useState(false);
  const [isCrossQuestioning, setIsCrossQuestioning] = useState(false);

  // Media Controls
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Timer State
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(1800); // 30 min default
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Confirm Submission Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showLeaveWarningModal, setShowLeaveWarningModal] = useState(false);

  // Adaptive notification
  const [adaptAlert, setAdaptAlert] = useState<{ direction: string; level: string } | null>(null);

  // References
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Non-punitive integrity monitor
  const { tabSwitches, focusLoss, status: integrityStatus } = useInterviewIntegrity(
    stage === 'ROOM' ? id : undefined,
    true
  );

  // Fetch Interview Data
  const { data: interview, isLoading } = useQuery({
    queryKey: ['interview', id],
    queryFn: () => interviewService.get(id!).then((r) => r.data.data.interview),
    enabled: !!id,
  });

  // Initialize questions and timer
  useEffect(() => {
    if (interview) {
      if (interview.questions?.length && questions.length === 0) {
        setQuestions(interview.questions as Question[]);
      }
      if (interview.durationMinutes) {
        setTimeRemainingSeconds(interview.durationMinutes * 60);
      }
    }
  }, [interview]);

  const current = questions[currentIndex];
  const totalQuestions = interview?.numQuestions || questions.length || 5;

  // Intercept accidental tab close / navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (stage === 'ROOM') {
        e.preventDefault();
        e.returnValue = 'Your interview is currently in progress. Leaving now will end the interview and may affect your evaluation.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [stage]);

  // Countdown Timer
  useEffect(() => {
    if (stage !== 'ROOM') return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stage]);

  // Start Camera & Mic Media Streams
  useEffect(() => {
    if (stage === 'ROOM') {
      initMediaStream();
    }
    return () => {
      stopMediaStream();
    };
  }, [stage]);

  const initMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => null);
      }

      // Audio visualizer setup
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateAudioLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(updateAudioLevel);
        };
        updateAudioLevel();
      } catch {
        // audio context fallback
      }
    } catch (err) {
      console.warn('Could not initialize video/audio stream:', err);
    }
  };

  const stopMediaStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
  };

  // Toggle Camera
  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
      }
    }
  };

  // Toggle Mic
  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
      }
    }
  };

  // Text-To-Speech for AI Questions
  const speakQuestion = (text: string, intro?: string) => {
    if (isSpeakerMuted || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    setAiState('speaking');

    const fullUtteranceText = intro ? `${intro} ${text}` : text;
    const utterance = new SpeechSynthesisUtterance(fullUtteranceText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setAiState('idle');
      // Auto-start listening after question is read
      startSpeechRecognition();
    };

    utterance.onerror = () => {
      setAiState('idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  // Auto-speak new question when question changes
  useEffect(() => {
    if (current && stage === 'ROOM') {
      setTranscript('');
      setQuestionStartTime(Date.now());
      speakQuestion(current.text, current.spokenIntro);
    }
  }, [currentIndex, current?._id, stage]);

  // Speech-to-Text Recognition
  const startSpeechRecognition = () => {
    if (isMicMuted) return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    try {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }

      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsRecording(true);
        setAiState('listening');
      };

      rec.onresult = (event: any) => {
        let fullTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
        }
        if (fullTranscript.trim()) {
          setTranscript((prev) => (prev ? `${prev} ${fullTranscript}` : fullTranscript));
        }
      };

      rec.onerror = () => {
        setIsRecording(false);
        setAiState('idle');
      };

      rec.onend = () => {
        setIsRecording(false);
        setAiState('idle');
      };

      speechRecognitionRef.current = rec;
      rec.start();
    } catch {
      setIsRecording(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      speechRecognitionRef.current = null;
    }
    setIsRecording(false);
    setAiState('idle');
  };

  // Request Cross-Questioning Challenge
  const handleCrossQuestion = async () => {
    if (!transcript.trim()) {
      toast.error('Please provide an answer first before requesting cross-examination.');
      return;
    }

    setIsCrossQuestioning(true);
    setAiState('processing');
    try {
      const res = await questionService.crossQuestion(current._id, transcript);
      toast('Interviewer challenged your technical claim!', { icon: '🎯' });

      setQuestions((prev) =>
        prev.map((q, idx) => (idx === currentIndex ? { ...q, turns: res.data.data.turns } : q))
      );

      speakQuestion(res.data.data.crossQuestion, 'Let me challenge that:');
    } catch (err: any) {
      toast.error('Could not generate cross-examination');
      setAiState('idle');
    } finally {
      setIsCrossQuestioning(false);
    }
  };

  // Submit Current Turn Answer & Step Next Question
  const handleNextTurn = async () => {
    if (!transcript.trim()) {
      toast.error('Please answer verbally or type your response before proceeding.');
      return;
    }

    stopSpeechRecognition();
    setSubmittingTurn(true);
    setAiState('processing');

    const timeTakenSeconds = Math.round((Date.now() - questionStartTime) / 1000);

    try {
      await questionService.submitAnswer(current._id, {
        answer: transcript,
        timeTakenSeconds,
      });

      const isLastQuestion = currentIndex + 1 >= totalQuestions;
      if (isLastQuestion) {
        handleFinalSubmit();
        return;
      }

      // Step next adaptive question from backend
      const { data } = await interviewService.next(id!);
      if (data.data.done) {
        handleFinalSubmit();
        return;
      }

      setQuestions((prev) => [...prev, data.data.question]);
      setAdaptAlert({
        direction: data.data.direction,
        level: data.data.newDifficulty,
      });
      setCurrentIndex((i) => i + 1);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit answer turn');
      setAiState('idle');
    } finally {
      setSubmittingTurn(false);
    }
  };

  // Final Assessment Generator
  const finishMutation = useMutation({
    mutationFn: () => resultService.generate(id!),
    onSuccess: () => {
      stopMediaStream();
      toast.success('Interview concluded! Analysis ready.');
      navigate(`/interview/result/${id}`);
    },
    onError: () => toast.error('Could not generate final assessment'),
  });

  const handleFinalSubmit = async () => {
    setAiState('processing');
    setShowSubmitModal(false);
    try {
      await interviewService.complete(id!);
      finishMutation.mutate();
    } catch {
      finishMutation.mutate();
    }
  };

  // Format Time Remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading || (!current && stage === 'ROOM' && !finishMutation.isPending)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-ink-950 text-paper p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <SignalBars className="h-10 text-signal animate-pulse" />
          <h3 className="font-display text-lg font-semibold text-paper">Initializing Live AI Studio...</h3>
          <p className="text-xs text-slate-light font-mono">Calibrating interview context, camera, and question pipeline.</p>
        </div>
      </div>
    );
  }

  // Stage 1: System Check Modal
  if (stage === 'SYSTEM_CHECK') {
    return (
      <SystemCheckModal
        onComplete={() => {
          setHasCompletedSystemCheck(true);
          setStage('LOBBY');
        }}
        onCancel={() => navigate('/dashboard')}
      />
    );
  }

  // Stage 2: Interview Lobby
  if (stage === 'LOBBY' && interview) {
    return (
      <InterviewLobby
        interview={interview}
        userName={user?.name}
        onStart={() => {
          setStage('ROOM');
          interviewService.updateState(id!, 'ACTIVE');
        }}
        onCancel={() => navigate('/dashboard')}
      />
    );
  }

  // Final Evaluation Loading Screen
  if (finishMutation.isPending) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-ink-950 text-paper p-8">
        <div className="flex flex-col items-center gap-6 text-center max-w-md">
          <div className="relative">
            <Bot className="h-16 w-16 text-signal animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-signal/20 blur-xl animate-ping" />
          </div>
          <h2 className="font-display text-2xl font-bold text-paper">Generating Final Evaluation...</h2>
          <div className="space-y-2 text-xs text-slate-light font-mono">
            <p className="flex items-center gap-2 justify-center text-mint">
              <CheckCircle2 className="h-3.5 w-3.5" /> Scoring 8 Category Dimensions
            </p>
            <p className="flex items-center gap-2 justify-center text-mint">
              <CheckCircle2 className="h-3.5 w-3.5" /> Generating Ideal Answer Benchmarks
            </p>
            <p className="flex items-center gap-2 justify-center text-signal animate-pulse">
              <Sparkles className="h-3.5 w-3.5" /> Compiling Personalized Improvement Roadmap...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const persona = interview?.interviewerPersona || 'Professional';
  const isTimeUrgent = timeRemainingSeconds < 300; // less than 5 min

  return (
    <div className="flex h-screen w-screen flex-col bg-ink-950 text-paper overflow-hidden select-none font-sans">
      {/* 1. TOP STATUS & NAVIGATION BAR */}
      <header className="flex h-14 items-center justify-between border-b border-neutral/15 bg-ink-900 px-4 sm:px-6 z-10 flex-shrink-0">
        {/* Left Track & Persona */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-signal/10 px-2.5 py-1 text-signal">
            <span className="h-2 w-2 rounded-full bg-signal animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider">LIVE SESSION</span>
          </div>

          <Badge tone="default" className="hidden sm:inline-flex">
            {interview?.category || 'Technical'} · {interview?.targetRole || 'Software Engineer'}
          </Badge>

          <Badge tone="signal" className="hidden md:inline-flex">
            {current?.difficulty || 'Medium'} Level
          </Badge>
        </div>

        {/* Center Progress & Timer */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-light">
              Question <strong className="text-paper">{currentIndex + 1}</strong> of {totalQuestions}
            </span>
            <div className="h-1.5 w-24 rounded-full bg-neutral/10 overflow-hidden hidden sm:block">
              <div
                className="h-full bg-signal transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          <div
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-mono text-xs font-bold ${
              isTimeUrgent
                ? 'bg-coral/20 text-coral border border-coral/30 animate-pulse'
                : 'bg-ink-800 text-paper border border-neutral/15'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>{formatTime(timeRemainingSeconds)}</span>
          </div>
        </div>

        {/* Right Integrity & Exit Blocking */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 rounded-lg bg-ink-800 px-2.5 py-1 text-xs text-slate-light border border-neutral/10">
            <Shield className="h-3.5 w-3.5 text-mint" />
            <span>Integrity: {integrityStatus}</span>
            {tabSwitches > 0 && <span className="text-coral text-[10px]">({tabSwitches} tabs)</span>}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-mint font-mono bg-mint/10 px-2 py-1 rounded-lg">
            <Wifi className="h-3 w-3" />
            <span>24ms</span>
          </div>
        </div>
      </header>

      {/* 2. MAIN SPLIT INTERVIEW STAGE */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 sm:p-6 overflow-hidden">
        {/* LEFT COLUMN: AI INTERVIEWER (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 h-full overflow-hidden">
          {/* AI Avatar Card */}
          <Card className="relative flex-1 flex flex-col items-center justify-center p-6 bg-ink-900 border-neutral/15 overflow-hidden text-center">
            {/* Animated Ambient Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`rounded-full transition-all duration-700 ${
                  aiState === 'speaking'
                    ? 'h-64 w-64 border border-signal/40 bg-signal/5 animate-ping'
                    : aiState === 'listening'
                    ? 'h-56 w-56 border border-mint/40 bg-mint/5 animate-pulse'
                    : aiState === 'processing'
                    ? 'h-60 w-60 border border-coral/40 bg-coral/5 animate-spin'
                    : 'h-48 w-48 border border-neutral/10 bg-neutral/5'
                }`}
              />
            </div>

            {/* AI Avatar Visual */}
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div
                className={`relative h-28 w-28 sm:h-36 sm:w-36 rounded-3xl p-1 transition-all duration-500 shadow-2xl flex items-center justify-center ${
                  aiState === 'speaking'
                    ? 'bg-gradient-to-tr from-signal via-mint to-signal shadow-glow'
                    : aiState === 'listening'
                    ? 'bg-gradient-to-tr from-mint via-signal to-mint'
                    : aiState === 'processing'
                    ? 'bg-gradient-to-tr from-coral via-signal to-coral'
                    : 'bg-gradient-to-tr from-neutral/20 via-neutral/10 to-neutral/5'
                }`}
              >
                <div className="h-full w-full rounded-[22px] bg-ink-950 flex flex-col items-center justify-center relative overflow-hidden">
                  <Bot
                    className={`h-14 w-14 transition-all duration-300 ${
                      aiState === 'speaking'
                        ? 'text-signal scale-110'
                        : aiState === 'listening'
                        ? 'text-mint scale-105 animate-pulse'
                        : aiState === 'processing'
                        ? 'text-coral animate-spin'
                        : 'text-slate-light'
                    }`}
                  />

                  {/* Visualizer Mouth Bars */}
                  {aiState === 'speaking' && (
                    <div className="absolute bottom-3 flex items-center gap-1">
                      <span className="h-2 w-1.5 bg-signal rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-4 w-1.5 bg-mint rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                      <span className="h-3 w-1.5 bg-signal rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                      <span className="h-5 w-1.5 bg-mint rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="h-2 w-1.5 bg-signal rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      aiState === 'speaking'
                        ? 'bg-signal animate-ping'
                        : aiState === 'listening'
                        ? 'bg-mint animate-pulse'
                        : aiState === 'processing'
                        ? 'bg-coral animate-spin'
                        : 'bg-slate'
                    }`}
                  />
                  <span className="font-display text-sm font-bold tracking-wider text-paper uppercase">
                    {aiState === 'speaking'
                      ? 'AI Interviewer Speaking...'
                      : aiState === 'listening'
                      ? 'Listening to your response...'
                      : aiState === 'processing'
                      ? 'Analyzing technical response...'
                      : 'AI Interviewer Observing'}
                  </span>
                </div>
                <p className="text-xs text-slate-light font-mono">
                  Persona: {persona} · {interview?.company ? `${interview.company} Pattern` : 'Standard Technical'}
                </p>
              </div>
            </div>

            {/* Read Aloud Button */}
            <div className="absolute bottom-3 right-3 z-10">
              <button
                type="button"
                onClick={() => speakQuestion(current?.text, current?.spokenIntro)}
                className="flex items-center gap-1 rounded-lg bg-ink-800/80 px-2.5 py-1 text-[11px] text-slate-light hover:text-paper border border-neutral/15 transition-colors"
                title="Replay Question Audio"
              >
                <Volume2 className="h-3 w-3 text-signal" /> Replay Question
              </button>
            </div>
          </Card>

          {/* Candidate Webcam Preview Window */}
          <Card className="relative h-44 sm:h-52 bg-black/70 border-neutral/15 rounded-2xl overflow-hidden p-0 flex items-center justify-center">
            <video
              ref={videoRef}
              muted
              playsInline
              className={`h-full w-full object-cover -scale-x-100 ${isCameraOff ? 'hidden' : 'block'}`}
            />

            {isCameraOff && (
              <div className="flex flex-col items-center gap-2 text-center p-4">
                <CameraOff className="h-8 w-8 text-slate" />
                <span className="text-xs text-slate-light">Camera Video Muted</span>
              </div>
            )}

            {/* Live Camera Tag & Waveform */}
            <div className="absolute top-2 left-2 flex items-center gap-2 rounded-lg bg-black/70 backdrop-blur-md px-2.5 py-1 border border-neutral/15">
              <span className="h-2 w-2 rounded-full bg-mint animate-pulse" />
              <span className="text-[10px] font-mono text-paper font-semibold">
                {user?.name || 'Candidate'}
              </span>
            </div>

            {/* Live Audio Meter */}
            {!isMicMuted && (
              <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 rounded-lg bg-black/70 backdrop-blur-md px-3 py-1.5 border border-neutral/15">
                <Mic className="h-3.5 w-3.5 text-signal flex-shrink-0" />
                <div className="h-1.5 flex-1 rounded-full bg-neutral/20 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-signal via-mint to-coral transition-all duration-75"
                    style={{ width: `${Math.max(6, audioLevel)}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-light">{audioLevel}%</span>
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: QUESTION & LIVE TRANSCRIPTION (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 h-full overflow-hidden">
          {/* Question Banner */}
          <Card className="p-5 sm:p-6 bg-ink-900 border-neutral/15 space-y-3 flex-shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge tone="signal">{current?.topic || 'Core Concept'}</Badge>
                <span className="text-xs text-slate font-mono">Q{currentIndex + 1}</span>
              </div>
              <Badge tone="default">{current?.difficulty} Tier</Badge>
            </div>

            {/* Spoken conversational transition */}
            {current?.spokenIntro && (
              <p className="text-xs font-mono text-signal/90 italic">
                "{current.spokenIntro}"
              </p>
            )}

            {/* Question Text */}
            <h2 className="font-display text-base sm:text-lg font-bold text-paper leading-snug">
              {current?.text}
            </h2>

            {/* Multi-turn Cross Examination History */}
            {current?.turns && current.turns.length > 1 && (
              <div className="mt-2 space-y-2 rounded-xl bg-ink-950/80 p-3 border border-neutral/10 text-xs">
                <p className="font-mono text-[10px] uppercase font-bold text-signal tracking-wider">
                  Conversation Thread:
                </p>
                {current.turns.slice(1).map((turn, i) => (
                  <div key={i} className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-light">
                      {turn.sender === 'interviewer' ? 'AI Interviewer:' : 'You:'}
                    </span>
                    <p className={turn.sender === 'interviewer' ? 'text-mint' : 'text-paper'}>
                      {turn.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Live Speech-to-Text Transcription & Answer Box */}
          <Card className="flex-1 flex flex-col p-5 bg-ink-900 border-neutral/15 space-y-3 overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral/10 pb-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${isRecording ? 'bg-coral animate-ping' : 'bg-slate'}`} />
                <span className="text-xs font-semibold uppercase tracking-wider text-paper">
                  {isRecording ? 'Live Voice Transcription' : 'Candidate Response'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={isRecording ? stopSpeechRecognition : startSpeechRecognition}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs transition-colors ${
                    isRecording
                      ? 'bg-coral/20 text-coral border border-coral/30'
                      : 'bg-ink-800 text-slate-light hover:text-paper border border-neutral/15'
                  }`}
                >
                  {isRecording ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3 text-signal" />}
                  {isRecording ? 'Pause Mic' : 'Resume Mic'}
                </button>
              </div>
            </div>

            {/* Editable transcript area */}
            <div className="flex-1 overflow-y-auto">
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Speak your answer into the microphone. Live transcription will appear here in real-time, or you can type directly..."
                className="h-full w-full resize-none bg-transparent text-sm text-paper placeholder:text-slate-light/50 focus:outline-none leading-relaxed font-sans"
              />
            </div>

            {/* Answer Control Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral/10 pt-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCrossQuestion}
                  disabled={isCrossQuestioning || submittingTurn || !transcript.trim()}
                  className="text-xs gap-1.5"
                  title="Prompt AI to challenge your answer with deep follow-up questions"
                >
                  <Sparkles className="h-3 w-3 text-signal" />
                  {isCrossQuestioning ? 'Challenging...' : 'Request Follow-Up Challenge'}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="md"
                  onClick={handleNextTurn}
                  disabled={submittingTurn || !transcript.trim()}
                  className="shadow-glow gap-2 text-xs font-bold"
                >
                  {submittingTurn ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Evaluating...
                    </>
                  ) : currentIndex + 1 >= totalQuestions ? (
                    <>
                      Submit & Conclude Interview <CheckCircle2 className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Submit Answer & Next <Send className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* 3. BOTTOM CONTROL DOCK */}
      <footer className="h-16 border-t border-neutral/15 bg-ink-900 px-4 sm:px-6 flex items-center justify-between z-10 flex-shrink-0">
        {/* Left Hardware Controls */}
        <div className="flex items-center gap-2">
          {/* Mic Button */}
          <button
            onClick={toggleMic}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              isMicMuted
                ? 'bg-coral/20 text-coral border border-coral/30'
                : 'bg-ink-800 text-paper hover:bg-neutral/10 border border-neutral/15'
            }`}
            title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMicMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4 text-signal" />}
            <span className="hidden sm:inline">{isMicMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          {/* Camera Button */}
          <button
            onClick={toggleCamera}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              isCameraOff
                ? 'bg-coral/20 text-coral border border-coral/30'
                : 'bg-ink-800 text-paper hover:bg-neutral/10 border border-neutral/15'
            }`}
            title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
          >
            {isCameraOff ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4 text-mint" />}
            <span className="hidden sm:inline">{isCameraOff ? 'Start Video' : 'Stop Video'}</span>
          </button>

          {/* Speaker Button */}
          <button
            onClick={() => {
              if (!isSpeakerMuted && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              setIsSpeakerMuted(!isSpeakerMuted);
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              isSpeakerMuted
                ? 'bg-coral/20 text-coral border border-coral/30'
                : 'bg-ink-800 text-paper hover:bg-neutral/10 border border-neutral/15'
            }`}
            title={isSpeakerMuted ? 'Unmute Speaker Audio' : 'Mute Speaker Audio'}
          >
            {isSpeakerMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-signal" />}
            <span className="hidden sm:inline">{isSpeakerMuted ? 'Muted' : 'Audio On'}</span>
          </button>
        </div>

        {/* Center Session Timer Tag */}
        <div className="hidden md:flex items-center gap-2 rounded-xl bg-ink-950 px-4 py-1.5 border border-neutral/15">
          <Clock className="h-4 w-4 text-signal" />
          <span className="text-xs text-slate-light font-mono">
            Elapsed: {Math.round((Date.now() - startTime) / 60000)}m · Remaining: <strong>{formatTime(timeRemainingSeconds)}</strong>
          </span>
        </div>

        {/* Right Submission Trigger */}
        <div className="flex items-center gap-3">
          <Button
            size="md"
            variant="outline"
            onClick={() => setShowSubmitModal(true)}
            className="border-coral/40 text-coral hover:bg-coral/10 text-xs font-bold gap-1.5"
          >
            <LogOut className="h-4 w-4" /> Submit Interview
          </Button>
        </div>
      </footer>

      {/* 4. CONFIRM SUBMISSION MODAL (ANTI-ABANDONMENT) */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-3xl border border-neutral/15 bg-ink-900 shadow-2xl p-6 sm:p-8 space-y-6 text-center"
            >
              <div className="mx-auto h-14 w-14 rounded-2xl bg-signal/10 flex items-center justify-center text-signal">
                <AlertTriangle className="h-8 w-8" />
              </div>

              <div>
                <h2 className="font-display text-xl font-bold text-paper">
                  Submit & Finalize Interview?
                </h2>
                <p className="mt-2 text-xs text-slate-light">
                  You are about to conclude your live interview session. The AI engine will immediately compile your multi-dimensional evaluation.
                </p>
              </div>

              {/* Status Breakdown */}
              <div className="grid grid-cols-3 gap-2 rounded-xl bg-ink-950 p-3 border border-neutral/10 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate">Answered</span>
                  <p className="font-bold text-mint">{currentIndex + 1}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate">Target</span>
                  <p className="font-bold text-paper">{totalQuestions}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate">Time Used</span>
                  <p className="font-bold text-signal">
                    {Math.round((Date.now() - startTime) / 60000)}m
                  </p>
                </div>
              </div>

              {currentIndex + 1 < totalQuestions && (
                <div className="rounded-xl border border-coral/30 bg-coral/10 p-3 text-xs text-coral text-left">
                  <strong>Notice:</strong> You have {totalQuestions - (currentIndex + 1)} unanswered questions remaining. Submitting now will evaluate you based on completed answers.
                </div>
              )}

              <div className="flex items-center justify-between gap-3 border-t border-neutral/10 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSubmitModal(false)}
                  className="text-xs text-slate hover:text-paper"
                >
                  Continue Interview
                </Button>

                <Button
                  size="md"
                  onClick={handleFinalSubmit}
                  className="bg-coral text-ink-950 hover:bg-coral/90 text-xs font-bold shadow-glow"
                >
                  Yes, Submit & View Results
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
