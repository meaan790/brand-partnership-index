import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { SEED_BRANDS } from "@/lib/seed-data";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("brand_scores_v")
      .select("*")
      .order("overall_score", { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json(SEED_BRANDS);
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(SEED_BRANDS);
  }
}
