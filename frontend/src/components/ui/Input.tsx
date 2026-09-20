import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-light">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          'w-full rounded-xl border border-neutral/10 bg-ink-700 px-4 py-2.5 text-paper placeholder:text-slate outline-none transition-colors focus:border-signal/60 focus:ring-2 focus:ring-signal/20',
          error && 'border-coral/60 focus:border-coral focus:ring-coral/20',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-coral">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';
export default Input;
