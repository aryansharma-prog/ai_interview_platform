// The platform's signature motif: a live "on-air" waveform.
// Used for loading states, active-interview indicators, and score visualizations.
export default function SignalBars({ className = '' }: { className?: string }) {
  return (
    <span className={`signal-bars ${className}`} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}
