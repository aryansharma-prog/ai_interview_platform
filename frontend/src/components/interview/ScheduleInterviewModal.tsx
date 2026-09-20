import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Calendar,
  Clock,
  Briefcase,
  Building,
  Sparkles,
  X,
  Bot,
  Layers,
  ArrowRight,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { interviewService } from '@/services/interviewService';
import type { InterviewCategory, Difficulty, InterviewerPersona } from '@/types';

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const companies = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Netflix', 'Uber', 'Stripe', 'Adobe', 'Standard Mock'];

const categories: { id: InterviewCategory; label: string }[] = [
  { id: 'Technical', label: 'Technical Core' },
  { id: 'DSA', label: 'DSA & Algorithms' },
  { id: 'System Design', label: 'System Design' },
  { id: 'Behavioral', label: 'Behavioral & Leadership' },
  { id: 'HR', label: 'HR & Culture Fit' },
  { id: 'Resume Based', label: 'Resume Deep Dive' },
  { id: 'DBMS', label: 'Database & SQL' },
  { id: 'OS', label: 'Operating Systems' },
  { id: 'CN', label: 'Computer Networks' },
  { id: 'OOP', label: 'OOP & Architecture' },
];

const personas: { id: InterviewerPersona; label: string; icon: string }[] = [
  { id: 'Professional', label: 'Professional (Structured & Formal)', icon: '🎯' },
  { id: 'Conversational', label: 'Conversational (Collaborative & Friendly)', icon: '💬' },
  { id: 'Technical', label: 'Technical Deep Dive (Low-Level & Big-O)', icon: '🧠' },
  { id: 'Strict', label: 'Strict (Rigorous & Edge-Cases)', icon: '🔥' },
  { id: 'HR', label: 'HR / Leadership (STAR Method)', icon: '👔' },
];

export default function ScheduleInterviewModal({ isOpen, onClose }: ScheduleInterviewModalProps) {
  const queryClient = useQueryClient();

  const [company, setCompany] = useState('Google');
  const [targetRole, setTargetRole] = useState('Senior Backend Engineer');
  const [category, setCategory] = useState<InterviewCategory>('Technical');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [interviewerPersona, setInterviewerPersona] = useState<InterviewerPersona>('Professional');

  // Tomorrow morning default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const defaultIso = tomorrow.toISOString().slice(0, 16);

  const [scheduledAt, setScheduledAt] = useState(defaultIso);

  const scheduleMutation = useMutation({
    mutationFn: () =>
      interviewService.schedule({
        category,
        topic: `${company} ${targetRole}`,
        difficulty,
        numQuestions,
        company,
        targetRole,
        interviewerPersona,
        durationMinutes,
        scheduledAt: new Date(scheduledAt).toISOString(),
      }),
    onSuccess: () => {
      toast.success('Interview successfully scheduled! Check your dashboard countdown.');
      queryClient.invalidateQueries({ queryKey: ['scheduled-interviews'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-interviews'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to schedule interview');
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl border border-neutral/15 bg-ink-900 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-signal/10 p-2 text-signal">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-paper">Schedule AI Mock Interview</h2>
              <p className="text-xs text-slate-light">
                Book a future session with real-time countdown & hardware reminders.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate hover:bg-neutral/10 hover:text-paper"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Controls */}
        <div className="space-y-4 text-xs">
          {/* Target Company & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-light mb-1">Target Company Pattern</label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-xl border border-neutral/15 bg-ink-800 px-3 py-2 text-xs text-paper focus:border-signal focus:outline-none"
              >
                {companies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-light mb-1">Target Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full rounded-xl border border-neutral/15 bg-ink-800 px-3 py-2 text-xs text-paper focus:border-signal focus:outline-none"
              />
            </div>
          </div>

          {/* Date & Time Picker */}
          <div>
            <label className="block font-medium text-slate-light mb-1 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-signal" /> Scheduled Date & Time
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full rounded-xl border border-neutral/15 bg-ink-800 px-3 py-2 text-xs text-paper focus:border-signal focus:outline-none"
            />
          </div>

          {/* Category & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-light mb-1">Interview Track</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as InterviewCategory)}
                className="w-full rounded-xl border border-neutral/15 bg-ink-800 px-3 py-2 text-xs text-paper focus:border-signal focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-light mb-1">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full rounded-xl border border-neutral/15 bg-ink-800 px-3 py-2 text-xs text-paper focus:border-signal focus:outline-none"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Adaptive">Adaptive (Auto-scales)</option>
              </select>
            </div>
          </div>

          {/* Duration & Persona */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-light mb-1">Duration & Questions</label>
              <select
                value={durationMinutes}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setDurationMinutes(val);
                  setNumQuestions(val <= 15 ? 5 : val <= 30 ? 5 : 10);
                }}
                className="w-full rounded-xl border border-neutral/15 bg-ink-800 px-3 py-2 text-xs text-paper focus:border-signal focus:outline-none"
              >
                <option value={15}>15 Minutes (5 Questions Quick)</option>
                <option value={30}>30 Minutes (5-7 Questions Standard)</option>
                <option value={45}>45 Minutes (10 Questions In-Depth)</option>
                <option value={60}>60 Minutes (15 Questions Comprehensive)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-light mb-1">Interviewer Persona</label>
              <select
                value={interviewerPersona}
                onChange={(e) => setInterviewerPersona(e.target.value as InterviewerPersona)}
                className="w-full rounded-xl border border-neutral/15 bg-ink-800 px-3 py-2 text-xs text-paper focus:border-signal focus:outline-none"
              >
                {personas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.icon} {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 border-t border-neutral/10 pt-4">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs text-slate hover:text-paper">
            Cancel
          </Button>
          <Button
            size="md"
            onClick={() => scheduleMutation.mutate()}
            disabled={scheduleMutation.isPending || !scheduledAt}
            className="shadow-glow gap-1.5 text-xs font-semibold"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {scheduleMutation.isPending ? 'Scheduling...' : 'Confirm Schedule'}
          </Button>
        </div>
      </div>
    </div>
  );
}
