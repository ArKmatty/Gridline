import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-white/5 text-muted">
        <Icon className="h-7 w-7" />
      </span>
      <p className="text-lg font-semibold">{title}</p>
      {description && (
        <p className="mt-2 max-w-md text-sm text-muted">{description}</p>
      )}
    </div>
  );
}
