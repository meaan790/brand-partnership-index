import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  let supabase;
  try {
    supabase = await createClient();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Supabase not configured", details: msg },
      { status: 503 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { brand_id, brand_name, brand_domain, scores, pros, cons, status } =
    body;

  if (!scores || typeof scores !== "object" || Object.keys(scores).length === 0) {
    return NextResponse.json(
      { error: "Scores are required" },
      { status: 400 },
    );
  }

  // Fetch reviewer profile for location data
  const { data: profile } = await supabase
    .from("profiles")
    .select("country, store_city")
    .eq("id", user.id)
    .single();

  const reviewerCountry = profile?.country ?? null;
  const reviewerCity = profile?.store_city ?? null;

  // Resolve brand — by ID or by name+domain (upsert)
  let resolvedBrandId = brand_id;

  if (!resolvedBrandId && brand_name && brand_domain) {
    const { data: existing } = await supabase
      .from("brands")
      .select("id")
      .eq("domain", brand_domain)
      .maybeSingle();

    if (existing) {
      resolvedBrandId = existing.id;
    } else {
      const slug = brand_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const { data: newBrand, error: brandError } = await supabase
        .from("brands")
        .insert({
          name: brand_name,
          slug,
          domain: brand_domain,
          categories: [],
        })
        .select("id")
        .single();

      if (brandError) {
        // Slug collision — try with a suffix
        if (brandError.code === "23505") {
          const slugRetry = `${slug}-${Date.now().toString(36)}`;
          const { data: retryBrand, error: retryError } = await supabase
            .from("brands")
            .insert({
              name: brand_name,
              slug: slugRetry,
              domain: brand_domain,
              categories: [],
            })
            .select("id")
            .single();

          if (retryError) {
            return NextResponse.json(
              { error: "Failed to create brand", details: retryError.message },
              { status: 500 },
            );
          }
          resolvedBrandId = retryBrand.id;
        } else {
          return NextResponse.json(
            { error: "Failed to create brand", details: brandError.message },
            { status: 500 },
          );
        }
      } else {
        resolvedBrandId = newBrand.id;
      }
    }
  }

  if (!resolvedBrandId) {
    return NextResponse.json(
      { error: "Brand ID or name/domain required" },
      { status: 400 },
    );
  }

  const reviewStatus = status === "submitted" ? "submitted" : "draft";

  // Check for existing draft by same reviewer for same brand
  const { data: existingDraft } = await supabase
    .from("reviews")
    .select("id")
    .eq("reviewer_id", user.id)
    .eq("brand_id", resolvedBrandId)
    .eq("status", "draft")
    .maybeSingle();

  let reviewId: string;

  if (existingDraft) {
    reviewId = existingDraft.id;
    const { error: updateError } = await supabase
      .from("reviews")
      .update({ status: reviewStatus, country: reviewerCountry, store_city: reviewerCity })
      .eq("id", reviewId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update review", details: updateError.message },
        { status: 500 },
      );
    }
  } else {
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .insert({
        reviewer_id: user.id,
        brand_id: resolvedBrandId,
        status: reviewStatus,
        country: reviewerCountry,
        store_city: reviewerCity,
      })
      .select("id")
      .single();

    if (reviewError) {
      return NextResponse.json(
        { error: "Failed to create review", details: reviewError.message },
        { status: 500 },
      );
    }
    reviewId = review.id;
  }

  // Save dimension-level scores
  const { error: deleteScoresError } = await supabase
    .from("review_scores")
    .delete()
    .eq("review_id", reviewId);

  if (deleteScoresError) {
    return NextResponse.json(
      { error: "Failed to clear old scores", details: deleteScoresError.message },
      { status: 500 },
    );
  }

  const scoreRows = Object.entries(scores as Record<string, number>)
    .filter(([, score]) => score >= 1 && score <= 5)
    .map(([dimKey, score]) => ({
      review_id: reviewId,
      dimension_key: dimKey,
      sub_component_key: "overall",
      score,
      comment: null,
    }));

  if (scoreRows.length > 0) {
    const { error: scoresError } = await supabase
      .from("review_scores")
      .insert(scoreRows);

    if (scoresError) {
      return NextResponse.json(
        { error: "Failed to save scores", details: scoresError.message },
        { status: 500 },
      );
    }
  }

  // Save pros/cons as review comments
  const { error: deleteCommentsError } = await supabase
    .from("review_comments")
    .delete()
    .eq("review_id", reviewId);

  if (deleteCommentsError) {
    return NextResponse.json(
      { error: "Failed to clear old comments", details: deleteCommentsError.message },
      { status: 500 },
    );
  }

  const commentRows: { review_id: string; dimension_key: string; comment_text: string }[] = [];
  if (pros && typeof pros === "string" && pros.trim()) {
    commentRows.push({
      review_id: reviewId,
      dimension_key: "_pros",
      comment_text: pros.trim(),
    });
  }
  if (cons && typeof cons === "string" && cons.trim()) {
    commentRows.push({
      review_id: reviewId,
      dimension_key: "_cons",
      comment_text: cons.trim(),
    });
  }
  if (commentRows.length > 0) {
    const { error: commentsError } = await supabase
      .from("review_comments")
      .insert(commentRows);

    if (commentsError) {
      return NextResponse.json(
        { error: "Failed to save comments", details: commentsError.message },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ id: reviewId, status: reviewStatus });
}
