import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  subtitle,
  action,
  icon: Icon,
  className,
  as: Heading = "h1",
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
  as?: "h1" | "h2";
}) {
  const HeadingEl = Heading;
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <span aria-hidden="true" className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-accent-soft text-accent shadow-[0_0_24px_rgba(225,6,0,0.12)]">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div>
          <HeadingEl className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </HeadingEl>
          {subtitle && (
            <p className="mt-1 max-w-2xl text-sm text-muted">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
