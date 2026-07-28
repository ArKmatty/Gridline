import { Suspense } from "react";
import { Newspaper } from "lucide-react";
import { NewsCard, NewsFeaturedCard } from "@/components/news/news-card";
import { NewsFilters } from "@/components/news/news-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { getNews } from "@/lib/news";

export const metadata = {
  title: "News",
};

export const revalidate = 900;

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const params = await searchParams;
  const source = params.source;
  const all = await getNews(60).catch(() => []);
  const items = source
    ? all.filter((i) => i.source === source)
    : all;
  const [featured, ...rest] = items;

  return (
    <div>
      <SectionHeader
        icon={Newspaper}
        title="F1 news"
        subtitle="Headlines with previews from RaceFans, Autosport, and BBC Sport."
      />

      <Suspense fallback={null}>
        <NewsFilters />
      </Suspense>

      {!items.length ? (
        <EmptyState
          icon={Newspaper}
          title="No headlines right now"
          description="Try another source or check back shortly."
        />
      ) : (
        <div className="space-y-4">
          {featured && <NewsFeaturedCard item={featured} />}
          <div className="grid gap-3">
            {rest.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
