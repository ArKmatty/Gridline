import { NextResponse } from "next/server";
import { getNews } from "@/lib/news";

export async function GET() {
  try {
    const items = await getNews(50);
    return NextResponse.json(items, {
      headers: {
        "Cache-Control": "s-maxage=900, stale-while-revalidate=1800",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch news" },
      { status: 502 },
    );
  }
}
