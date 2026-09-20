import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import SignalBars from '@/components/ui/SignalBars';

export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-ink">
      {/* Left: brand panel */}
      <div className="hidden w-1/2 flex-col justify-between overflow-hidden bg-ink-800 p-12 lg:flex">
        <div className="flex items-center gap-2">
          <div className="signal-bars h-5 text-signal"><span /><span /><span /><span /><span /></div>
          <span className="font-display text-lg font-semibold">Interview<span className="text-signal">.AI</span></span>
        </div>

        <div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md font-display text-4xl font-semibold leading-tight text-paper"
          >
            Walk into your next interview already having answered it once.
          </motion.h2>
          <p className="mt-4 max-w-sm text-sm text-slate-light">
            Practice HR, DSA, System Design and Resume-based interviews with an AI interviewer
            that scores your answers like a real panel would.
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate">
          <span>9 interview tracks</span>
          <span>·</span>
          <span>AI-scored feedback</span>
          <span>·</span>
          <span>Company-specific prep</span>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm animate-floatUp">
          <div className="mb-8 lg:hidden flex items-center gap-2">
            <div className="signal-bars h-5 text-signal"><span /><span /><span /><span /><span /></div>
            <span className="font-display text-lg font-semibold">Interview<span className="text-signal">.AI</span></span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-paper">{title}</h1>
          <p className="mt-1.5 text-sm text-slate-light">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
