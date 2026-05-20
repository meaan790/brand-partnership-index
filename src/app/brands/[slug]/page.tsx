import Link from "next/link";
import { notFound } from "next/navigation";
import { DIMENSIONS } from "@/lib/constants";
import { SEED_BRANDS } from "@/lib/seed-data";
import { SignInLink } from "@/components/SignInLink";
import {
  tierBg,
  tierBar,
  tierText,
  changeClass,
  strokeColor,
  genDist,
} from "@/lib/scoring";
import { BrandLogo } from "@/components/BrandLogo";
import { FollowButton } from "./follow-button";
import { SelfReportTabs } from "./self-report-tabs";
import type { BrandWithScores } from "@/lib/types";

const REVIEW_TEMPLATES = [
  {
    retailer: "Runners Roost",
    location: "Austin, TX",
    ago: "2 weeks ago",
    dimScores: [17, 18, 19, 20, 16],
    quote:
      "Best in class for shop floor support. Their tech reps are always available, and the training materials they provide make a noticeable difference in sell-through.",
    response: {
      ago: "1 week ago",
      body: "Thank you. We invest heavily in our tech reps because we know the shop floor is where the magic happens.",
    },
  },
  {
    retailer: "Fleet Feet",
    location: "Chicago, IL",
    ago: "1 month ago",
    dimScores: [15, 16, 14, 18, 13],
    quote:
      "MAP discipline is solid, but we\u2019ve seen some inventory routing prioritize their own DTC channel during the holiday rush. Still one of our strongest partners overall.",
    response: undefined,
  },
  {
    retailer: "Mountain Sports Shop",
    location: "Boulder, CO",
    ago: "6 weeks ago",
    dimScores: [18, 17, 19, 19, 15],
    quote:
      "Their seasonal calendar is shared months ahead. Knowing exactly when promo windows hit lets us plan our open-to-buy with confidence \u2014 that\u2019s rare in this industry.",
    response: undefined,
  },
];

const STATEMENT_TEMPLATES: Record<string, string> = {
  "Brand.com Standards":
    "We hold the line on brand.com behavior. No flash sales, no liquidation banners, and our DTC PDPs link to local stockists when in-stock inventory exists within 50 miles of the shopper.",
  "Pricing Standards":
    "We hold MAP across all wholesale partners and police violations within 48 hours. Our dedicated team monitors online pricing daily to ensure a level playing field for our specialty accounts.",
  "Shop Local Support":
    "Every retailer locator search routes traffic to specialty accounts before our own DTC checkout. We measure routed sessions weekly and share the dashboard with our top accounts quarterly.",
  "Shop Floor Support":
    "Tech reps visit every Tier 1 and Tier 2 account at least twice a season. We fund staff training, sample programs, and clinic stipends for any shop running an in-store event.",
  "Pro Deal Standards":
    "Pro deals are limited to verified industry professionals at 40% off, capped at 4 units per category per year. We do not stack additional discounts through any third-party employee perk platform.",
};

const COMMITMENTS = [
  "MAP Defense",
  "Retail Investment Parity",
  "Seasonal Calendar Sharing",
  "DTC Firewall",
];

interface RealReview {
  id: string;
  status: string;
  created_at: string;
  country: string | null;
  store_city: string | null;
  dimScores: number[];
  pros: string | null;
  cons: string | null;
}

async function getBrand(slug: string): Promise<BrandWithScores | null> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("brand_scores_v")
      .select("*")
      .eq("slug", slug)
      .single();
    if (data) return data as BrandWithScores;
  } catch {
    // Supabase not configured
  }
  return SEED_BRANDS.find((b) => b.slug === slug) ?? null;
}

async function getBrandReviews(brandSlug: string): Promise<RealReview[]> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: brand } = await supabase.from("brands").select("id").eq("slug", brandSlug).single();
    if (!brand) return [];
    const { data } = await supabase
      .from("reviews")
      .select("id, status, created_at, country, store_city, review_scores(dimension_key, score), review_comments(dimension_key, comment_text)")
      .eq("brand_id", brand.id)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(10);
    if (!data || data.length === 0) return [];
    const dimKeys = ["website", "pricing", "local", "floor", "pro"];
    return data.map((r: any) => {
      const scoreMap: Record<string, number> = {};
      for (const s of r.review_scores || []) scoreMap[s.dimension_key] = s.score * 4;
      const prosComment = (r.review_comments || []).find((c: any) => c.dimension_key === "_pros");
      const consComment = (r.review_comments || []).find((c: any) => c.dimension_key === "_cons");
      return {
        id: r.id,
        status: r.status,
        created_at: r.created_at,
        country: r.country,
        store_city: r.store_city,
        dimScores: dimKeys.map((k) => scoreMap[k] || 0),
        pros: prosComment?.comment_text || null,
        cons: consComment?.comment_text || null,
      };
    });
  } catch { return []; }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return { title: "Brand not found" };
  return {
    title: `${brand.name} \u2014 Brand Partnership Index`,
    description:
      brand.description ??
      `See how ${brand.name} scores across five retail partnership dimensions.`,
  };
}

export default async function BrandProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) notFound();

  const claimed = !!brand.claimed_by;
  const reviews = brand.review_count;

  // Fetch real commitments
  let realCommitments: { text: string; active: boolean }[] = [];
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: dbBrand } = await supabase.from("brands").select("id").eq("slug", slug).single();
    if (dbBrand) {
      const { data: comms } = await supabase
        .from("brand_commitments")
        .select("text, active")
        .eq("brand_id", dbBrand.id)
        .order("sort_order");
      if (comms && comms.length > 0) realCommitments = comms;
    }
  } catch { /* ignore */ }

  let activeCount = 0;
  if (claimed) {
    if (brand.score >= 80) activeCount = 4;
    else if (brand.score >= 70) activeCount = 3;
    else if (brand.score >= 60) activeCount = 2;
    else if (brand.score >= 50) activeCount = 1;
  }

  const commitmentsToShow = realCommitments.length > 0
    ? realCommitments
    : COMMITMENTS.map((c, i) => ({ text: c, active: i < activeCount }));

  const realReviews = await getBrandReviews(slug);
  const hasRealReviews = realReviews.length > 0;

  const target = brand.score / 5;
  const adjustedReviews = hasRealReviews
    ? realReviews.map((r) => ({
        retailer: r.store_city || "Anonymous",
        location: [r.store_city, r.country].filter(Boolean).join(", ") || "Unknown",
        ago: new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        dimScores: r.dimScores,
        quote: r.pros || r.cons || "",
        response: null as { ago: string; body: string } | null,
      }))
    : REVIEW_TEMPLATES.map((tpl) => {
        const sourceAvg = tpl.dimScores.reduce((a, b) => a + b, 0) / tpl.dimScores.length;
        const shift = target - sourceAvg;
        return {
          ...tpl,
          dimScores: tpl.dimScores.map((s) => Math.max(1, Math.min(20, Math.round(s + shift)))),
        };
      });

  return (
    <div className="max-w-[1280px] mx-auto w-full px-margin-mobile md:px-margin-desktop py-12">
      <nav className="font-caption text-caption text-text-caption mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-primary transition-colors">
          Leaderboard
        </Link>
        <span className="material-symbols-outlined text-[14px]">
          chevron_right
        </span>
        <Link href="/brands" className="hover:text-primary transition-colors">
          {brand.categories[0]}
        </Link>
        <span className="material-symbols-outlined text-[14px]">
          chevron_right
        </span>
        <span className="text-text-main">{brand.name}</span>
      </nav>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-section-gap items-stretch">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-start gap-6">
            <BrandLogo
              name={brand.name}
              domain={brand.domain}
              size="w-32 h-32"
            />
            <div className="flex flex-col gap-3">
              <h1 className="font-display-lg text-display-lg text-primary m-0">
                {brand.name}
              </h1>
              <div className="flex flex-wrap gap-2">
                {brand.categories.map((c) => (
                  <span
                    key={c}
                    className="font-label-caps text-label-caps bg-surface-container px-3 py-1.5 rounded-full text-on-surface-variant border border-border-hairline uppercase"
                  >
                    {c}
                  </span>
                ))}
              </div>
              {brand.description && (
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-2">
                  {brand.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2">
            {claimed ? (
              <Link
                href="/dashboard"
                className="bg-primary text-on-primary font-data-tabular text-data-tabular px-6 py-3 rounded-full hover:bg-primary/90 transition-colors border border-primary inline-block"
              >
                Edit Profile
              </Link>
            ) : (
              <SignInLink
                role="brand"
                signup
                className="bg-primary text-on-primary font-data-tabular text-data-tabular px-6 py-3 rounded-full hover:bg-primary/90 transition-colors border border-primary inline-block cursor-pointer"
              >
                Claim Your Brand
              </SignInLink>
            )}
            <FollowButton />
          </div>
        </div>

        <div className="lg:col-span-4 bg-surface-card border border-border-hairline p-card-padding rounded flex flex-col justify-between min-h-[240px]">
          <div>
            <h2 className="font-label-caps text-label-caps text-text-caption mb-4 uppercase">
              Overall Partnership Score
            </h2>
            <div className="flex items-baseline gap-4">
              <span
                className={`font-display-lg text-[72px] leading-none ${tierText(brand.score / 5)} font-bold`}
              >
                {brand.score}
              </span>
              <div className="flex flex-col">
                <span
                  className={`font-data-tabular text-data-tabular ${changeClass(brand.change)} flex items-center gap-1`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {brand.change.startsWith("-")
                      ? "arrow_downward"
                      : "arrow_upward"}
                  </span>{" "}
                  {brand.change}
                </span>
                <span className="font-caption text-caption text-text-caption">
                  vs last year
                </span>
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-end justify-between border-t border-border-hairline pt-4">
            <div className="flex flex-col gap-1">
              <span className="font-data-tabular text-data-tabular text-primary">
                {reviews} Reviews
              </span>
              <span className="font-caption text-caption text-text-caption">
                Verified Retailers
              </span>
            </div>
            <svg
              className="w-24 h-10"
              preserveAspectRatio="none"
              viewBox="0 0 80 24"
            >
              <polyline
                fill="none"
                stroke={strokeColor(brand.score)}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={`0,${brand.spark[0]} 26,${brand.spark[1]} 53,${brand.spark[2]} 80,${brand.spark[3]}`}
              />
            </svg>
          </div>
        </div>
      </section>

      <section className="mb-section-gap">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 border-b border-border-hairline pb-2 gap-1">
          <h3 className="font-headline-md text-headline-md text-primary m-0">
            Dimension Breakdown
          </h3>
          <span className="font-caption text-caption text-text-caption">
            Each scored 0&ndash;20. Bars show score distribution across all
            retailer reviews.
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-gutter">
          {DIMENSIONS.map((d, i) => {
            const score = brand.dims[i];
            const dist = genDist(score, reviews);
            const max = Math.max(...dist);
            const buckets = [
              "1\u20134",
              "5\u20138",
              "9\u201312",
              "13\u201316",
              "17\u201320",
            ];
            return (
              <div
                key={d.key}
                className="bg-surface-card border border-border-hairline p-4 rounded flex flex-col justify-between"
              >
                <div className="flex justify-between items-start mb-4 gap-2">
                  <h4 className="font-data-tabular text-data-tabular text-on-surface-variant leading-tight">
                    {d.name}
                  </h4>
                  <span
                    className={`font-data-tabular text-data-tabular ${tierBg(score)} px-2 py-1 rounded shrink-0`}
                  >
                    {score}/20
                  </span>
                </div>
                <div className="flex items-end justify-between mt-4 border-t border-border-hairline pt-3">
                  <div
                    className="flex gap-1 items-end h-8"
                    aria-label={`Score distribution across ${reviews} reviews`}
                  >
                    {dist.map((count, j) => {
                      const isModal = count === max;
                      const heightPct = Math.max(
                        8,
                        Math.round((count / max) * 100)
                      );
                      return (
                        <div
                          key={j}
                          className={`w-2 ${isModal ? tierBar(score) : "bg-surface-container-high"}`}
                          style={{ height: `${heightPct}%` }}
                          title={`${buckets[j]}: ${count} reviews`}
                        />
                      );
                    })}
                  </div>
                  <span className="font-caption text-caption text-text-caption">
                    {reviews} reviews
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-section-gap">
        {claimed ? (
          <SelfReportTabs
            dimensions={DIMENSIONS.map((d) => ({
              name: d.name,
              short: d.short,
            }))}
            statements={STATEMENT_TEMPLATES}
          />
        ) : (
          <div
            id="claim"
            className="lg:col-span-8 bg-surface-card border border-border-hairline rounded p-card-padding flex flex-col items-start gap-4 scroll-mt-24"
          >
            <span className="font-label-caps text-label-caps bg-surface-container text-on-surface-variant px-3 py-1.5 rounded-full border border-border-hairline">
              BRAND UNCLAIMED
            </span>
            <h4 className="font-headline-md text-headline-md text-primary m-0">
              {brand.name} hasn&rsquo;t claimed this brand yet.
            </h4>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
              Scores on this page come from verified retailer reviews.{" "}
              {brand.name}&rsquo;s public statements on Brand.com Standards,
              Pricing, Shop Local Support, Shop Floor Support, and Pro Deal
              Standards will appear here once a representative claims the brand.
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <SignInLink
                role="brand"
                signup
                className="bg-primary text-on-primary font-data-tabular text-data-tabular px-6 py-3 rounded-full hover:bg-primary/90 transition-colors inline-block cursor-pointer"
              >
                Claim this Brand
              </SignInLink>
              <Link
                href={`/review?brand=${encodeURIComponent(brand.name)}&type=edit`}
                className="bg-transparent text-primary font-data-tabular text-data-tabular px-6 py-3 rounded border border-border-hairline hover:bg-surface-container transition-colors inline-block"
              >
                Suggest an edit
              </Link>
            </div>
          </div>
        )}

        <div className="lg:col-span-4 bg-surface-card border border-border-hairline p-card-padding rounded">
          <div className="flex items-end justify-between mb-6">
            <h3 className="font-headline-md text-headline-md text-primary m-0">
              Public Commitments
            </h3>
            <span className="font-caption text-caption text-text-caption">
              {commitmentsToShow.filter((c) => c.active).length} active
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {commitmentsToShow.map((c) => (
                <div
                  key={c.text}
                  className={`flex items-start gap-3 p-3 ${c.active ? "bg-surface-container-low" : "bg-background-paper opacity-60"} border border-border-hairline rounded`}
                >
                  <span
                    className={`material-symbols-outlined ${c.active ? "text-score-high" : "text-text-caption"} mt-0.5`}
                    {...(c.active ? { "data-weight": "fill" } : {})}
                  >
                    {c.active ? "check_circle" : "radio_button_unchecked"}
                  </span>
                  <div className="flex flex-col">
                    <span
                      className={`font-data-tabular text-data-tabular ${c.active ? "text-primary" : "text-text-caption"}`}
                    >
                      {c.text}
                    </span>
                    {c.active && (
                      <span className="font-caption text-caption text-on-surface-variant mt-1">
                        Added by {brand.name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
          {claimed && (
            <button
              type="button"
              className="flex items-center gap-2 mt-3 px-3 py-2 border border-dashed border-border-hairline rounded text-primary font-caption text-caption hover:bg-surface-container-low transition-colors w-full justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Add a commitment
            </button>
          )}
        </div>
      </section>

      <section className="mb-16">
        <div className="flex justify-between items-end mb-6 border-b border-border-hairline pb-4">
          <h3 className="font-headline-md text-headline-md text-primary m-0">
            Verified Reviews
          </h3>
          <span className="font-data-tabular text-data-tabular text-text-caption">
            Sort by:{" "}
            <strong className="text-primary cursor-pointer border-b border-primary">
              Most Helpful
            </strong>
          </span>
        </div>
        <div className="flex flex-col gap-6">
          {adjustedReviews.map((r, idx) => {
            const overall = r.dimScores.reduce((a, b) => a + b, 0);
            const overallColor =
              overall >= 80
                ? "text-score-high"
                : overall >= 65
                  ? "text-on-surface"
                  : "text-score-low";
            return (
              <div
                key={idx}
                className="bg-surface-card border border-border-hairline p-card-padding rounded ml-0 md:ml-12 relative"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${tierBar(overall / 5)} rounded-l`}
                />
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-label-caps text-label-caps text-primary">
                        {r.retailer}, {r.location}
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-score-high">
                        verified
                      </span>
                    </div>
                    <span className="font-caption text-caption text-text-caption">
                      {r.ago}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={`font-data-tabular text-[18px] font-bold ${overallColor}`}
                    >
                      {overall}
                      <span className="text-text-caption text-[12px] font-normal">
                        /100
                      </span>
                    </span>
                    <span className="font-caption text-caption text-text-caption">
                      overall
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap mb-4">
                  {DIMENSIONS.map((d, i) => (
                    <span
                      key={d.key}
                      className={`text-[10px] ${tierBg(r.dimScores[i])} px-2 py-1 rounded font-data-tabular`}
                    >
                      {d.short} {r.dimScores[i]}/20
                    </span>
                  ))}
                </div>
                <p className="font-body-lg text-body-lg text-on-surface italic">
                  &ldquo;{r.quote}&rdquo;
                </p>
                {r.response && (
                  <div className="bg-surface-container-low border border-border-hairline p-4 rounded ml-4 md:ml-8 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-label-caps text-label-caps text-primary">
                        {brand.name} Representative
                      </span>
                      <span className="font-caption text-caption text-text-caption">
                        {r.response.ago}
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      {r.response.body}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Load more reviews — hidden until real pagination is needed */}
      </section>

      <section className="mb-section-gap">
        <div className="bg-surface-container-low rounded-lg p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <span
              className="material-symbols-outlined text-accent"
              style={{ fontSize: 32 }}
            >
              rocket_launch
            </span>
            <div>
              <span className="font-label-caps text-label-caps text-accent uppercase">
                Sponsored
              </span>
              <h3 className="font-headline-md text-headline-md text-primary mt-1">
                Solutions to improve your scores
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Tools and expertise that help brands strengthen their wholesale
                partnerships.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <a
              href="https://endvr.io"
              target="_blank"
              rel="noopener"
              className="group bg-surface-card rounded-lg p-5 border border-border-hairline hover:shadow-card-hover hover:border-primary/20 transition-all flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/endvr-logo.webp"
                  alt="ENDVR"
                  className="h-7 rounded"
                />
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="font-label-caps text-label-caps text-accent bg-accent/10 px-2 py-1 rounded-full text-[10px]">
                  Shop Floor Support
                </span>
                <span className="font-label-caps text-label-caps text-accent bg-accent/10 px-2 py-1 rounded-full text-[10px]">
                  Brand.com Standards
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4 grow">
                Mobile incentives, education, and sell-through tools. Consumer
                cashback routes demand to retail doors instead of brand.com.
              </p>
              <span className="inline-flex items-center gap-1 font-body-md font-semibold text-primary group-hover:text-accent transition-colors">
                See how top brands use ENDVR
                <span className="material-symbols-outlined text-lg">
                  arrow_forward
                </span>
              </span>
            </a>
            <a
              href="https://www.outsizeconsulting.com"
              target="_blank"
              rel="noopener"
              className="group bg-surface-card rounded-lg p-5 border border-border-hairline hover:shadow-card-hover hover:border-primary/20 transition-all flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://static1.squarespace.com/static/66968cb18f45862ed4e165f3/t/6696bb4354fe535b592dffca/1721154374463/OC+Logo+Banner.png?format=300w"
                  alt="Outsize Consulting"
                  className="h-7 rounded object-contain"
                />
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="font-label-caps text-label-caps text-accent bg-accent/10 px-2 py-1 rounded-full text-[10px]">
                  Brand.com Standards
                </span>
                <span className="font-label-caps text-label-caps text-accent bg-accent/10 px-2 py-1 rounded-full text-[10px]">
                  Pricing Standards
                </span>
                <span className="font-label-caps text-label-caps text-accent bg-accent/10 px-2 py-1 rounded-full text-[10px]">
                  Pro Deal Standards
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4 grow">
                Strategic advisory for outdoor and active brands navigating
                wholesale pricing and pro deal discipline.
              </p>
              <span className="inline-flex items-center gap-1 font-body-md font-semibold text-primary group-hover:text-accent transition-colors">
                Get expert wholesale strategy
                <span className="material-symbols-outlined text-lg">
                  arrow_forward
                </span>
              </span>
            </a>
          </div>
        </div>
      </section>

      {claimed ? (
        <section id="claim" className="mb-16 scroll-mt-24">
          <div className="bg-surface-card border border-border-hairline p-card-padding rounded">
            <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
              <div>
                <span className="font-label-caps text-label-caps bg-score-high text-white px-3 py-1.5 rounded-full">
                  CLAIMED
                </span>
                <h3 className="font-headline-md text-headline-md text-primary mt-3">
                  Edit {brand.name}&rsquo;s profile
                </h3>
                <p className="font-caption text-caption text-text-caption mt-1">
                  Verified brand representatives can update statements, respond
                  to reviews, and manage public commitments.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="bg-primary text-on-primary font-data-tabular text-data-tabular px-6 py-3 rounded-full hover:bg-primary/90 transition-colors inline-block"
              >
                Open Brand Dashboard
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section id="claim" className="mb-16 scroll-mt-24">
          <div className="bg-surface-card border border-border-hairline p-card-padding rounded">
            <span className="font-label-caps text-label-caps bg-primary text-on-primary px-3 py-1.5 rounded-full">
              UNCLAIMED
            </span>
            <h3 className="font-headline-md text-headline-md text-primary mt-3">
              Is this your brand?
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-2xl mb-6">
              Claim {brand.name}&rsquo;s profile to respond to retailer feedback, manage public commitments, and track your partnership score.
            </p>
            <SignInLink role="brand" signup className="bg-primary text-on-primary font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity cursor-pointer">
              Claim this Brand
            </SignInLink>
          </div>
        </section>
      )}
    </div>
  );
}
