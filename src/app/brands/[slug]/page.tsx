import Link from "next/link";
import { notFound } from "next/navigation";
import { DIMENSIONS, DIMENSION_ICONS } from "@/lib/constants";
import { SEED_BRANDS } from "@/lib/seed-data";
import { tierBarClass, tierTextClass, changeClass, topDim, bottomDim } from "@/lib/scoring";
import { ScoreBadge } from "@/components/ScoreBadge";
import { BrandLogo } from "@/components/BrandLogo";
import type { BrandWithScores } from "@/lib/types";

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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return { title: "Brand not found" };
  return {
    title: `${brand.name} — Brand Partnership Index`,
    description: brand.description ?? `See how ${brand.name} scores across five retail partnership dimensions.`,
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

  const top = topDim(brand.dims);
  const bottom = bottomDim(brand.dims);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-text-caption flex items-center gap-1.5">
        <Link href="/brands" className="hover:text-text-main transition-colors">
          Brands
        </Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-text-main font-medium">{brand.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-12">
        <BrandLogo name={brand.name} domain={brand.domain} size="w-20 h-20" />
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-main">
              {brand.name}
            </h1>
            {brand.claimed_by && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-score-high/10 text-score-high text-xs font-semibold">
                <span className="material-symbols-outlined text-sm">verified</span>
                Claimed
              </span>
            )}
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {brand.categories.map((c) => (
              <span
                key={c}
                className="text-xs px-2.5 py-1 rounded-full bg-surface-container text-text-caption font-medium"
              >
                {c}
              </span>
            ))}
          </div>
          {brand.description && (
            <p className="mt-4 text-text-caption leading-relaxed max-w-2xl">
              {brand.description}
            </p>
          )}
        </div>
        <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
          <ScoreBadge score={brand.score} max={100} size="lg" />
          <p className="text-xs text-text-caption">
            out of 100 &middot; {brand.review_count} review{brand.review_count !== 1 ? "s" : ""}
          </p>
          <span className={`text-sm font-semibold tabular-nums ${changeClass(brand.change)}`}>
            {brand.change !== "0" ? brand.change : "—"} from last period
          </span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        <StatCard label="Overall Score" value={`${brand.score}/100`} />
        <StatCard label="Reviews" value={String(brand.review_count)} />
        <StatCard
          label="Strongest"
          value={top.name}
          sub={`${top.score}/20`}
        />
        <StatCard
          label="Weakest"
          value={bottom.name}
          sub={`${bottom.score}/20`}
        />
      </div>

      {/* Dimension breakdown */}
      <section className="mb-12">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-text-main mb-6">
          Dimension Breakdown
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DIMENSIONS.map((dim, i) => {
            const score = brand.dims[i];
            const pct = (score / 20) * 100;
            return (
              <div
                key={dim.key}
                className="p-5 rounded-xl bg-surface-card border border-border-hairline"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl text-on-surface-variant">
                      {DIMENSION_ICONS[dim.key]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-text-main">
                      {dim.name}
                    </p>
                    <p className="text-xs text-text-caption">{dim.blurb}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2.5 rounded-full bg-surface-container overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${tierBarClass(score)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span
                    className={`text-lg font-bold tabular-nums ${tierTextClass(score)}`}
                  >
                    {score}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Reviews placeholder */}
      <section className="mb-12">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-text-main mb-6">
          Recent Reviews
        </h2>
        <div className="rounded-xl border border-border-hairline bg-surface-card p-10 text-center">
          <span className="material-symbols-outlined text-4xl text-text-caption/40 mb-3">
            chat_bubble_outline
          </span>
          <p className="text-text-caption">
            No published reviews yet. Be the first to share your experience.
          </p>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center">
        <Link
          href={`/review?brand=${brand.slug}`}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-on-accent font-semibold text-base hover:bg-accent/90 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">rate_review</span>
          Review {brand.name}
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-surface-card border border-border-hairline">
      <p className="text-xs text-text-caption font-medium uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-lg font-bold text-text-main truncate">{value}</p>
      {sub && <p className="text-xs text-text-caption mt-0.5">{sub}</p>}
    </div>
  );
}
