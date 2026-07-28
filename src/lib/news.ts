import Parser from "rss-parser";
import type { NewsItem } from "./types";

const FEEDS: { source: string; url: string }[] = [
  {
    source: "RaceFans",
    url: "https://www.racefans.net/feed/",
  },
  {
    source: "Autosport",
    url: "https://www.autosport.com/rss/f1/news/",
  },
  {
    source: "BBC Sport",
    url: "https://feeds.bbci.co.uk/sport/formula1/rss.xml",
  },
];

type CustomItem = {
  content?: string;
  "content:encoded"?: string;
  summary?: string;
  enclosure?: { url?: string; type?: string };
  "media:content"?: { $?: { url?: string; type?: string; medium?: string } };
  "media:thumbnail"?: { $?: { url?: string } };
};

const parser = new Parser<Record<string, unknown>, CustomItem>({
  timeout: 10000,
  headers: {
    "User-Agent": "GridlineF1/1.0 (fan app; +https://localhost)",
    Accept: "application/rss+xml, application/xml, text/xml",
  },
  customFields: {
    item: [
      "media:content",
      "media:thumbnail",
      "content:encoded",
      ["media:group", "mediaGroup"],
    ],
  },
});

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeUrl(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined;
  let url = raw.trim().replace(/^["']|["']$/g, "");
  if (url.startsWith("//")) url = `https:${url}`;
  if (!/^https?:\/\//i.test(url)) return undefined;
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return undefined;
    return parsed.toString();
  } catch {
    return undefined;
  }
}

function firstImgFromHtml(html?: string): string | undefined {
  if (!html) return undefined;
  const match =
    html.match(/<img[^>]+src=["']([^"']+)["']/i) ||
    html.match(/srcset=["']([^"'\s]+)/i);
  return normalizeUrl(match?.[1]);
}

function extractImage(item: CustomItem & Parser.Item): string | undefined {
  const enclosureType = item.enclosure?.type ?? "";
  if (
    item.enclosure?.url &&
    (enclosureType.startsWith("image/") ||
      !enclosureType ||
      /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(item.enclosure.url))
  ) {
    const fromEnclosure = normalizeUrl(item.enclosure.url);
    if (fromEnclosure) return fromEnclosure;
  }

  const mediaContent = item["media:content"]?.$?.url;
  if (mediaContent) {
    const fromMedia = normalizeUrl(mediaContent);
    if (fromMedia) return fromMedia;
  }

  const thumb = item["media:thumbnail"]?.$?.url;
  if (thumb) {
    const fromThumb = normalizeUrl(thumb);
    if (fromThumb) return fromThumb;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyItem = item as any;
  if (anyItem.mediaGroup?.["media:content"]) {
    const group = anyItem.mediaGroup["media:content"];
    const first = Array.isArray(group) ? group[0] : group;
    const fromGroup = normalizeUrl(first?.$?.url ?? first?.url);
    if (fromGroup) return fromGroup;
  }

  return (
    firstImgFromHtml(item["content:encoded"]) ||
    firstImgFromHtml(item.content) ||
    firstImgFromHtml(item.summary)
  );
}

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
  "be", "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "can", "this", "that", "these", "those", "it",
  "its", "not", "no", "so", "if", "then", "than", "too", "very", "just",
  "about", "after", "all", "also", "back", "because", "before", "between",
  "both", "come", "each", "even", "first", "get", "got", "here", "how",
  "into", "know", "long", "look", "make", "many", "more", "most", "much",
  "new", "now", "only", "other", "our", "out", "over", "people", "said",
  "same", "she", "some", "still", "such", "take", "tell", "their", "them",
  "there", "they", "thing", "think", "through", "time", "under", "up", "us",
  "used", "using", "want", "way", "we", "well", "what", "when", "where",
  "which", "while", "who", "why", "work", "year", "your", "about", "after",
  "your", "you", "been", "being", "during", "above", "below", "down",
]);

function significantWords(title: string): Set<string> {
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP_WORDS.has(w));
  return new Set(words);
}

function groupRelatedStories(items: NewsItem[]): NewsItem[] {
  const sorted = [...items].sort(
    (a, b) => new Date(a.pubDate).getTime() - new Date(b.pubDate).getTime(),
  );
  const grouped = new Set<number>();
  const result: NewsItem[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (grouped.has(i)) continue;

    const primary = sorted[i];
    const primaryWords = significantWords(primary.title);
    const primaryTime = new Date(primary.pubDate).getTime();
    const related: { source: string; link: string; title: string }[] = [];

    for (let j = i + 1; j < sorted.length; j++) {
      if (grouped.has(j)) continue;

      const candidate = sorted[j];
      const candidateTime = new Date(candidate.pubDate).getTime();
      const hoursDiff = (candidateTime - primaryTime) / (1000 * 60 * 60);

      if (hoursDiff > 6) break;
      if (candidate.source === primary.source) continue;

      const candidateWords = significantWords(candidate.title);
      let overlap = 0;
      for (const word of primaryWords) {
        if (candidateWords.has(word)) overlap++;
      }

      if (overlap >= 3) {
        related.push({
          source: candidate.source,
          link: candidate.link,
          title: candidate.title,
        });
        grouped.add(j);
      }
    }

    if (related.length > 0) {
      result.push({ ...primary, related });
    } else {
      result.push(primary);
    }
  }

  return result;
}

export async function getNews(limit = 40): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url);
      return (parsed.items ?? []).map((item, index) => {
        const title = item.title?.trim() || "Untitled";
        const link = item.link || item.guid || "";
        const pubDate =
          item.isoDate || item.pubDate || new Date().toISOString();
        const summary = item.contentSnippet || item.content || item.summary;
        return {
          id: `${feed.source}-${link || index}-${title}`.slice(0, 180),
          title,
          link,
          pubDate,
          source: feed.source,
          summary: summary ? stripHtml(summary).slice(0, 220) : undefined,
          image: extractImage(item),
        } satisfies NewsItem;
      });
    }),
  );

  const items: NewsItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") items.push(...r.value);
  }

  const seen = new Set<string>();
  const unique = items.filter((item) => {
    const key = item.title.toLowerCase().replace(/\s+/g, " ").trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return Boolean(item.link);
  });

  const grouped = groupRelatedStories(unique);

  grouped.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
  );

  return grouped.slice(0, limit);
}
