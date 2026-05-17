import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { brand_id, brand_name, brand_domain, scores, comments, status } = body;

  if (!scores || typeof scores !== "object") {
    return NextResponse.json(
      { error: "Scores are required" },
      { status: 400 }
    );
  }

  let resolvedBrandId = brand_id;

  if (!resolvedBrandId && brand_name && brand_domain) {
    const { data: existing } = await supabase
      .from("brands")
      .select("id")
      .eq("domain", brand_domain)
      .single();

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
        return NextResponse.json(
          { error: "Failed to create brand", details: brandError.message },
          { status: 500 }
        );
      }
      resolvedBrandId = newBrand.id;
    }
  }

  if (!resolvedBrandId) {
    return NextResponse.json(
      { error: "Brand ID or name/domain required" },
      { status: 400 }
    );
  }

  const reviewStatus = status === "submitted" ? "submitted" : "draft";

  // Check for existing draft
  const { data: existingDraft } = await supabase
    .from("reviews")
    .select("id")
    .eq("reviewer_id", user.id)
    .eq("brand_id", resolvedBrandId)
    .eq("status", "draft")
    .single();

  let reviewId: string;

  if (existingDraft) {
    reviewId = existingDraft.id;
    await supabase
      .from("reviews")
      .update({ status: reviewStatus })
      .eq("id", reviewId);
  } else {
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .insert({
        reviewer_id: user.id,
        brand_id: resolvedBrandId,
        status: reviewStatus,
      })
      .select("id")
      .single();

    if (reviewError) {
      return NextResponse.json(
        { error: "Failed to create review", details: reviewError.message },
        { status: 500 }
      );
    }
    reviewId = review.id;
  }

  // Delete existing scores for this review, then insert fresh
  await supabase.from("review_scores").delete().eq("review_id", reviewId);

  const scoreRows: {
    review_id: string;
    dimension_key: string;
    sub_component_key: string;
    score: number;
    comment: string | null;
  }[] = [];

  for (const [dimKey, subs] of Object.entries(
    scores as Record<string, Record<string, number>>
  )) {
    for (const [subKey, score] of Object.entries(subs)) {
      if (score >= 1 && score <= 5) {
        const subComments =
          (body.subComments as Record<string, Record<string, string>>) || {};
        scoreRows.push({
          review_id: reviewId,
          dimension_key: dimKey,
          sub_component_key: subKey,
          score,
          comment: subComments[dimKey]?.[subKey] || null,
        });
      }
    }
  }

  if (scoreRows.length > 0) {
    const { error: scoresError } = await supabase
      .from("review_scores")
      .insert(scoreRows);

    if (scoresError) {
      return NextResponse.json(
        { error: "Failed to save scores", details: scoresError.message },
        { status: 500 }
      );
    }
  }

  // Save dimension-level comments
  if (comments && typeof comments === "object") {
    await supabase
      .from("review_comments")
      .delete()
      .eq("review_id", reviewId);

    const commentRows = Object.entries(
      comments as Record<string, string>
    )
      .filter(([, text]) => text && text.trim())
      .map(([dimKey, text]) => ({
        review_id: reviewId,
        dimension_key: dimKey,
        comment_text: text.trim(),
      }));

    if (commentRows.length > 0) {
      await supabase.from("review_comments").insert(commentRows);
    }
  }

  return NextResponse.json({ id: reviewId, status: reviewStatus });
}
