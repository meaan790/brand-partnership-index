import { SEED_BRANDS } from "@/lib/seed-data";
import { BrandDirectoryClient } from "./BrandDirectoryClient";
import type { BrandWithScores } from "@/lib/types";

async function getBrands(): Promise<BrandWithScores[]> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("brand_scores_v")
      .select("*")
      .order("score", { ascending: false });

    if (data && data.length > 0) return data as BrandWithScores[];
  } catch {
    // Supabase not configured
  }
  return [...SEED_BRANDS].sort((a, b) => b.score - a.score);
}

export default async function BrandsPage() {
  const brands = await getBrands();
  return <BrandDirectoryClient brands={brands} />;
}
