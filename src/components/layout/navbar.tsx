"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Flag,
  Gauge,
  Home,
  Menu,
  Newspaper,
  Sparkles,
  Trophy,
  Users,
  CalendarDays,
  X,
  Building2,
} from "lucide-react";
import { SearchTrigger } from "@/components/search/command-palette";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/weekend", label: "Weekend", icon: Flag },
  { href: "/standings", label: "Standings", icon: Trophy },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/drivers", label: "Drivers", icon: Users },
  { href: "/teams", label: "Teams", icon: Building2 },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/curiosities", label: "Curiosities", icon: Sparkles },
  { href: "/telemetry", label: "Telemetry", icon: Gauge },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="group flex shrink-0 items-center">
          <Image src="/icon.png" alt="Gridline" width={120} height={36} className="h-9 w-auto" priority />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-0.5 xl:flex">
          {links.map((link) => {
            const Icon = link.icon;
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent-soft text-white"
                    : "text-muted hover:bg-white/5 hover:text-foreground",
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "h-3.5 w-3.5",
                    active ? "text-accent" : "opacity-70",
                  )}
                />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <SearchTrigger />
          <nav aria-label="Secondary" className="hidden items-center gap-0.5 lg:flex xl:hidden">
            {links.slice(0, 6).map((link) => {
              const Icon = link.icon;
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  title={link.label}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-lg p-2 transition-colors",
                    active
                      ? "bg-accent-soft text-accent"
                      : "text-muted hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </Link>
              );
            })}
          </nav>

          <button
            ref={buttonRef}
            type="button"
            className="rounded-lg border border-border p-2 text-foreground lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <nav ref={menuRef} aria-label="Mobile" className="border-t border-border bg-card lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-1 p-3 sm:grid-cols-2">
            {links.map((link) => {
              const Icon = link.icon;
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium",
                    active
                      ? "bg-accent-soft text-white"
                      : "text-muted hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className={cn("h-4 w-4", active && "text-accent")}
                  />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
