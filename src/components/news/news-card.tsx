import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { ExternalLink, Newspaper } from "lucide-react";
import type { NewsItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function NewsImage({
  src,
  alt,
  className,
  priority,
}: {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={cn("object-cover", className)}
        sizes="(max-width: 768px) 100vw, 400px"
        unoptimized
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/30 via-card to-black">
      <Newspaper className="h-10 w-10 text-white/30" />
    </div>
  );
}

export function NewsFeaturedCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="card card-hover group grid overflow-hidden md:grid-cols-[1.2fr_1fr]"
    >
      <div className="relative min-h-[200px] md:min-h-[280px]">
        <NewsImage src={item.image} alt="" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden" />
      </div>
      <div className="flex flex-col justify-center p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <Badge className="border-accent/30 bg-accent-soft text-red-200">
            {item.source}
          </Badge>
          <time dateTime={item.pubDate} title={new Date(item.pubDate).toLocaleString("it-IT")}>
            {formatDistanceToNow(new Date(item.pubDate), { addSuffix: true, locale: it })}
          </time>
        </div>
        <h2 className="mt-3 text-xl font-bold leading-snug group-hover:text-accent sm:text-2xl">
          {item.title}
        </h2>
        {item.summary && (
          <p className="mt-3 line-clamp-3 text-sm text-muted">{item.summary}</p>
        )}
        {item.related && item.related.length > 0 && (
          <p className="mt-2 text-xs text-muted">
            Also reported by{" "}
            {item.related.map((r, i) => (
              <span key={r.link}>
                <span className="text-foreground/70 hover:text-accent">{r.source}</span>
                {i < item.related!.length - 1 && ", "}
              </span>
            ))}
          </p>
        )}
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
          Read article <ExternalLink className="h-3.5 w-3.5" />
        </span>
      </div>
    </a>
  );
}

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="card card-hover group flex flex-col overflow-hidden sm:flex-row"
    >
      <div className="relative h-40 w-full shrink-0 sm:h-auto sm:w-44 md:w-52">
        <NewsImage src={item.image} alt="" />
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <Badge>{item.source}</Badge>
          <time dateTime={item.pubDate} title={new Date(item.pubDate).toLocaleString("it-IT")}>
            {formatDistanceToNow(new Date(item.pubDate), { addSuffix: true, locale: it })}
          </time>
        </div>
        <div className="mt-2 flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold leading-snug group-hover:text-accent sm:text-lg">
            {item.title}
          </h2>
          <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted opacity-60 transition group-hover:opacity-100" />
        </div>
        {item.summary && (
          <p className="mt-2 line-clamp-2 text-sm text-muted">{item.summary}</p>
        )}
        {item.related && item.related.length > 0 && (
          <p className="mt-2 text-xs text-muted">
            Also reported by{" "}
            {item.related.map((r, i) => (
              <span key={r.link}>
                <span className="text-foreground/70 hover:text-accent">{r.source}</span>
                {i < item.related!.length - 1 && ", "}
              </span>
            ))}
          </p>
        )}
      </div>
    </a>
  );
}

export function NewsThumbRow({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 py-3 transition hover:bg-white/[0.02]"
    >
      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-border">
        <NewsImage src={item.image} alt="" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs text-muted">
          <Badge>{item.source}</Badge>
          <time dateTime={item.pubDate} title={new Date(item.pubDate).toLocaleString("it-IT")}>
            {formatDistanceToNow(new Date(item.pubDate), { addSuffix: true, locale: it })}
          </time>
        </div>
        <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug hover:text-accent">
          {item.title}
        </p>
      </div>
    </a>
  );
}
