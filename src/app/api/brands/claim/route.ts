import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "brand") {
    return NextResponse.json({ error: "Only brand accounts can claim brands" }, { status: 403 });
  }

  const body = await request.json();
  const { brand_id } = body;

  if (!brand_id) {
    return NextResponse.json({ error: "brand_id is required" }, { status: 400 });
  }

  // Check if already claimed by someone else
  const { data: brand } = await supabase
    .from("brands")
    .select("id, name, claimed_by")
    .eq("id", brand_id)
    .single();

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  if (brand.claimed_by && brand.claimed_by !== user.id) {
    return NextResponse.json({ error: "This brand has already been claimed" }, { status: 409 });
  }

  if (brand.claimed_by === user.id) {
    return NextResponse.json({ ok: true, brand_id: brand.id, already: true });
  }

  const { error } = await supabase
    .from("brands")
    .update({ claimed_by: user.id })
    .eq("id", brand_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, brand_id: brand.id });
}
