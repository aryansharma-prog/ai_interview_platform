import { ReactNode } from 'react';

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-neutral/10 py-16 text-center">
      {icon && <div className="mb-4 text-slate">{icon}</div>}
      <h3 className="font-display text-lg font-semibold text-paper">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-slate">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
