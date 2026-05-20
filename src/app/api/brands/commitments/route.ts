import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

async function getOwnedBrandId(supabase: any, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("brands")
    .select("id")
    .eq("claimed_by", userId)
    .single();
  return data?.id || null;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const brandId = request.nextUrl.searchParams.get("brand_id");
  if (!brandId) return NextResponse.json({ error: "brand_id required" }, { status: 400 });

  const { data, error } = await supabase
    .from("brand_commitments")
    .select("*")
    .eq("brand_id", brandId)
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const brandId = await getOwnedBrandId(supabase, user.id);
  if (!brandId) return NextResponse.json({ error: "No claimed brand" }, { status: 403 });

  const body = await request.json();
  const { text } = body;
  if (!text?.trim()) return NextResponse.json({ error: "text required" }, { status: 400 });

  const { data, error } = await supabase
    .from("brand_commitments")
    .insert({ brand_id: brandId, text: text.trim() })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const brandId = await getOwnedBrandId(supabase, user.id);
  if (!brandId) return NextResponse.json({ error: "No claimed brand" }, { status: 403 });

  const body = await request.json();
  const { id, text, active } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updates: Record<string, any> = {};
  if (typeof text === "string") updates.text = text.trim();
  if (typeof active === "boolean") updates.active = active;

  const { error } = await supabase
    .from("brand_commitments")
    .update(updates)
    .eq("id", id)
    .eq("brand_id", brandId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const brandId = await getOwnedBrandId(supabase, user.id);
  if (!brandId) return NextResponse.json({ error: "No claimed brand" }, { status: 403 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase
    .from("brand_commitments")
    .delete()
    .eq("id", id)
    .eq("brand_id", brandId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
