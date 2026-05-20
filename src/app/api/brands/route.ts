import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { SEED_BRANDS } from "@/lib/seed-data";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q");

  // If ?q= is provided, search brands by name (for review page typeahead)
  if (query && query.length >= 2) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("brands")
        .select("id, name, slug, domain, logo_url")
        .ilike("name", `%${query}%`)
        .order("name")
        .limit(8);

      if (data && data.length > 0) {
        return NextResponse.json(data);
      }
    } catch {
      // Supabase not configured — fall through to seed data
    }

    // Fallback: search seed data
    const lower = query.toLowerCase();
    const matches = SEED_BRANDS
      .filter((b) => b.name.toLowerCase().includes(lower))
      .slice(0, 8)
      .map((b) => ({ id: b.id, name: b.name, slug: b.slug, domain: b.domain, logo_url: b.logo_url }));

    return NextResponse.json(matches);
  }

  // No query — return full leaderboard
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("brand_scores_v")
      .select("*")
      .order("score", { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json(SEED_BRANDS);
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(SEED_BRANDS);
  }
}
