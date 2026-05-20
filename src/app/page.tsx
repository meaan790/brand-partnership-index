import Link from "next/link";
import { SEED_BRANDS } from "@/lib/seed-data";
import { DIMENSIONS } from "@/lib/constants";
import { tierClass20, tierClass100, changeClass } from "@/lib/scoring";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { BrandLogo } from "@/components/BrandLogo";
import { SignInLink } from "@/components/SignInLink";
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
    country: "US",
    ago: "2 hours ago",
    dimScores: [18, 19, 16, 18, 15],
    quote:
      "Incredible MAP enforcement. We never have to worry about competing with massive online discounts. They respect the specialty retailer.",
  },
  {
    brand: "Brooks",
    retailer: "Runners Roost",
    location: "Austin, TX",
    country: "US",
    ago: "5 hours ago",
    dimScores: [17, 18, 19, 20, 16],
    quote:
      "Best in class for shop floor support. Their tech reps are always available and our staff loves selling their product because of the education.",
  },
  {
    brand: "Salomon",
    retailer: "Alpine Ascents",
    location: "Seattle, WA",
    country: "US",
    ago: "1 day ago",
    dimScores: [14, 15, 12, 16, 9],
    quote:
      "Great product but their pro-deal program is completely undisciplined. Half my local customers have a discount code from somewhere.",
  },
  {
    brand: "Hoka",
    retailer: "Footzone",
    location: "Bend, OR",
    country: "US",
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
      {/* Hero Section — dark navy, centered */}
      <section className="bg-primary pt-20 md:pt-28 pb-16 md:pb-20">
        <div className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <h1 className="font-display-lg text-display-lg text-white mb-6">
            The independent benchmark for brand-retailer partnerships
          </h1>
          <p className="font-body-lg text-body-lg text-white/70 max-w-xl mx-auto mb-10">
            Specialty retailers rate brands across five partnership standards.
            Brands track their scores and improve.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/review"
              className="bg-accent text-on-accent font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-opacity active:scale-[0.98]"
            >
              Review a Brand
            </Link>
            <Link
              href="#leaderboard"
              className="border border-white/30 text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-colors active:scale-[0.98]"
            >
              Explore the Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b border-border-hairline">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter py-8">
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
        </div>
      </section>

      {/* Leaderboard (search bar + table + gating) */}
      <LeaderboardTable brands={brands} />

      {/* Movers Band — grey background */}
      <section className="bg-surface-container-low py-14">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
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
      </section>

      {/* Recent Reviews — white background */}
      <section className="py-14">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
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
                  <div className="flex items-center gap-2">
                    <span className="font-caption text-caption text-text-caption">
                      {r.ago}
                    </span>
                    {r.country && (
                      <span className="font-label-caps text-[10px] bg-surface-container-low text-text-caption px-2 py-0.5 rounded-full">
                        {r.country}
                      </span>
                    )}
                  </div>
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
                <SignInLink
                  signup
                  className="bg-primary text-on-primary font-semibold px-8 py-3 rounded-full hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  Create Free Account
                </SignInLink>
                <p className="font-caption text-caption text-text-caption mt-3">
                  Already have an account?{" "}
                  <SignInLink
                    className="text-primary hover:underline cursor-pointer"
                  >
                    Sign in
                  </SignInLink>
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How it works — grey background band */}
      <section className="bg-surface-container-low py-16">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-10">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-2">
              How it works
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Start rating immediately. No account required until you submit.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "search", step: "Step 1", title: "Find a brand", desc: "Search for any brand in the outdoor and active industry. If it\u2019s not in the index yet, you can add it." },
              { icon: "rate_review", step: "Step 2", title: "Rate five dimensions", desc: "Score the brand across five wholesale partnership standards using guided star ratings. Add what\u2019s going well and what should improve." },
              { icon: "trending_up", step: "Step 3", title: "Scores update live", desc: "Your review feeds into the public leaderboard and brand profile. Brands see where they stand and how to improve." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-accent/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-accent text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                </div>
                <span className="font-label-caps text-label-caps text-accent uppercase">{item.step}</span>
                <h3 className="font-headline-sm text-headline-sm text-primary mt-2 mb-2">
                  {item.title}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-xs mx-auto">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTAs Band */}
      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
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
              className="bg-primary text-on-primary font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity text-center active:scale-[0.98]"
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
              <SignInLink
                role="brand"
                signup
              className="bg-primary text-on-primary font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity text-center active:scale-[0.98] cursor-pointer"
            >
              Claim Your Brand
              </SignInLink>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsored Partners — grey background */}
      <section className="bg-surface-container-low py-16">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
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
      </section>
    </>
  );
}
