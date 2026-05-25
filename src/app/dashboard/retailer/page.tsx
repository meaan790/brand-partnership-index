import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DIMENSIONS } from "@/lib/constants";
import { tierClass20 } from "@/lib/scoring";

const RECOMMENDED = [
  { slug: "mountain-hardwear", initials: "MH", name: "Mountain Hardwear", category: "Outerwear" },
  { slug: "smartwool", initials: "SM", name: "Smartwool", category: "Apparel" },
  { slug: "cotopaxi", initials: "CO", name: "Cotopaxi", category: "Outdoor" },
];

interface ReviewRow {
  id: string;
  brand_name: string;
  brand_slug: string;
  status: string;
  total_score: number;
  created_at: string;
}

export default async function RetailerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_name, store_city, store_region, country")
    .eq("id", user!.id)
    .single();

  const companyName = profile?.company_name || "Your Store";
  const locationParts = [profile?.store_city, profile?.store_region].filter(Boolean);
  const locationStr = locationParts.length > 0 ? locationParts.join(", ") : null;

  // Fetch user's reviews with brand info and scores
  const { data: rawReviews } = await supabase
    .from("reviews")
    .select(`
      id, status, created_at,
      brands!inner(name, slug),
      review_scores(dimension_key, score)
    `)
    .eq("reviewer_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const reviews: ReviewRow[] = (rawReviews || []).map((r: any) => {
    const dimScores: Record<string, number> = {};
    for (const s of r.review_scores || []) {
      dimScores[s.dimension_key] = (dimScores[s.dimension_key] || 0) + s.score;
    }
    const total = Object.values(dimScores).reduce((sum: number, v: number) => sum + v * 4, 0);
    return {
      id: r.id,
      brand_name: r.brands?.name || "Unknown",
      brand_slug: r.brands?.slug || "",
      status: r.status,
      total_score: total,
      created_at: r.created_at,
    };
  });

  const totalReviews = reviews.length;
  const publishedCount = reviews.filter((r) => r.status === "published").length;
  const submittedCount = reviews.filter((r) => r.status === "submitted").length;

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function scoreColorClass(score: number) {
    if (score >= 70) return "bg-score-high";
    if (score >= 40) return "bg-score-mid";
    return "bg-score-low";
  }

  function statusLabel(status: string) {
    if (status === "published") return "Published";
    if (status === "submitted") return "Under Review";
    return "Draft";
  }

  function statusDot(status: string) {
    if (status === "published") return "bg-score-high";
    if (status === "submitted") return "bg-score-mid";
    return "bg-text-caption";
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
      <header className="mb-section-gap">
        <h1 className="font-display-lg text-display-lg text-primary mb-2">
          Welcome back, {companyName}
        </h1>
        <p className="font-body-md text-body-md text-text-caption">
          {locationStr ? `${locationStr} · ` : ""}Here&apos;s a summary of your recent activity.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8 space-y-section-gap">
          {/* Activity & Quick Action */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <div className="bg-surface-card border border-border-hairline p-card-padding flex flex-col justify-between h-full">
              <div>
                <h2 className="font-label-caps text-label-caps text-text-caption uppercase mb-4">
                  Your Activity
                </h2>
                <div className="flex items-baseline space-x-2 mb-6">
                  <span className="font-headline-lg text-headline-lg text-primary">
                    {totalReviews}
                  </span>
                  <span className="font-body-md text-body-md text-text-caption">
                    {totalReviews === 1 ? "Review" : "Reviews"} Submitted
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-surface-variant pb-2">
                  <span className="font-body-md text-body-md text-text-main">Published</span>
                  <span className="font-data-tabular text-data-tabular text-primary">{publishedCount}</span>
                </div>
                <div className="flex justify-between items-center border-b border-surface-variant pb-2">
                  <span className="font-body-md text-body-md text-text-main">Under Review</span>
                  <span className="font-data-tabular text-data-tabular text-score-mid">{submittedCount}</span>
                </div>
              </div>
            </div>

            <Link
              href="/review"
              className="bg-surface-card border border-border-hairline p-card-padding flex flex-col justify-center items-start h-full group hover:bg-surface-container-low transition-colors cursor-pointer relative overflow-hidden no-underline"
            >
              <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-[120px]">rate_review</span>
              </div>
              <div className="bg-surface-container-low text-primary w-12 h-12 flex items-center justify-center rounded-full mb-6 z-10">
                <span className="material-symbols-outlined">add</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-primary mb-2 z-10">
                Review a New Brand
              </h2>
              <p className="font-body-md text-body-md text-text-caption mb-6 z-10">
                Submit a new wholesale partner review.
              </p>
              <span className="font-label-caps text-label-caps uppercase bg-primary text-on-primary px-6 py-3 rounded-full hover:bg-primary/90 transition-colors z-10">
                Start Review
              </span>
            </Link>
          </section>

          {/* Reviews Table */}
          <section>
            <div className="flex justify-between items-end border-b border-border-hairline pb-4 mb-6">
              <h2 className="font-headline-md text-headline-md text-primary">
                Your Reviews
              </h2>
            </div>
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-text-caption mb-3" style={{ fontSize: 48 }}>rate_review</span>
                <p className="font-body-md text-body-md text-text-caption mb-4">You haven&apos;t submitted any reviews yet.</p>
                <Link href="/review" className="bg-primary text-on-primary font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity">
                  Review a Brand
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-hairline">
                      <th className="py-3 px-2 font-label-caps text-label-caps text-text-caption uppercase font-normal">Brand</th>
                      <th className="py-3 px-2 font-label-caps text-label-caps text-text-caption uppercase font-normal">Date</th>
                      <th className="py-3 px-2 font-label-caps text-label-caps text-text-caption uppercase font-normal">Score</th>
                      <th className="py-3 px-2 font-label-caps text-label-caps text-text-caption uppercase font-normal">Status</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md">
                    {reviews.map((r) => (
                      <tr key={r.id} className="border-b border-border-hairline hover:bg-surface-container-low transition-colors">
                        <td className="py-4 px-2">
                          <Link href={`/brands/${r.brand_slug}`} className="font-semibold text-primary hover:underline">
                            {r.brand_name}
                          </Link>
                        </td>
                        <td className="py-4 px-2 text-text-caption">{formatDate(r.created_at)}</td>
                        <td className="py-4 px-2">
                          <div className={`${scoreColorClass(r.total_score)} text-white font-data-tabular text-data-tabular px-2 h-8 flex items-center justify-center`}>
                            {r.total_score}/100
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <span className="inline-flex items-center px-2 py-1 bg-surface-variant text-text-main font-caption text-caption rounded-full">
                            <span className={`w-2 h-2 rounded-full ${statusDot(r.status)} mr-2`} />
                            {statusLabel(r.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-gutter mt-12 lg:mt-0">
          {/* Profile Card */}
          <div className="bg-surface-card border border-border-hairline p-card-padding">
            <h3 className="font-label-caps text-label-caps text-text-caption uppercase mb-4 tracking-widest border-b border-border-hairline pb-4">
              Your Profile
            </h3>
            <div className="space-y-2 mb-4">
              <p className="font-body-md text-body-md font-semibold text-primary">{companyName}</p>
              {locationStr && <p className="font-caption text-caption text-text-caption">{locationStr}</p>}
              {profile?.country && <p className="font-caption text-caption text-text-caption">Country: {profile.country}</p>}
            </div>
            <Link href="/dashboard/profile" className="font-caption text-caption text-primary hover:underline">
              Edit Profile
            </Link>
          </div>

          {/* Recommended to Review */}
          <div className="bg-surface-container-low border border-border-hairline p-card-padding">
            <h3 className="font-label-caps text-label-caps text-text-caption uppercase mb-6 tracking-widest border-b border-border-hairline pb-4">
              Recommended to Review
            </h3>
            <p className="font-caption text-caption text-text-caption mb-6">
              Help strengthen the index by reviewing these popular brands.
            </p>
            <ul className="space-y-4">
              {RECOMMENDED.map((r) => (
                <li key={r.initials}>
                  <Link href={`/brands/${r.slug}`} className="flex items-center justify-between group no-underline">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-surface-card border border-border-hairline flex items-center justify-center font-label-caps text-label-caps text-primary">
                        {r.initials}
                      </div>
                      <div>
                        <div className="font-body-md text-body-md font-semibold text-primary group-hover:text-link-endvr transition-colors">
                          {r.name}
                        </div>
                        <div className="font-caption text-caption text-text-caption">{r.category}</div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-text-caption opacity-0 group-hover:opacity-100 transition-opacity">
                      arrow_forward
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
