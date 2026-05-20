import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect");

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/?error=auth_failed`);
  }

  // Ensure profile exists (belt-and-suspenders — trigger should handle this)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (!profile) {
      const role = user.user_metadata?.role || "retailer";
      await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        role,
        company_name: "",
      });
    }
  }

  const destination = redirect && redirect.startsWith("/") ? redirect : "/dashboard";
  return NextResponse.redirect(`${origin}${destination}`);
}
