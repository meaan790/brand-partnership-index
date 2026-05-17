import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect");

  if (!code) {
    return NextResponse.redirect(
      `${origin}/signin?error=missing_code`
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/signin?error=auth_failed`
    );
  }

  const destination = redirect && redirect.startsWith("/") ? redirect : "/";
  return NextResponse.redirect(`${origin}${destination}`);
}
