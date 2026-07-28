"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CalendarDays,
  Flag,
  Loader2,
  Search,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SearchResult = {
  type: "driver" | "team" | "race";
  id: string;
  title: string;
  subtitle?: string;
  href: string;
};

const ICONS = {
  driver: Users,
  team: Building2,
  race: Flag,
};

export function SearchTrigger() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-black/20 px-2.5 py-1.5 text-sm text-muted transition hover:border-accent/40 hover:text-foreground"
        aria-label="Search"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Search className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted md:inline">
          <span aria-label="Command">⌘</span><span>K</span>
        </kbd>
      </button>
      {open && (
        <CommandPalette
          onClose={() => {
            setOpen(false);
            triggerRef.current?.focus();
          }}
        />
      )}
    </>
  );
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!q.trim()) return;
    const id = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
        const data = (await res.json()) as SearchResult[];
        setResults(data);
        setActive(0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const go = useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [onClose, router],
  );

  const list = useMemo(() => (q.trim() ? results : []), [results, q]);

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-black/70 p-4 pt-[12vh] backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, list.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter" && list[active]) {
            go(list[active].href);
          } else if (e.key === "Tab") {
            e.preventDefault();
          }
        }}
      >
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="h-4 w-4 text-muted" aria-hidden="true" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, list.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter" && list[active]) {
                go(list[active].href);
              } else if (e.key === "Escape") {
                onClose();
              }
            }}
            aria-label="Search drivers, teams, races"
            aria-controls="search-results"
            aria-activedescendant={
              list[active] ? `search-item-${active}` : undefined
            }
            aria-autocomplete="list"
            placeholder="Search drivers, teams, races…"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted" aria-hidden="true" role="status" />
          ) : (
            <button type="button" onClick={onClose} className="p-1 text-muted" aria-label="Close search">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <div
          ref={listRef}
          id="search-results"
          role="listbox"
          aria-label="Search results"
          className="max-h-80 overflow-y-auto p-2"
        >
          {!q.trim() && (
            <p className="px-3 py-6 text-center text-sm text-muted">
              Try &ldquo;Verstappen&rdquo;, &ldquo;Ferrari&rdquo;, or &ldquo;Monaco&rdquo;
            </p>
          )}
          {q.trim() && !loading && !list.length && (
            <p className="px-3 py-6 text-center text-sm text-muted">
              No matches
            </p>
          )}
          {list.map((r, i) => {
            const Icon = ICONS[r.type] ?? CalendarDays;
            return (
              <button
                key={`${r.type}-${r.id}`}
                id={`search-item-${i}`}
                type="button"
                role="option"
                aria-selected={i === active}
                onClick={() => go(r.href)}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm",
                  i === active ? "bg-accent-soft" : "hover:bg-white/5",
                )}
              >
                <Icon className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{r.title}</span>
                  {r.subtitle && (
                    <span className="block text-xs text-muted">{r.subtitle}</span>
                  )}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted">
                  {r.type}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close search"
        onClick={onClose}
        tabIndex={-1}
      />
    </div>
  );
}
