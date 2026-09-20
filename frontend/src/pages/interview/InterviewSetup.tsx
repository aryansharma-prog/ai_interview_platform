import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Code2,
  Boxes,
  Database,
  Cpu,
  Network,
  Layers,
  MessageSquare,
  FileText,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Briefcase,
  AlertCircle,
  Terminal,
  Video,
  Bot,
  Clock,
  Flame,
  Target,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { interviewService, resumeService, jdService } from '@/services/interviewService';
import type {
  InterviewCategory,
  Difficulty,
  InterviewMode,
  InterviewType,
  InterviewerPersona,
  JobProfile,
} from '@/types';

const categories: { id: InterviewCategory; label: string; icon: any; desc: string }[] = [
  { id: 'Technical', label: 'Technical Core', icon: Cpu, desc: 'Full-stack engineering, clean code, web mechanics' },
  { id: 'DSA', label: 'DSA & Algorithms', icon: Code2, desc: 'Algorithmic problem solving & complexity analysis' },
  { id: 'System Design', label: 'System Design', icon: Layers, desc: 'Distributed systems, caching, architecture, scaling' },
  { id: 'Behavioral', label: 'Behavioral & Leadership', icon: Users, desc: 'STAR method, conflict resolution, project impact' },
  { id: 'HR', label: 'HR & Culture Fit', icon: MessageSquare, desc: 'Workplace culture, leadership principles, collaboration' },
  { id: 'Mixed', label: 'Mixed Comprehensive', icon: Sparkles, desc: 'Balanced combination of technical and behavioral rounds' },
  { id: 'Company-specific', label: 'Company-Specific Mock', icon: Briefcase, desc: 'Patterns inspired by Google, Amazon, Meta, and Stripe' },
  { id: 'Resume Based', label: 'Resume Deep Dive', icon: FileText, desc: 'Scrutinizes actual project claims and tech stack' },
  { id: 'DBMS', label: 'Database & Storage', icon: Database, desc: 'SQL/NoSQL, indexing, transaction ACID, sharding' },
  { id: 'OS', label: 'Operating Systems', icon: Cpu, desc: 'Concurrency, memory management, threads, processes' },
  { id: 'CN', label: 'Computer Networks', icon: Network, desc: 'TCP/IP, HTTP/3, DNS, latency, network protocols' },
  { id: 'OOP', label: 'OOP & Architecture', icon: Boxes, desc: 'Design patterns, SOLID principles, clean code' },
];

const personas: { id: InterviewerPersona; label: string; icon: string; desc: string }[] = [
  { id: 'Professional', label: 'Professional', icon: '🎯', desc: 'Structured, formal, and precise technical questioning.' },
  { id: 'Conversational', label: 'Conversational', icon: '💬', desc: 'Supportive, friendly, and collaborative transitions.' },
  { id: 'Technical', label: 'Technical Deep Dive', icon: '🧠', desc: 'Focuses heavily on low-level mechanics, memory, Big-O.' },
  { id: 'Strict', label: 'Strict / Stress Mode', icon: '🔥', desc: 'Probes edge cases, challenges claims with minimal hints.' },
  { id: 'HR', label: 'HR / Behavioral Lead', icon: '👔', desc: 'Focuses on STAR stories, ownership, and conflict resolution.' },
];

const companies = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Netflix', 'Uber', 'Stripe', 'Goldman Sachs', 'Adobe', 'Standard Mock'];

export default function InterviewSetup() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<InterviewCategory>('Technical');
  const [interviewType, setInterviewType] = useState<InterviewType>('live_ai');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [interviewerPersona, setInterviewerPersona] = useState<InterviewerPersona>('Professional');
  const [mode, setMode] = useState<InterviewMode>('Camera');
  const [company, setCompany] = useState('');
  const [topic, setTopic] = useState('');
  const [targetRole, setTargetRole] = useState('Senior Backend Engineer');
  const [experienceLevel, setExperienceLevel] = useState<'Junior' | 'Mid-Level' | 'Senior' | 'Staff / Lead'>('Mid-Level');
  const [preferredSkill, setPreferredSkill] = useState('');

  // Resume & JD states
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [jdText, setJdText] = useState('');
  const [analyzedJd, setAnalyzedJd] = useState<JobProfile | null>(null);

  // Queries
  const { data: resumes, refetch: refetchResumes } = useQuery({
    queryKey: ['user-resumes'],
    queryFn: () => resumeService.list().then((r) => r.data.data.resumes),
  });

  // Mutations
  const uploadResumeMutation = useMutation({
    mutationFn: (formData: FormData) => resumeService.upload(formData),
    onSuccess: (res) => {
      toast.success('Resume parsed successfully with full intelligence!');
      refetchResumes();
      setSelectedResumeId(res.data.data.resume._id);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Resume upload failed'),
  });

  const analyzeJdMutation = useMutation({
    mutationFn: () =>
      jdService.analyze({
        rawText: jdText,
        title: targetRole,
        company,
        resumeId: selectedResumeId || undefined,
      }),
    onSuccess: (res) => {
      setAnalyzedJd(res.data.data.jobProfile);
      toast.success('Job description analyzed against your resume!');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'JD analysis failed'),
  });

  const createInterviewMutation = useMutation({
    mutationFn: () =>
      interviewService.create({
        category,
        topic: topic || preferredSkill || targetRole,
        difficulty,
        numQuestions,
        mode,
        company,
        resumeId: selectedResumeId || undefined,
        jobProfileId: analyzedJd?._id || undefined,
        interviewType,
        targetRole,
        interviewerPersona,
        durationMinutes,
        experienceLevel,
        preferredSkill,
        isLiveInterview: true,
      }),
    onSuccess: (res) => {
      toast.success('Live AI Interview Studio Initialized!');
      navigate(`/interview/live/${res.data.data.interview._id}`);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Could not start interview'),
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('resume', file);
    uploadResumeMutation.mutate(formData);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-paper">
            Configure Live AI Interview
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-light">
            Step {step} of 3 · AI personalizes questions dynamically to your target company, persona, and role.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                'h-2.5 w-8 rounded-full transition-all duration-300',
                step === s ? 'bg-signal' : step > s ? 'bg-mint' : 'bg-neutral/15'
              )}
            />
          ))}
        </div>
      </div>

      {/* STEP 1: Track & Persona Selection */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Track selection */}
          <div className="space-y-3">
            <h3 className="font-display text-base font-semibold text-paper flex items-center gap-2">
              <Layers className="h-4 w-4 text-signal" /> 1. Select Interview Track
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      'flex flex-col text-left p-4 rounded-2xl border transition-all duration-200',
                      isSelected
                        ? 'border-signal bg-signal/10 shadow-glow'
                        : 'border-neutral/10 bg-ink-800/60 hover:bg-ink-800 hover:border-neutral/20'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={cn('p-2 rounded-xl', isSelected ? 'bg-signal text-ink-950' : 'bg-neutral/10 text-slate-light')}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {isSelected && <Badge tone="signal">Selected</Badge>}
                    </div>
                    <span className="font-semibold text-xs sm:text-sm text-paper">{cat.label}</span>
                    <p className="mt-1 text-[11px] text-slate-light line-clamp-2 leading-relaxed">{cat.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interviewer Persona */}
          <div className="space-y-3 pt-2">
            <h3 className="font-display text-base font-semibold text-paper flex items-center gap-2">
              <Bot className="h-4 w-4 text-signal" /> 2. Choose AI Interviewer Persona & Style
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {personas.map((p) => {
                const isSelected = interviewerPersona === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setInterviewerPersona(p.id)}
                    className={cn(
                      'flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-200',
                      isSelected
                        ? 'border-signal bg-signal/10 shadow-glow'
                        : 'border-neutral/10 bg-ink-800/60 hover:bg-ink-800 hover:border-neutral/20'
                    )}
                  >
                    <span className="text-xl mb-1">{p.icon}</span>
                    <span className="font-semibold text-xs text-paper">{p.label}</span>
                    <p className="mt-1 text-[10px] text-slate-light leading-relaxed line-clamp-2">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button size="lg" onClick={() => setStep(2)} className="gap-2 shadow-glow text-xs font-semibold">
              Next: Role, Company & Resume Context <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* STEP 2: Target Role, Company & Resume Context */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card className="space-y-4">
            <h3 className="font-display text-base font-semibold text-paper flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-signal" /> Target Role & Experience Level
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-light mb-1 block">Target Role</label>
                <input
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full rounded-xl border border-neutral/10 bg-ink-700 px-3.5 py-2 text-xs text-paper outline-none focus:border-signal/60"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-light mb-1 block">Target Company</label>
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google, Amazon, Stripe"
                  className="w-full rounded-xl border border-neutral/10 bg-ink-700 px-3.5 py-2 text-xs text-paper outline-none focus:border-signal/60"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-light mb-1 block">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as any)}
                  className="w-full rounded-xl border border-neutral/10 bg-ink-700 px-3 py-2 text-xs text-paper outline-none focus:border-signal/60"
                >
                  <option value="Junior">Junior (0-2 years)</option>
                  <option value="Mid-Level">Mid-Level (3-5 years)</option>
                  <option value="Senior">Senior (5-8 years)</option>
                  <option value="Staff / Lead">Staff / Lead (8+ years)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-light mb-1 block">Preferred Technology / Focus (Optional)</label>
              <input
                value={preferredSkill}
                onChange={(e) => setPreferredSkill(e.target.value)}
                placeholder="e.g. Node.js, React, Redis Caching, Distributed Transactions"
                className="w-full rounded-xl border border-neutral/10 bg-ink-700 px-3.5 py-2 text-xs text-paper outline-none focus:border-signal/60"
              />
            </div>
          </Card>

          {/* Resume Upload / Selection */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-semibold text-paper flex items-center gap-2">
                  <FileText className="h-4 w-4 text-signal" /> Resume Grounding (Optional)
                </h3>
                <p className="text-xs text-slate-light mt-0.5">
                  AI will inspect your project claims, architecture decisions, and metrics to cross-examine you.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                isLoading={uploadResumeMutation.isPending}
                className="text-xs gap-1.5"
              >
                <UploadCloud className="h-3.5 w-3.5" /> Upload Resume PDF
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />

            {resumes && resumes.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {resumes.map((r: any) => (
                  <button
                    key={r._id}
                    type="button"
                    onClick={() => setSelectedResumeId(selectedResumeId === r._id ? '' : r._id)}
                    className={cn(
                      'p-3 rounded-xl border text-left text-xs flex items-center justify-between transition-all',
                      selectedResumeId === r._id
                        ? 'border-signal bg-signal/10 text-signal'
                        : 'border-neutral/10 bg-ink-700 text-slate-light'
                    )}
                  >
                    <span className="font-semibold truncate">{r.filename}</span>
                    {selectedResumeId === r._id && <CheckCircle2 className="h-4 w-4 text-signal shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </Card>

          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => setStep(1)} className="text-xs">
              Back
            </Button>
            <Button onClick={() => setStep(3)} className="gap-2 text-xs font-semibold shadow-glow">
              Next: Difficulty, Duration & Launch <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: Difficulty, Duration, Questions & Launch */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Difficulty selection */}
          <Card className="space-y-3">
            <h3 className="font-display text-base font-semibold text-paper">Initial Difficulty Tier</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['Easy', 'Medium', 'Hard', 'Adaptive'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    'rounded-xl border py-3 text-xs sm:text-sm font-semibold transition-all text-center',
                    difficulty === d
                      ? 'border-signal bg-signal/10 text-signal shadow-glow'
                      : 'border-neutral/10 bg-neutral/5 text-slate-light hover:text-paper'
                  )}
                >
                  {d} {d === 'Adaptive' ? '(Auto-scales)' : ''}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate mt-1">
              * The engine dynamically adjusts difficulty after each answer turn based on your accuracy and depth.
            </p>
          </Card>

          {/* Duration & Question count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="space-y-3">
              <h3 className="font-display text-base font-semibold text-paper flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-signal" /> Target Interview Duration
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setDurationMinutes(mins)}
                    className={cn(
                      'rounded-xl border py-2.5 text-xs font-semibold transition-all text-center',
                      durationMinutes === mins
                        ? 'border-signal bg-signal/10 text-signal'
                        : 'border-neutral/10 bg-neutral/5 text-slate-light'
                    )}
                  >
                    {mins} Minutes
                  </button>
                ))}
              </div>
            </Card>

            <Card className="space-y-3">
              <h3 className="font-display text-base font-semibold text-paper flex items-center gap-1.5">
                <Target className="h-4 w-4 text-mint" /> Number of Question Rounds
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 15].map((n) => (
                  <button
                    key={n}
                    onClick={() => setNumQuestions(n)}
                    className={cn(
                      'rounded-xl border py-2.5 text-xs font-semibold transition-all text-center',
                      numQuestions === n
                        ? 'border-signal bg-signal/10 text-signal'
                        : 'border-neutral/10 bg-neutral/5 text-slate-light'
                    )}
                  >
                    {n} Questions
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Launch Controls */}
          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => setStep(2)} className="text-xs">
              Back
            </Button>

            <Button
              size="lg"
              isLoading={createInterviewMutation.isPending}
              onClick={() => createInterviewMutation.mutate()}
              className="gap-2 shadow-glow text-sm font-bold bg-signal text-ink-950 hover:bg-signal/90"
            >
              <Sparkles className="h-4 w-4 fill-current" /> Enter Live AI Interview Studio
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
