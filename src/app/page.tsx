import Link from "next/link";
import { SEED_BRANDS } from "@/lib/seed-data";
import { DIMENSIONS } from "@/lib/constants";
import { tierClass20, tierClass100, changeClass } from "@/lib/scoring";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { BrandLogo } from "@/components/BrandLogo";
import type { BrandWithScores } from "@/lib/types";

async function getBrands(): Promise<BrandWithScores[]> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("brand_scores_v")
      .select("*")
      .order("score", { ascending: false });

    if (data && data.length > 0) return data as BrandWithScores[];
  } catch {
    // Supabase not configured — fall through to seed data
  }
  return [...SEED_BRANDS].sort((a, b) => b.score - a.score);
}

const MOVER_NAMES = ["Hoka", "KEEN", "Brooks", "Patagonia"];
const MOVER_BLURBS: Record<string, string> = {
  Hoka: "Removed brand.com sale tab and increased margins on core models.",
  KEEN: "Improved B2B inventory availability and enforced stricter MAP policies.",
  Brooks: "Tightened MAP enforcement and expanded shop floor rep coverage.",
  Patagonia: "Tightened pro-deal qualifications and improved local demand routing.",
};

const RECENT_REVIEWS = [
  {
    brand: "YETI",
    retailer: "Mountain Sports Shop",
    location: "Boulder, CO",
    ago: "2 hours ago",
    dimScores: [18, 19, 16, 18, 15],
    quote:
      "Incredible MAP enforcement. We never have to worry about competing with massive online discounts. They respect the specialty retailer.",
  },
  {
    brand: "Brooks",
    retailer: "Runners Roost",
    location: "Austin, TX",
    ago: "5 hours ago",
    dimScores: [17, 18, 19, 20, 16],
    quote:
      "Best in class for shop floor support. Their tech reps are always available and our staff loves selling their product because of the education.",
  },
  {
    brand: "Salomon",
    retailer: "Alpine Ascents",
    location: "Seattle, WA",
    ago: "1 day ago",
    dimScores: [14, 15, 12, 16, 9],
    quote:
      "Great product but their pro-deal program is completely undisciplined. Half my local customers have a discount code from somewhere.",
  },
  {
    brand: "Hoka",
    retailer: "Footzone",
    location: "Bend, OR",
    ago: "2 days ago",
    dimScores: [19, 18, 16, 15, 14],
    quote:
      "Massive improvement this year. They cleaned up their DTC sales tab and are finally routing online demand back to local shops effectively.",
  },
];

function getBrandByName(
  brands: BrandWithScores[],
  name: string,
): BrandWithScores | undefined {
  return brands.find(
    (b) => b.name.toLowerCase() === name.toLowerCase(),
  );
}

export default async function HomePage() {
  const brands = await getBrands();

  const movers = MOVER_NAMES.map((n) => getBrandByName(brands, n)).filter(
    Boolean,
  ) as BrandWithScores[];

  const visibleReviews = RECENT_REVIEWS.slice(0, 2);
  const gatedReviews = RECENT_REVIEWS.slice(2);

  return (
    <>
      {/* Hero Section */}
      <section className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop pt-section-gap md:pt-[120px] pb-4 md:pb-6">
        <div className="mb-10">
          <h1 className="font-display-lg text-display-lg text-primary mb-6 max-w-4xl">
            How the wholesale channel{" "}
            <br className="hidden md:inline" />
            reviews its brand partners.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Specialty retailers rate brands across five partnership standards.
            Brands track their scores and improve.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter border-t border-b border-border-hairline py-8">
          <div className="flex flex-col border-r border-border-hairline pr-gutter">
            <span className="font-label-caps text-label-caps text-text-caption uppercase">
              Avg Score
            </span>
            <span className="font-headline-lg text-headline-lg mt-2">64</span>
            <span className="font-caption text-caption text-text-caption mt-1">
              across all categories
            </span>
          </div>
          <div className="flex flex-col md:border-r border-border-hairline md:pr-gutter pl-0 md:pl-gutter">
            <span className="font-label-caps text-label-caps text-text-caption uppercase">
              Change
            </span>
            <span className="font-headline-lg text-headline-lg mt-2 text-score-high">
              +5.2
            </span>
            <span className="font-caption text-caption text-text-caption mt-1">
              since Q4
            </span>
          </div>
          <div className="flex flex-col border-r border-border-hairline pr-gutter pl-0 md:pl-gutter mt-8 md:mt-0">
            <span className="font-label-caps text-label-caps text-text-caption uppercase">
              Brands
            </span>
            <span className="font-headline-lg text-headline-lg mt-2">48</span>
            <span className="font-caption text-caption text-text-caption mt-1">
              actively tracked
            </span>
          </div>
          <div className="flex flex-col pl-0 md:pl-gutter mt-8 md:mt-0">
            <span className="font-label-caps text-label-caps text-text-caption uppercase">
              Reviews
            </span>
            <span className="font-headline-lg text-headline-lg mt-2">312</span>
            <span className="font-caption text-caption text-text-caption mt-1">
              verified retailers
            </span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 border-t border-border-hairline">
        <h2 className="font-headline-lg text-headline-lg text-primary text-center mb-8">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-accent text-on-accent flex items-center justify-center text-base font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-2">
              Retailers Review
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Verified specialty retailers anonymously rate brands across five
              partnership standards.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-accent text-on-accent flex items-center justify-center text-base font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-2">
              Scores Update
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Ratings flow into a live leaderboard and individual brand profiles
              that anyone can browse.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-accent text-on-accent flex items-center justify-center text-base font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-2">
              Brands Improve
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Brands see where they stand, respond to feedback, and invest in
              the wholesale channel.
            </p>
          </div>
        </div>
        <div className="text-center mt-8">
          <Link
            href="/review"
            className="inline-block bg-primary text-on-primary font-semibold px-8 py-3 rounded hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            Review a Brand
          </Link>
          <p className="font-body-md text-body-md text-on-surface-variant mt-3">
            Are you a brand?{" "}
            <Link
              href="/signin?type=brand"
              className="text-primary font-semibold underline hover:text-accent transition-colors"
            >
              Claim Your Brand
            </Link>
          </p>
        </div>
      </section>

      {/* Leaderboard (search bar + table + gating) */}
      <LeaderboardTable brands={brands} />

      {/* Content Area */}
      <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
        {/* Movers Band */}
        <div className="mb-16">
          <h2 className="font-headline-md text-headline-md mb-6 border-b border-border-hairline pb-2">
            Biggest Movers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
            {movers.map((b) => (
              <Link
                key={b.id}
                href={`/brands/${b.slug}`}
                className="border border-border-hairline p-5 rounded bg-surface-card flex flex-col gap-3 hover:border-primary transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <BrandLogo
                      name={b.name}
                      domain={b.domain}
                      size="w-10 h-10"
                    />
                    <span className="font-body-md text-body-md font-bold text-text-main truncate group-hover:underline">
                      {b.name}
                    </span>
                  </div>
                  <span
                    className={`${b.change.startsWith("+") ? "bg-accent text-on-accent" : "bg-score-low text-white"} px-2 py-1 rounded text-xs font-bold shrink-0`}
                  >
                    {b.change}
                  </span>
                </div>
                <p className="font-caption text-caption text-on-surface-variant mt-2 border-t border-border-hairline pt-3">
                  {MOVER_BLURBS[b.name]}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="mb-16">
          <h2 className="font-headline-md text-headline-md mb-6 border-b border-border-hairline pb-2">
            Recent Reviews
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {visibleReviews.map((r, i) => {
              const b = getBrandByName(brands, r.brand);
              if (!b) return null;
              return (
                <Link
                  key={i}
                  href={`/brands/${b.slug}`}
                  className="border border-border-hairline p-5 rounded bg-surface-card flex flex-col gap-4 hover:border-primary transition-colors group"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <BrandLogo
                        name={b.name}
                        domain={b.domain}
                        size="w-10 h-10"
                      />
                      <span className="font-body-md text-body-md font-bold text-text-main truncate group-hover:underline">
                        {b.name}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 justify-end">
                        <span className="font-caption text-caption font-bold text-text-main">
                          {r.retailer}
                        </span>
                        <span className="material-symbols-outlined text-[14px] text-score-high">
                          verified
                        </span>
                      </div>
                      <span className="font-caption text-caption text-text-caption">
                        {r.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {r.dimScores.map((d, di) => (
                      <span
                        key={di}
                        className={`text-[10px] ${tierClass20(d)} px-2 py-1 rounded font-data-tabular`}
                      >
                        {DIMENSIONS[di].short} {d}/20
                      </span>
                    ))}
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant italic">
                    &ldquo;{r.quote}&rdquo;
                  </p>
                  <span className="font-caption text-caption text-text-caption">
                    {r.ago}
                  </span>
                </Link>
              );
            })}
          </div>

          {gatedReviews.length > 0 && (
            <div className="relative mt-gutter">
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-gutter pointer-events-none select-none"
                style={{ filter: "blur(6px)", opacity: 0.5 }}
              >
                {gatedReviews.map((r, i) => {
                  const b = getBrandByName(brands, r.brand);
                  if (!b) return null;
                  return (
                    <div
                      key={i}
                      className="border border-border-hairline p-5 rounded bg-surface-card flex flex-col gap-4"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <BrandLogo
                            name={b.name}
                            domain={b.domain}
                            size="w-10 h-10"
                          />
                          <span className="font-body-md text-body-md font-bold text-text-main truncate">
                            {b.name}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1 justify-end">
                            <span className="font-caption text-caption font-bold text-text-main">
                              {r.retailer}
                            </span>
                            <span className="material-symbols-outlined text-[14px] text-score-high">
                              verified
                            </span>
                          </div>
                          <span className="font-caption text-caption text-text-caption">
                            {r.location}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {r.dimScores.map((d, di) => (
                          <span
                            key={di}
                            className={`text-[10px] ${tierClass20(d)} px-2 py-1 rounded font-data-tabular`}
                          >
                            {DIMENSIONS[di].short} {d}/20
                          </span>
                        ))}
                      </div>
                      <p className="font-body-md text-body-md text-on-surface-variant italic">
                        &ldquo;{r.quote}&rdquo;
                      </p>
                      <span className="font-caption text-caption text-text-caption">
                        {r.ago}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-background via-background/90 to-transparent z-10 px-6 py-10">
                <span className="material-symbols-outlined text-4xl text-primary mb-3">
                  lock
                </span>
                <h3 className="font-headline-md text-headline-md text-primary mb-2 text-center">
                  See all reviews
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-5 text-center max-w-md">
                  Create a free account to read every retailer review, see
                  detailed scores, and track brands over time.
                </p>
                <Link
                  href="/signin"
                  className="bg-primary text-on-primary font-semibold px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create Free Account
                </Link>
                <p className="font-caption text-caption text-text-caption mt-3">
                  Already have an account?{" "}
                  <Link
                    href="/signin"
                    className="text-primary hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* CTAs Band */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-12">
          <div className="bg-surface-card border border-border-hairline rounded-lg p-6 md:p-8 flex flex-col justify-between">
            <div>
              <span className="font-label-caps text-label-caps text-accent uppercase mb-3 block">
                For Retailers
              </span>
              <h3 className="font-headline-sm text-headline-sm text-primary mb-2">
                Give your partners honest feedback
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                Rate 5 dimensions in under 2 minutes. Anonymous, verified, and
                it drives real change.
              </p>
            </div>
            <Link
              href="/review"
              className="bg-primary text-on-primary font-semibold px-6 py-3 rounded hover:opacity-90 transition-opacity text-center active:scale-[0.98]"
            >
              Review a Brand
            </Link>
          </div>
          <div className="bg-surface-card border border-border-hairline rounded-lg p-6 md:p-8 flex flex-col justify-between">
            <div>
              <span className="font-label-caps text-label-caps text-accent uppercase mb-3 block">
                For Brands
              </span>
              <h3 className="font-headline-sm text-headline-sm text-primary mb-2">
                See how retailers rate your support
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                Claim your brand to access detailed scores, benchmark against
                competitors, and respond to feedback.
              </p>
            </div>
            <Link
              href="/signin"
              className="bg-primary text-on-primary font-semibold px-6 py-3 rounded hover:opacity-90 transition-opacity text-center active:scale-[0.98]"
            >
              Claim Your Brand
            </Link>
          </div>
        </div>

        {/* Sponsored Partners */}
        <div className="mb-8 bg-surface-container-low -mx-margin-mobile md:-mx-margin-desktop px-margin-mobile md:px-margin-desktop py-16 rounded-none">
          <div className="max-w-[1280px] mx-auto">
            <div className="mb-10">
              <span className="font-label-caps text-label-caps text-accent uppercase">
                Sponsored Partners
              </span>
              <h2 className="font-headline-lg text-headline-lg text-primary mt-2">
                Solutions to help improve your index score
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                Proven tools and expertise that help brands strengthen their
                wholesale partnerships and climb the leaderboard.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ENDVR */}
              <a
                href="https://endvr.io"
                target="_blank"
                rel="noopener"
                className="group bg-surface-card border border-border-hairline rounded-lg p-6 flex flex-col hover:shadow-card-hover hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/endvr-logo.webp"
                    alt="ENDVR"
                    className="h-8 rounded"
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
                <p className="font-body-md text-body-md text-on-surface-variant mb-5 flex-grow">
                  The platform brands use to launch mobile-first SPIFs, product
                  training, and cashback campaigns that drive sell-through at
                  retail. Used by 160+ brands to activate the shop floor.
                </p>
                <span className="inline-flex items-center gap-2 font-body-md font-semibold text-primary group-hover:text-accent transition-colors">
                  Support the store floor
                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
                </span>
              </a>

              {/* Outsize Consulting */}
              <a
                href="https://www.outsizeconsulting.com"
                target="_blank"
                rel="noopener"
                className="group bg-surface-card border border-border-hairline rounded-lg p-6 flex flex-col hover:shadow-card-hover hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://static1.squarespace.com/static/66968cb18f45862ed4e165f3/t/6696bb4354fe535b592dffca/1721154374463/OC+Logo+Banner.png?format=300w"
                    alt="Outsize Consulting"
                    className="h-8 rounded object-contain"
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
                <p className="font-body-md text-body-md text-on-surface-variant mb-5 flex-grow">
                  Strategic advisory for outdoor and active brands navigating
                  wholesale pricing architecture, MAP enforcement, and pro deal
                  discipline.
                </p>
                <span className="inline-flex items-center gap-2 font-body-md font-semibold text-primary group-hover:text-accent transition-colors">
                  Get expert wholesale strategy
                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
