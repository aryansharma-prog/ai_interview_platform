import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark, Star } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import { questionService } from '@/services/interviewService';

export default function Bookmarks() {
  const qc = useQueryClient();
  const { data: questions, isLoading } = useQuery({
    queryKey: ['bookmarked-questions'],
    queryFn: () => questionService.bookmarked().then((r) => r.data.data.questions),
  });

  const favoriteMutation = useMutation({
    mutationFn: (id: string) => questionService.toggleFavorite(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookmarked-questions'] }),
  });

  if (isLoading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}</div>;
  }

  if (!questions?.length) {
    return (
      <EmptyState
        icon={<Bookmark className="h-8 w-8" />}
        title="No bookmarks yet"
        description="Bookmark tough questions during an interview to revisit them here."
      />
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((q: any) => (
        <Card key={q._id} className="flex items-start justify-between gap-4">
          <div>
            <Badge tone="signal">{q.topic}</Badge>
            <p className="mt-2 text-sm text-paper">{q.text}</p>
          </div>
          <button
            onClick={() => favoriteMutation.mutate(q._id)}
            className={q.isFavorite ? 'text-signal' : 'text-slate-light hover:text-signal'}
          >
            <Star className="h-5 w-5" fill={q.isFavorite ? 'currentColor' : 'none'} />
          </button>
        </Card>
      ))}
    </div>
  );
}
