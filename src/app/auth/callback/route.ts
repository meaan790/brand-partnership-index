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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/?error=no_user`);
  }

  // Ensure profile exists
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, company_name, country")
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

    // New user — send to onboarding, forwarding redirect param
    const onboardingUrl = new URL("/onboarding", origin);
    if (redirect && redirect.startsWith("/")) onboardingUrl.searchParams.set("redirect", redirect);
    return NextResponse.redirect(onboardingUrl);
  }

  // Existing user with incomplete profile — send to onboarding
  const isIncomplete = !profile.company_name && !profile.country;
  if (isIncomplete) {
    const onboardingUrl = new URL("/onboarding", origin);
    if (redirect && redirect.startsWith("/")) onboardingUrl.searchParams.set("redirect", redirect);
    return NextResponse.redirect(onboardingUrl);
  }

  const destination = redirect && redirect.startsWith("/") ? redirect : "/dashboard";
  return NextResponse.redirect(`${origin}${destination}`);
}
