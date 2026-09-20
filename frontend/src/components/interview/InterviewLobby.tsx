import { useState } from 'react';
import {
  Sparkles,
  Bot,
  Briefcase,
  Clock,
  Shield,
  Layers,
  ArrowRight,
  Video,
  Mic,
  Sliders,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import type { Interview, InterviewerPersona } from '@/types';

interface InterviewLobbyProps {
  interview: Interview;
  userName?: string;
  onStart: () => void;
  onCancel: () => void;
}

const personaDescriptions: Record<InterviewerPersona, { title: string; desc: string; icon: string }> = {
  Professional: {
    title: 'Formal & Structured',
    desc: 'Focuses on structured system design, industry standards, and architectural clarity.',
    icon: '🎯',
  },
  Conversational: {
    title: 'Friendly & Collaborative',
    desc: 'Engaging, supportive tone with natural conversational follow-ups and verbal encouragement.',
    icon: '💬',
  },
  Technical: {
    title: 'Deep-Dive Technical',
    desc: 'Drills deep into low-level mechanics, data structures, concurrency, and time/space complexity.',
    icon: '🧠',
  },
  Strict: {
    title: 'Rigorous & Demanding',
    desc: 'Probes edge cases, challenges unsupported assumptions, and minimizes hints.',
    icon: '🔥',
  },
  HR: {
    title: 'Leadership & Behavioral',
    desc: 'Evaluates team collaboration, conflict resolution, ownership, and the STAR framework.',
    icon: '👔',
  },
};

export default function InterviewLobby({
  interview,
  userName = 'Candidate',
  onStart,
  onCancel,
}: InterviewLobbyProps) {
  const [agreedToRules, setAgreedToRules] = useState(true);

  const personaKey = (interview.interviewerPersona || 'Professional') as InterviewerPersona;
  const persona = personaDescriptions[personaKey] || personaDescriptions.Professional;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl border border-neutral/20 bg-ink-900 shadow-2xl p-6 sm:p-10 space-y-8">
        {/* Header / Avatar Introduction */}
        <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-neutral/10 pb-6 text-center sm:text-left">
          {/* Animated AI Avatar */}
          <div className="relative flex-shrink-0">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-tr from-signal/30 via-mint/20 to-signal/10 p-0.5 shadow-glow flex items-center justify-center">
              <div className="h-full w-full rounded-2xl bg-ink-950 flex flex-col items-center justify-center relative overflow-hidden">
                <Bot className="h-10 w-10 text-signal animate-pulse" />
                <div className="absolute -bottom-1 flex items-center gap-0.5">
                  <span className="h-1 w-2 bg-signal rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1 w-3 bg-mint rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1 w-2 bg-signal rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
            <span className="absolute -top-2 -right-2 rounded-full bg-signal px-2 py-0.5 text-[10px] font-bold text-ink-950 uppercase tracking-wider shadow">
              AI INTERVIEWER
            </span>
          </div>

          {/* Welcome Message */}
          <div className="flex-1 space-y-1">
            <Badge tone="signal" className="mb-1">
              Live AI Interview Studio
            </Badge>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-paper">
              Welcome, {userName.split(' ')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-slate-light max-w-xl">
              I will be your AI interviewer today. This is an adaptive, dynamic session that responds to your answers in real-time.
            </p>
          </div>
        </div>

        {/* Interview Configuration Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-neutral/10 bg-ink-800/60 p-3">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate">Role & Focus</span>
            <p className="mt-1 font-semibold text-paper text-xs sm:text-sm truncate">
              {interview.targetRole || interview.topic || 'Software Engineer'}
            </p>
            {interview.company && (
              <span className="text-[10px] text-signal truncate block">{interview.company} Style</span>
            )}
          </div>

          <div className="rounded-xl border border-neutral/10 bg-ink-800/60 p-3">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate">Track & Diff</span>
            <p className="mt-1 font-semibold text-paper text-xs sm:text-sm">
              {interview.category}
            </p>
            <span className="text-[10px] text-mint">{interview.difficulty} Level</span>
          </div>

          <div className="rounded-xl border border-neutral/10 bg-ink-800/60 p-3">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate">Session Scope</span>
            <p className="mt-1 font-semibold text-paper text-xs sm:text-sm">
              {interview.numQuestions || 5} Questions
            </p>
            <span className="text-[10px] text-slate-light">{interview.durationMinutes || 30} Minutes Target</span>
          </div>

          <div className="rounded-xl border border-neutral/10 bg-ink-800/60 p-3">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate">Persona</span>
            <p className="mt-1 font-semibold text-paper text-xs sm:text-sm flex items-center gap-1">
              <span>{persona.icon}</span> {interview.interviewerPersona || 'Professional'}
            </p>
            <span className="text-[10px] text-slate-light truncate block">{persona.title}</span>
          </div>
        </div>

        {/* Live Interview Ground Rules */}
        <div className="rounded-2xl border border-neutral/15 bg-ink-950/70 p-4 sm:p-5 space-y-3">
          <h3 className="font-display text-xs sm:text-sm font-semibold text-paper uppercase tracking-wider flex items-center gap-2">
            <Shield className="h-4 w-4 text-signal" /> Live Room Guidelines & Anti-Abandonment
          </h3>
          <ul className="space-y-2 text-xs text-slate-light">
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-signal mt-1.5 flex-shrink-0" />
              <span><strong>Camera & Microphone Active:</strong> Keep your camera and mic connected for realistic spoken interaction and transcription.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-signal mt-1.5 flex-shrink-0" />
              <span><strong>Dynamic per-turn questioning:</strong> The AI decides the next topic and difficulty dynamically after each answer.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-signal mt-1.5 flex-shrink-0" />
              <span><strong>No accidental abandonment:</strong> The session cannot be closed via normal back navigation. You must submit or finish the interview.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-signal mt-1.5 flex-shrink-0" />
              <span><strong>Zero recording retention:</strong> Your video stream is rendered strictly live in-browser for visual realism and is not saved to disk.</span>
            </li>
          </ul>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral/10 pt-4">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs text-slate hover:text-paper">
            Back to Dashboard
          </Button>

          <Button
            size="lg"
            onClick={onStart}
            className="w-full sm:w-auto shadow-glow gap-2 text-sm font-bold bg-signal text-ink-950 hover:bg-signal/90"
          >
            <Sparkles className="h-4 w-4 fill-current" />
            START LIVE INTERVIEW NOW <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
