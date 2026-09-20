import { useQuery } from '@tanstack/react-query';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import ProgressChart from '@/components/charts/ProgressChart';
import TopicAccuracyChart from '@/components/charts/TopicAccuracyChart';
import { analyticsService } from '@/services/interviewService';

export default function Analytics() {
  const { data: daily, isLoading: loadingDaily } = useQuery({
    queryKey: ['analytics-daily-full'],
    queryFn: () => analyticsService.dailyProgress(90).then((r) => r.data.data.records),
  });

  const { data: topics, isLoading: loadingTopics } = useQuery({
    queryKey: ['analytics-topics'],
    queryFn: () => analyticsService.topicAccuracy().then((r) => r.data.data.topicAccuracy),
  });

  const { data: overview } = useQuery({
    queryKey: ['analytics-overview-2'],
    queryFn: () => analyticsService.overview().then((r) => r.data.data),
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-slate">Total interviews</p>
          <p className="mt-2 font-display text-3xl font-semibold text-paper">{overview?.totalInterviews ?? '–'}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate">Average score</p>
          <p className="mt-2 font-display text-3xl font-semibold text-signal">{overview?.averageScore ?? '–'}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate">Completion rate</p>
          <p className="mt-2 font-display text-3xl font-semibold text-mint">{overview?.completionRate ?? '–'}%</p>
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 font-display text-base font-semibold text-paper">Score trend (90 days)</h3>
        {loadingDaily ? (
          <Skeleton className="h-72 w-full" />
        ) : daily?.length ? (
          <ProgressChart labels={daily.map((d: any) => d.date.slice(5))} data={daily.map((d: any) => d.averageScore)} />
        ) : (
          <EmptyState title="No history yet" description="Your score trend will appear after your first completed interview." />
        )}
      </Card>

      <Card>
        <h3 className="mb-4 font-display text-base font-semibold text-paper">Topic accuracy</h3>
        {loadingTopics ? (
          <Skeleton className="h-72 w-full" />
        ) : topics?.length ? (
          <TopicAccuracyChart topics={topics} />
        ) : (
          <EmptyState title="No topic data yet" description="Answer more questions across topics to unlock this breakdown." />
        )}
      </Card>
    </div>
  );
}
