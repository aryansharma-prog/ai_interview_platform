import { cn } from '@/lib/utils';

export default function Badge({
  children,
  tone = 'default',
  className,
}: {
  children: React.ReactNode;
  tone?: 'default' | 'mint' | 'signal' | 'coral';
  className?: string;
}) {
  const tones = {
    default: 'bg-neutral/5 text-slate-light border-neutral/10',
    mint: 'bg-mint/10 text-mint border-mint/20',
    signal: 'bg-signal/10 text-signal border-signal/20',
    coral: 'bg-coral/10 text-coral border-coral/20',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
