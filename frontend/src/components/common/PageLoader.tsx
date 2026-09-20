import SignalBars from '@/components/ui/SignalBars';

export default function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-ink text-signal">
      <div className="flex flex-col items-center gap-3">
        <SignalBars className="h-8" />
        <p className="font-mono text-xs text-slate">Reconnecting signal…</p>
      </div>
    </div>
  );
}
