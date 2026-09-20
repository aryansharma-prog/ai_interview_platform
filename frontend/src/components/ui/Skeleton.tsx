import { cn } from '@/lib/utils';

export default function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-neutral/5', className)} />;
}
