import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mic,
  TrendingUp,
  Target,
  Clock,
  ArrowRight,
  BookOpen,
  Sparkles,
  Zap,
  Layers,
  Code2,
  Cpu,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Flame,
  Award,
  Building,
  CheckCircle2,
  AlertCircle,
  Play,
  Check,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import ProgressChart from '@/components/charts/ProgressChart';
import ScheduleInterviewModal from '@/components/interview/ScheduleInterviewModal';
import { useAuth } from '@/context/AuthContext';
import {
  analyticsService,
  interviewService,
  skillService,
  learningService,
} from '@/services/interviewService';
import { scoreColor, formatDuration } from '@/lib/utils';
import type { ReadinessData, ScheduledInterviewItem, InterviewHistoryItem } from '@/types';

const companyMockList = [
  { name: 'Google', focus: 'DSA & Scalability', tag: 'Top Tech' },
  { name: 'Amazon', focus: 'Leadership Principles & OOP', tag: 'System Scale' },
  { name: 'Microsoft', focus: 'Data Structures & Architecture', tag: 'Enterprise' },
  { name: 'Meta', focus: 'Fast-Paced Algorithms & Concurrency', tag: 'Product' },
  { name: 'Stripe', focus: 'API Design & Idempotency', tag: 'FinTech' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [countdownText, setCountdownText] = useState<string>('');

  // 1. Readiness & Topic Heatmap Query
  const { data: readiness, isLoading: loadingReadiness } = useQuery<ReadinessData>({
    queryKey: ['interview-readiness'],
    queryFn: () => interviewService.readiness().then((r) => r.data.data),
  });

  // 2. Scheduled Interviews Query
  const { data: scheduledList, isLoading: loadingScheduled } = useQuery<ScheduledInterviewItem[]>({
    queryKey: ['scheduled-interviews'],
    queryFn: () => interviewService.scheduled().then((r) => r.data.data.interviews),
  });

  // 3. Interview History Query
  const { data: historyList, isLoading: loadingHistory } = useQuery<InterviewHistoryItem[]>({
    queryKey: ['interview-history'],
    queryFn: () => interviewService.history().then((r) => r.data.data.history),
  });

  // 4. Analytics Progress
  const { data: dailyProgress } = useQuery({
    queryKey: ['daily-progress'],
    queryFn: () => analyticsService.dailyProgress(14).then((r) => r.data.data.records),
  });

  const nextScheduled = scheduledList && scheduledList.length > 0 ? scheduledList[0] : null;

  // Real-time Countdown Calculation
  useEffect(() => {
    if (!nextScheduled?.scheduledAt) return;

    const updateCountdown = () => {
      const diff = new Date(nextScheduled.scheduledAt).getTime() - Date.now();
      if (diff <= 0) {
        setCountdownText('Starting Now');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdownText(
        `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextScheduled]);

  const readinessScore = readiness?.readinessScore ?? user?.stats.averageScore ?? 78;
  const streak = readiness?.streak ?? 3;
  const heatmap = readiness?.heatmap || [];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. HERO SECTION & PRIMARY ACTIONS */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral/15 bg-gradient-to-r from-ink-900 via-ink-850 to-ink-900 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <Badge tone="signal" className="gap-1 px-3 py-1 text-xs">
            <Sparkles className="h-3.5 w-3.5 fill-current" /> AI Adaptive Simulation 2.0
          </Badge>

          <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-paper leading-tight">
            Prepare smarter. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-signal via-mint to-paper">
              Interview better.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-light leading-relaxed">
            Practice live adaptive AI interviews designed around your skills, role, and career goals with spoken voice interaction and real-time difficulty scaling.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/interview/new">
              <Button size="lg" className="shadow-glow gap-2 text-sm font-bold bg-signal text-ink-950 hover:bg-signal/90">
                <Sparkles className="h-4 w-4 fill-current" /> START AI INTERVIEW
              </Button>
            </Link>

            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsScheduleModalOpen(true)}
              className="gap-2 text-sm font-semibold border-neutral/20 hover:bg-neutral/10"
            >
              <Calendar className="h-4 w-4 text-signal" /> SCHEDULE INTERVIEW
            </Button>
          </div>
        </div>

        {/* Background Ambient Glow */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 h-96 w-96 rounded-full bg-signal/10 blur-3xl pointer-events-none" />
      </div>

      {/* 2. UPCOMING SCHEDULED INTERVIEW COUNTDOWN (IF ACTIVE) */}
      {nextScheduled && (
        <Card className="border-signal/30 bg-gradient-to-r from-signal/10 via-ink-900 to-ink-900 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-signal animate-ping" />
                <span className="text-xs font-mono uppercase font-bold text-signal tracking-wider">
                  Upcoming Scheduled Interview
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-paper">
                {nextScheduled.company} · {nextScheduled.targetRole}
              </h3>
              <p className="text-xs text-slate-light">
                {nextScheduled.category} Track · {nextScheduled.difficulty} Tier · {nextScheduled.interviewerPersona} Persona
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate tracking-wider block">Starts In</span>
                <span className="font-mono text-xl sm:text-2xl font-black text-signal">
                  {countdownText || '00:00:00'}
                </span>
              </div>

              <Link to="/interview/new">
                <Button size="md" className="shadow-glow text-xs font-bold gap-1.5">
                  <Play className="h-3.5 w-3.5 fill-current" /> Enter Setup Room
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* 3. CORE METRICS ROW (Readiness, Streak, Average Score, Completed) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Readiness Score */}
        <Card className="flex flex-col justify-between p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-slate font-semibold">Interview Readiness</span>
            <div className="rounded-xl bg-signal/10 p-2.5 text-signal">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className={`font-display text-4xl font-extrabold ${scoreColor(readinessScore)}`}>
              {readinessScore}%
            </p>
            <p className="mt-1 text-[11px] text-slate-light line-clamp-1">
              {readiness?.summaryMessage || 'Calibrated across recent responses'}
            </p>
          </div>
        </Card>

        {/* Daily Streak */}
        <Card className="flex flex-col justify-between p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-slate font-semibold">Daily Streak</span>
            <div className="rounded-xl bg-coral/10 p-2.5 text-coral">
              <Flame className="h-4 w-4 fill-current" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <p className="font-display text-4xl font-extrabold text-paper">{streak}</p>
              <span className="text-xs font-semibold text-slate">Days</span>
            </div>
            <p className="mt-1 text-[11px] text-mint">Active practice consistency</p>
          </div>
        </Card>

        {/* Average Score */}
        <Card className="flex flex-col justify-between p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-slate font-semibold">Average Score</span>
            <div className="rounded-xl bg-mint/10 p-2.5 text-mint">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className={`font-display text-4xl font-extrabold ${scoreColor(user?.stats.averageScore ?? 80)}`}>
              {user?.stats.averageScore || 80}%
            </p>
            <p className="mt-1 text-[11px] text-slate-light">Top 15% candidate percentile</p>
          </div>
        </Card>

        {/* Interviews Completed */}
        <Card className="flex flex-col justify-between p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-slate font-semibold">Simulations Run</span>
            <div className="rounded-xl bg-signal/10 p-2.5 text-signal">
              <Mic className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-display text-4xl font-extrabold text-paper">
              {user?.stats.totalInterviews || historyList?.length || 1}
            </p>
            <p className="mt-1 text-[11px] text-slate-light">Full adaptive sessions completed</p>
          </div>
        </Card>
      </div>

      {/* 4. DAILY AI MOCK & WEAKNESS-BASED TARGETED DRILL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily 10-Minute Mock Interview */}
        <Card className="p-6 flex flex-col justify-between border-neutral/15 bg-gradient-to-br from-ink-850 to-ink-900 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge tone="signal">Daily Mock Challenge</Badge>
              <span className="text-xs text-slate font-mono">10 Mins · 5 Questions</span>
            </div>
            <h3 className="font-display text-lg font-bold text-paper">
              Today's Focus: Full-Stack Architecture
            </h3>
            <p className="text-xs text-slate-light leading-relaxed">
              Keep your streak alive with a rapid 10-minute micro-interview covering JavaScript event loop, REST idempotency, and database transactions.
            </p>
          </div>

          <Link to="/interview/new">
            <Button size="md" className="w-full shadow-glow text-xs font-bold gap-2">
              <Play className="h-3.5 w-3.5 fill-current" /> START DAILY INTERVIEW
            </Button>
          </Link>
        </Card>

        {/* Weakness-Based Targeted Interview */}
        <Card className="p-6 flex flex-col justify-between border-neutral/15 bg-gradient-to-br from-ink-850 to-ink-900 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge tone="coral">Targeted Practice</Badge>
              <span className="text-xs text-coral font-mono">Based on Previous Gaps</span>
            </div>
            <h3 className="font-display text-lg font-bold text-paper">
              Weak Area Focus: {readiness?.weakestTopics?.[0] || 'System Design & Redis'}
            </h3>
            <p className="text-xs text-slate-light leading-relaxed">
              AI detected lower depth in cache invalidation and concurrency locking during recent sessions. Train specifically on this topic.
            </p>
          </div>

          <Link to="/interview/new">
            <Button size="md" variant="secondary" className="w-full text-xs font-bold gap-2">
              <Sparkles className="h-3.5 w-3.5 text-signal" /> START TARGETED INTERVIEW
            </Button>
          </Link>
        </Card>
      </div>

      {/* 5. 10-TOPIC PREPARATION HEATMAP */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-bold text-paper flex items-center gap-2">
              <Layers className="h-5 w-5 text-signal" /> Technical Topic Mastery Heatmap
            </h2>
            <p className="text-xs text-slate-light">
              Real-time competency assessment across 10 core computer science and engineering domains.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1 text-mint"><span className="h-2 w-2 rounded-full bg-mint" /> 80%+ Strong</span>
            <span className="flex items-center gap-1 text-signal"><span className="h-2 w-2 rounded-full bg-signal" /> 60-79% Average</span>
            <span className="flex items-center gap-1 text-coral"><span className="h-2 w-2 rounded-full bg-coral" /> &lt;60% Needs Focus</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {heatmap.map((item) => (
            <div
              key={item.code}
              className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between space-y-2 transition-all hover:scale-[1.02] ${
                item.tone === 'green'
                  ? 'border-mint/30 bg-mint/5'
                  : item.tone === 'yellow'
                  ? 'border-signal/30 bg-signal/5'
                  : 'border-coral/30 bg-coral/5'
              }`}
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-slate tracking-wider block">
                  {item.code}
                </span>
                <p className="font-semibold text-paper text-xs mt-0.5 line-clamp-1">{item.topic}</p>
              </div>

              <div className="flex items-baseline justify-between pt-2 border-t border-neutral/10">
                <span className={`font-display text-lg font-bold ${scoreColor(item.accuracy)}`}>
                  {item.accuracy}%
                </span>
                <span className="text-[10px] font-mono text-slate-light">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 6. COMPANY-SPECIFIC PRACTICE MODES */}
      <div className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-bold text-paper flex items-center gap-2">
            <Building className="h-5 w-5 text-signal" /> Company-Specific Mock Simulation
          </h2>
          <p className="text-xs text-slate-light">
            AI-generated practice questions inspired by publicly available company interview patterns and engineering standards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {companyMockList.map((comp) => (
            <Card
              key={comp.name}
              className="p-4 flex flex-col justify-between bg-ink-850 hover:border-signal/40 transition-all space-y-3 cursor-pointer group"
              onClick={() => navigate('/interview/new')}
            >
              <div>
                <div className="flex items-center justify-between">
                  <Badge tone="default" className="text-[10px]">{comp.tag}</Badge>
                </div>
                <h4 className="font-display text-base font-bold text-paper mt-2 group-hover:text-signal transition-colors">
                  {comp.name}
                </h4>
                <p className="text-[11px] text-slate-light mt-1">{comp.focus}</p>
              </div>

              <span className="text-xs font-semibold text-signal flex items-center gap-1 pt-2 border-t border-neutral/10">
                Start Mock <ArrowRight className="h-3 w-3" />
              </span>
            </Card>
          ))}
        </div>
      </div>

      {/* 7. RECENT INTERVIEW HISTORY TABLE / CARDS */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-paper flex items-center gap-2">
              <Clock className="h-5 w-5 text-signal" /> Recent Interview History & Reports
            </h2>
            <p className="text-xs text-slate-light">
              Click any past session to inspect question transcripts, evaluator feedback, and ideal answer structures.
            </p>
          </div>
        </div>

        {historyList && historyList.length > 0 ? (
          <div className="space-y-2.5 pt-1">
            {historyList.slice(0, 5).map((item) => (
              <div
                key={item._id}
                onClick={() => {
                  if (item.status === 'completed') {
                    navigate(`/interview/result/${item._id}`);
                  } else {
                    navigate(`/interview/live/${item._id}`);
                  }
                }}
                className="p-4 rounded-xl border border-neutral/10 bg-ink-800/60 hover:bg-ink-800 hover:border-neutral/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge tone="signal" className="text-[10px]">{item.category}</Badge>
                    <span className="text-xs font-bold text-paper">{item.company || 'Standard Mock'}</span>
                    <span className="text-xs text-slate">· {item.targetRole}</span>
                  </div>
                  <p className="text-xs text-slate-light">
                    {new Date(item.createdAt).toLocaleDateString()} · {item.durationMinutes || 30}m duration · {item.interviewerPersona} Persona
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-[10px] text-slate block">Score</span>
                    <span className={`font-display text-lg font-bold ${scoreColor(item.overallScore || 75)}`}>
                      {item.overallScore ? `${item.overallScore}%` : 'In Progress'}
                    </span>
                  </div>

                  <span className="text-xs text-signal font-semibold flex items-center gap-1">
                    View Report <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-light">
            No completed interviews yet. Start your first AI mock interview above!
          </div>
        )}
      </Card>

      {/* Schedule Interview Modal */}
      <ScheduleInterviewModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      />
    </div>
  );
}
