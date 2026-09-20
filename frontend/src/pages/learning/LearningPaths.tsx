import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Zap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Plus,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import { learningService } from '@/services/interviewService';
import type { LearningPath } from '@/types';

export default function LearningPaths() {
  const queryClient = useQueryClient();
  const [expandedPathId, setExpandedPathId] = useState<string | null>(null);
  const [newSkillName, setNewSkillName] = useState('');

  const { data: paths, isLoading } = useQuery<LearningPath[]>({
    queryKey: ['learning-paths'],
    queryFn: () => learningService.listPaths().then((r) => r.data.data.learningPaths),
  });

  const toggleModuleMutation = useMutation({
    mutationFn: ({ pathId, moduleIndex }: { pathId: string; moduleIndex: number }) =>
      learningService.toggleModule(pathId, moduleIndex),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] });
      toast.success('Curriculum milestone updated!');
    },
    onError: () => toast.error('Could not update module progress'),
  });

  const generatePathMutation = useMutation({
    mutationFn: (targetSkill: string) => learningService.generate({ targetSkill }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] });
      setNewSkillName('');
      setExpandedPathId(res.data.data.learningPath._id);
      toast.success('Custom learning roadmap created!');
    },
    onError: () => toast.error('Could not generate learning path'),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    generatePathMutation.mutate(newSkillName.trim());
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-paper flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-signal" /> Personalized Learning Engine
          </h2>
          <p className="mt-1 text-sm text-slate-light">
            Actionable curricula generated directly from your identified interview weaknesses.
          </p>
        </div>

        {/* Generate Custom Path Bar */}
        <form onSubmit={handleCreateCustom} className="flex items-center gap-2">
          <input
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="Generate path (e.g. Kafka, Raft)..."
            className="rounded-xl border border-neutral/10 bg-ink-700 px-3.5 py-2 text-xs text-paper outline-none focus:border-signal/60 placeholder:text-slate"
          />
          <Button size="sm" type="submit" isLoading={generatePathMutation.isPending} className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" /> Create
          </Button>
        </form>
      </div>

      {/* 2. Paths List */}
      {paths && paths.length > 0 ? (
        <div className="space-y-6">
          {paths.map((path) => {
            const isExpanded = expandedPathId === path._id || paths.length === 1;

            return (
              <Card key={path._id} className="space-y-4 border-neutral/10 overflow-hidden">
                {/* Path Header */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                  onClick={() => setExpandedPathId(isExpanded ? null : path._id)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg font-semibold text-paper">{path.targetSkill}</h3>
                      <Badge tone={path.isCompleted ? 'mint' : 'signal'} className="text-[10px]">
                        {path.isCompleted ? 'Mastered' : `${path.progress}% Completed`}
                      </Badge>
                      <Badge tone="default" className="text-[10px]">{path.category}</Badge>
                    </div>
                    <p className="text-xs text-slate-light max-w-2xl">{path.summary}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      to={`/practice/${encodeURIComponent(path.targetSkill)}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button size="sm" variant="secondary" className="gap-1.5 text-xs shadow-glow">
                        <Zap className="h-3.5 w-3.5 text-signal" /> Practice Drill
                      </Button>
                    </Link>

                    <button className="text-slate p-1 hover:text-paper transition-colors">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full rounded-full bg-neutral/10 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      path.progress === 100 ? 'bg-mint' : 'bg-signal'
                    }`}
                    style={{ width: `${path.progress}%` }}
                  />
                </div>

                {/* Expanded Modules */}
                {isExpanded && (
                  <div className="pt-4 border-t border-neutral/10 space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate font-medium">
                      <span>Curriculum Modules ({path.modules.filter((m) => m.isCompleted).length}/{path.modules.length})</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Est. {path.estimatedHours || 4} Hours
                      </span>
                    </div>

                    <div className="space-y-3">
                      {path.modules.map((mod, modIdx) => (
                        <div
                          key={modIdx}
                          className={`p-4 rounded-xl border text-xs space-y-3 transition-all ${
                            mod.isCompleted
                              ? 'border-mint/20 bg-mint/5'
                              : 'border-neutral/10 bg-ink-700/60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() =>
                                  toggleModuleMutation.mutate({ pathId: path._id, moduleIndex: modIdx })
                                }
                                className="mt-0.5 text-slate-light hover:text-signal transition-colors"
                              >
                                {mod.isCompleted ? (
                                  <CheckCircle2 className="h-4 w-4 text-mint" />
                                ) : (
                                  <Circle className="h-4 w-4 text-slate" />
                                )}
                              </button>
                              <div>
                                <h4
                                  className={`font-semibold text-sm ${
                                    mod.isCompleted ? 'line-through text-slate-light' : 'text-paper'
                                  }`}
                                >
                                  {mod.title}
                                </h4>
                                <p className="text-slate-light text-xs mt-0.5">{mod.description}</p>
                              </div>
                            </div>

                            <Badge tone={mod.isCompleted ? 'mint' : 'default'} className="text-[10px] shrink-0">
                              {mod.isCompleted ? 'Completed' : 'Pending'}
                            </Badge>
                          </div>

                          {/* Concepts Covered */}
                          {mod.concepts && mod.concepts.length > 0 && (
                            <div className="pl-7 flex flex-wrap gap-1.5">
                              {mod.concepts.map((c, ci) => (
                                <span
                                  key={ci}
                                  className="rounded-md bg-neutral/10 px-2 py-0.5 text-[10px] text-slate-light"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Scenario Breakdown */}
                          {mod.scenarioQuestions && mod.scenarioQuestions.length > 0 && (
                            <div className="pl-7 pt-2 border-t border-neutral/10 space-y-2">
                              {mod.scenarioQuestions.map((sq, sqi) => (
                                <div key={sqi} className="p-3 rounded-lg bg-ink-800 border border-neutral/10 space-y-1.5">
                                  <p className="font-semibold text-paper flex items-center gap-1.5">
                                    <HelpCircle className="h-3.5 w-3.5 text-signal" />
                                    {sq.question}
                                  </p>
                                  <p className="text-slate-light text-[11px] leading-relaxed">
                                    {sq.explanation}
                                  </p>
                                  {sq.keyTakeaway && (
                                    <p className="text-signal-soft font-mono text-[10px] pt-1">
                                      Key Takeaway: {sq.keyTakeaway}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="No learning paths active"
          description="Complete an interview simulation or enter a skill above to generate a personalized learning roadmap."
        />
      )}
    </div>
  );
}
