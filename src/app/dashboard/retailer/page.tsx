import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function RetailerDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
      id,
      status,
      created_at,
      updated_at,
      brands ( name, slug, domain )
    `
    )
    .eq("reviewer_id", user!.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary">
            My Reviews
          </h1>
          <p className="text-on-surface-variant mt-1">
            Your submitted brand reviews and drafts.
          </p>
        </div>
        <Link
          href="/review"
          className="px-4 py-2 bg-accent text-on-accent rounded-full font-semibold text-sm hover:bg-accent/90 transition-colors"
        >
          Review a Brand
        </Link>
      </div>

      {reviews && reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review: Record<string, unknown>) => {
            const brand = review.brands as Record<string, string> | null;
            return (
              <div
                key={review.id as string}
                className="bg-surface-card border border-border-hairline rounded-xl p-5 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-text-main">
                    {brand?.name ?? "Unknown Brand"}
                  </p>
                  <p className="text-sm text-text-caption">
                    {new Date(review.updated_at as string).toLocaleDateString()} &middot;{" "}
                    <span
                      className={
                        review.status === "published"
                          ? "text-score-high"
                          : review.status === "submitted"
                            ? "text-accent"
                            : "text-text-caption"
                      }
                    >
                      {(review.status as string).charAt(0).toUpperCase() +
                        (review.status as string).slice(1)}
                    </span>
                  </p>
                </div>
                {review.status === "draft" && (
                  <Link
                    href={`/review?draft=${review.id}`}
                    className="text-sm font-medium text-accent hover:text-accent/80 transition-colors"
                  >
                    Continue
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface-card border border-border-hairline rounded-xl">
          <span className="material-symbols-outlined text-5xl text-text-caption mb-4">
            rate_review
          </span>
          <p className="text-on-surface-variant mb-4">
            You haven&apos;t reviewed any brands yet.
          </p>
          <Link
            href="/review"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-on-accent rounded-full font-semibold text-sm hover:bg-accent/90 transition-colors"
          >
            Start Your First Review
            <span className="material-symbols-outlined text-lg">
              arrow_forward
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
