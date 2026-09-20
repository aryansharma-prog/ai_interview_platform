import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Layers,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Search,
  BookOpen,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import SkillRadarChart from '@/components/skills/SkillRadarChart';
import { skillService } from '@/services/interviewService';
import type { SkillProfile, SkillNode } from '@/types';

export default function SkillMap() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedClassification, setSelectedClassification] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: profile, isLoading } = useQuery<SkillProfile>({
    queryKey: ['skill-profile-full'],
    queryFn: () => skillService.profile().then((r) => r.data.data.profile),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const skills: SkillNode[] = profile?.skills || [];
  const overview = profile?.overview || { technical: 75, dsa: 70, systemDesign: 65, communication: 80, backend: 72, fundamentals: 75 };

  const categories = ['All', 'Backend', 'DSA', 'System Design', 'Database', 'DevOps', 'CS Fundamentals'];
  const classifications = ['All', 'Strong', 'Developing', 'Weak', 'Critical Gap'];

  const filteredSkills = skills.filter((s) => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesClass = selectedClassification === 'All' || s.classification === selectedClassification;
    const matchesSearch = s.skillName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesClass && matchesSearch;
  });

  const radarMetrics = [
    { label: 'Technical', value: overview.technical },
    { label: 'DSA', value: overview.dsa },
    { label: 'System Design', value: overview.systemDesign },
    { label: 'Communication', value: overview.communication },
    { label: 'Backend', value: overview.backend },
    { label: 'Fundamentals', value: overview.fundamentals },
  ];

  const getTone = (classification: string) => {
    switch (classification) {
      case 'Strong':
        return 'mint';
      case 'Developing':
        return 'default';
      case 'Weak':
        return 'coral';
      case 'Critical Gap':
        return 'coral';
      default:
        return 'default';
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-paper flex items-center gap-2">
            <Layers className="h-6 w-6 text-signal" /> Personalized Skill Map & Gap Explorer
          </h2>
          <p className="mt-1 text-sm text-slate-light">
            Continuous competency graph updated across your interview simulations and targeted drills.
          </p>
        </div>

        <Link to="/learning">
          <Button variant="secondary" className="gap-2 text-xs">
            <BookOpen className="h-4 w-4" /> View Learning Paths
          </Button>
        </Link>
      </div>

      {/* 2. Top Summary & Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-base font-semibold text-paper mb-1">Competency Radar</h3>
            <p className="text-xs text-slate-light mb-4">Real-time mastery profile across engineering categories.</p>
          </div>
          <SkillRadarChart metrics={radarMetrics} />
          <div className="mt-4 pt-3 border-t border-neutral/10 flex items-center justify-around text-xs text-center">
            <div>
              <p className="text-slate">Total Tracked</p>
              <p className="font-bold text-paper text-sm mt-0.5">{skills.length} Skills</p>
            </div>
            <div>
              <p className="text-slate">Strong Masteries</p>
              <p className="font-bold text-mint text-sm mt-0.5">
                {skills.filter((s) => s.classification === 'Strong').length}
              </p>
            </div>
            <div>
              <p className="text-slate">Target Gaps</p>
              <p className="font-bold text-coral text-sm mt-0.5">
                {skills.filter((s) => s.classification === 'Weak' || s.classification === 'Critical Gap').length}
              </p>
            </div>
          </div>
        </Card>

        {/* Priority Focus Gaps */}
        <Card className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-paper flex items-center gap-2">
              <Flame className="h-4 w-4 text-coral" /> Critical Target Gaps
            </h3>
            <Badge tone="coral">Immediate Practice</Badge>
          </div>
          <p className="text-xs text-slate-light">
            Skills where demonstrated performance fell below 60%. Click any skill to launch an instant practice drill session.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {skills
              .filter((s) => s.classification === 'Weak' || s.classification === 'Critical Gap')
              .slice(0, 4)
              .map((s) => (
                <div
                  key={s.skillName}
                  className="p-3.5 rounded-xl border border-coral/20 bg-coral/5 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge tone="coral" className="text-[10px]">{s.category}</Badge>
                      <h4 className="font-semibold text-sm text-paper mt-1">{s.skillName}</h4>
                    </div>
                    <span className="font-display font-bold text-coral text-sm">{s.mastery}%</span>
                  </div>

                  <Link to={`/practice/${encodeURIComponent(s.skillName)}`}>
                    <Button size="sm" variant="secondary" className="w-full gap-1 text-xs">
                      <Zap className="h-3 w-3 text-signal" /> Practice Drill
                    </Button>
                  </Link>
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* 3. Filter Controls & Search */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-3 text-slate" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills (e.g. Redis, Dynamic Programming, SQL)..."
              className="w-full rounded-xl border border-neutral/10 bg-ink-700 pl-9 pr-4 py-2 text-xs text-paper placeholder:text-slate outline-none focus:border-signal/60"
            />
          </div>

          {/* Classification Filter */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            {classifications.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedClassification(c)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  selectedClassification === c
                    ? 'bg-signal/20 text-signal'
                    : 'text-slate-light hover:text-paper bg-neutral/5'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs pt-2 border-t border-neutral/10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-signal text-oninverse font-semibold'
                  : 'text-slate-light hover:text-paper'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      {/* 4. Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredSkills.length > 0 ? (
          filteredSkills.map((skill) => (
            <Card key={skill.skillName} className="flex flex-col justify-between space-y-4 p-4 hover:border-neutral/20 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge tone={getTone(skill.classification)} className="text-[10px]">
                    {skill.classification}
                  </Badge>
                  <span className="text-xs text-slate font-mono">{skill.category}</span>
                </div>

                <h4 className="font-semibold text-sm text-paper">{skill.skillName}</h4>

                {/* Mastery Bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-light text-[11px]">Mastery Level</span>
                    <span className="font-semibold font-mono text-paper">{skill.mastery}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-neutral/10 overflow-hidden">
                    <div
                      className={`h-full ${
                        skill.mastery >= 75 ? 'bg-mint' : skill.mastery >= 55 ? 'bg-signal' : 'bg-coral'
                      }`}
                      style={{ width: `${skill.mastery}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral/10">
                <span className="text-[11px] text-slate">
                  {skill.attemptsCount || 1} session{skill.attemptsCount !== 1 ? 's' : ''}
                </span>
                <Link to={`/practice/${encodeURIComponent(skill.skillName)}`}>
                  <Button size="sm" variant="secondary" className="gap-1 text-xs">
                    <Zap className="h-3 w-3 text-signal" /> Practice
                  </Button>
                </Link>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full p-8 text-center text-sm text-slate">
            No skills match your active filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}
