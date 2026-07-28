"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Home,
  MoreHorizontal,
  Newspaper,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  {
    href: "/standings",
    label: "Standings",
    icon: Trophy,
    match: (p: string) => p.startsWith("/standings"),
  },
  {
    href: "/weekend",
    label: "Weekend",
    icon: CalendarDays,
    match: (p: string) => p.startsWith("/weekend") || p.startsWith("/races"),
  },
  {
    href: "/news",
    label: "News",
    icon: Newspaper,
    match: (p: string) => p.startsWith("/news"),
  },
  {
    href: "/more",
    label: "More",
    icon: MoreHorizontal,
    match: (p: string) =>
      p.startsWith("/more") ||
      p.startsWith("/drivers") ||
      p.startsWith("/teams") ||
      p.startsWith("/calendar") ||
      p.startsWith("/curiosities") ||
      p.startsWith("/telemetry"),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium",
                active ? "text-accent font-semibold" : "text-muted",
              )}
            >
              <Icon aria-hidden="true" className={cn("h-5 w-5", active && "text-accent")} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
