import { SEED_BRANDS } from "@/lib/seed-data";
import { BrandDirectoryClient } from "./BrandDirectoryClient";
import type { BrandWithScores } from "@/lib/types";

const MIN_DIRECTORY_SIZE = 10;

async function getBrands(): Promise<BrandWithScores[]> {
  let dbBrands: BrandWithScores[] = [];
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("brand_scores_v")
      .select("*")
      .order("score", { ascending: false });

    if (data && data.length > 0) dbBrands = data as BrandWithScores[];
  } catch {
    // Supabase not configured
  }

  if (dbBrands.length >= MIN_DIRECTORY_SIZE) return dbBrands;

  const realSlugs = new Set(dbBrands.map((b) => b.slug));
  const fillers = SEED_BRANDS.filter((b) => !realSlugs.has(b.slug));
  return [...dbBrands, ...fillers].sort((a, b) => b.score - a.score);
}

export default async function BrandsPage() {
  const brands = await getBrands();
  return <BrandDirectoryClient brands={brands} />;
}
