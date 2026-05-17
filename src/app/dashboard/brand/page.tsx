import { createClient } from "@/lib/supabase/server";
import { DIMENSIONS } from "@/lib/constants";
import { ScoreBadge } from "@/components/ScoreBadge";
import Link from "next/link";

export default async function BrandDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: brand } = await supabase
    .from("brands")
    .select("*")
    .eq("claimed_by", user!.id)
    .single();

  if (!brand) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16 bg-surface-card border border-border-hairline rounded-xl">
          <span className="material-symbols-outlined text-5xl text-text-caption mb-4">
            storefront
          </span>
          <h1 className="font-serif text-2xl font-bold text-primary mb-2">
            No Brand Claimed
          </h1>
          <p className="text-on-surface-variant mb-6 max-w-md mx-auto">
            You haven&apos;t claimed a brand profile yet. If your brand is
            listed on the index, you can claim it to access your dashboard.
          </p>
          <Link
            href="/brands"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-on-accent rounded-full font-semibold text-sm hover:bg-accent/90 transition-colors"
          >
            Browse Brands
            <span className="material-symbols-outlined text-lg">
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    );
  }

  const { data: dimScores } = await supabase
    .from("brand_dim_scores_v")
    .select("*")
    .eq("brand_id", brand.id);

  const { data: recentReviews } = await supabase
    .from("reviews")
    .select(
      `
      id,
      status,
      created_at,
      review_scores ( dimension_key, sub_component_key, score, comment ),
      review_comments ( dimension_key, comment_text )
    `
    )
    .eq("brand_id", brand.id)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(10);

  const overallScore = dimScores
    ? Math.round(
        dimScores.reduce(
          (sum: number, d: Record<string, unknown>) =>
            sum + Number(d.dim_score),
          0
        )
      )
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-primary">
          {brand.name} Dashboard
        </h1>
        <p className="text-on-surface-variant mt-1">
          Your brand&apos;s performance across the Brand Partnership Index.
        </p>
      </div>

      {/* Score overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <div className="md:col-span-1 bg-surface-card border border-border-hairline rounded-xl p-5 flex flex-col items-center justify-center">
          <p className="text-xs text-text-caption uppercase tracking-wider mb-2">
            Overall
          </p>
          <ScoreBadge score={overallScore} max={100} size="lg" />
          <p className="text-xs text-text-caption mt-1">/100</p>
        </div>
        {DIMENSIONS.map((dim) => {
          const dimData = dimScores?.find(
            (d: Record<string, unknown>) => d.dimension_key === dim.key
          );
          const score = dimData ? Math.round(Number(dimData.dim_score)) : 0;
          return (
            <div
              key={dim.key}
              className="bg-surface-card border border-border-hairline rounded-xl p-4 flex flex-col items-center"
            >
              <p className="text-xs text-text-caption mb-2">{dim.short}</p>
              <ScoreBadge score={score} max={20} size="sm" />
              <p className="text-xs text-text-caption mt-1">/20</p>
            </div>
          );
        })}
      </div>

      {/* Recent reviews */}
      <div className="bg-surface-card border border-border-hairline rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border-hairline">
          <h2 className="font-serif text-lg font-semibold text-primary">
            Recent Reviews
          </h2>
        </div>
        {recentReviews && recentReviews.length > 0 ? (
          <div className="divide-y divide-border-hairline">
            {recentReviews.map((review: Record<string, unknown>) => {
              const comments = review.review_comments as
                | Record<string, unknown>[]
                | null;
              return (
                <div key={review.id as string} className="px-6 py-4">
                  <p className="text-sm text-text-caption mb-2">
                    {new Date(
                      review.created_at as string
                    ).toLocaleDateString()}
                  </p>
                  {comments?.map(
                    (c: Record<string, unknown>, i: number) => {
                      if (!c.comment_text) return null;
                      return (
                        <p
                          key={i}
                          className="text-sm text-on-surface-variant mb-1"
                        >
                          <span className="font-medium text-text-main">
                            {
                              DIMENSIONS.find(
                                (d) => d.key === c.dimension_key
                              )?.short
                            }
                            :
                          </span>{" "}
                          {String(c.comment_text)}
                        </p>
                      );
                    }
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-on-surface-variant">
              No published reviews yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
