import Link from "next/link";
import { SEED_BRANDS } from "@/lib/seed-data";
import { LeaderboardTable } from "@/components/LeaderboardTable";
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

const HOW_STEPS = [
  {
    icon: "mail",
    title: "Sign up with your work email",
    desc: "Only verified retail professionals can submit reviews — no anonymous drive-bys.",
  },
  {
    icon: "rate_review",
    title: "Rate the brands you work with",
    desc: "Score each brand across five partnership dimensions using guided star ratings.",
  },
  {
    icon: "leaderboard",
    title: "See how brands compare",
    desc: "Explore the live leaderboard and detailed brand profiles built from peer reviews.",
  },
];

export default async function HomePage() {
  const brands = await getBrands();

  return (
    <>
      {/* Hero */}
      <section className="bg-primary text-on-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight max-w-3xl mx-auto">
            The independent benchmark for brand‑retailer partnerships
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Retailers rate the outdoor, running, and action-sports brands they
            carry across five partnership dimensions — from pricing discipline to
            shop-floor investment.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/review"
              className="px-8 py-3.5 rounded-full bg-accent text-on-accent font-semibold text-base hover:bg-accent/90 transition-colors"
            >
              Review a Brand
            </Link>
            <a
              href="#leaderboard"
              className="px-8 py-3.5 rounded-full border border-white/30 text-white font-semibold text-base hover:bg-white/10 transition-colors"
            >
              Explore the Leaderboard
            </a>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section id="leaderboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-main">
            Leaderboard
          </h2>
          <p className="mt-2 text-text-caption">
            Ranked by overall Brand Partnership Index score out of 100.
          </p>
        </div>
        <LeaderboardTable brands={brands} />
      </section>

      {/* How it works */}
      <section className="bg-surface-container-low">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-main text-center">
            How it works
          </h2>
          <p className="mt-3 text-text-caption text-center max-w-xl mx-auto">
            Three steps from sign-up to insight.
          </p>
          <div className="mt-14 grid sm:grid-cols-3 gap-10">
            {HOW_STEPS.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-accent-muted flex items-center justify-center mb-5">
                  <span className="material-symbols-outlined text-3xl text-accent">
                    {s.icon}
                  </span>
                </div>
                <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-2">
                  Step {i + 1}
                </p>
                <h3 className="font-serif text-lg font-semibold text-text-main">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-text-caption leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
