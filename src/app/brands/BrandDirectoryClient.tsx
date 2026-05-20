"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { useSignInModal } from "@/components/SignInModalProvider";
import { DIMENSIONS } from "@/lib/constants";
import { tierClass100, tierTextClass, changeClass, topDim } from "@/lib/scoring";
import type { BrandWithScores } from "@/lib/types";

const BRAND_GATE_LIMIT = 8;

type SortMode = "score" | "movers" | "reviews" | "alpha";

function allCategories(brands: BrandWithScores[]): string[] {
  const set = new Set<string>();
  brands.forEach((b) => b.categories.forEach((c) => set.add(c)));
  return Array.from(set).sort();
}

function changeNumeric(c: string): number {
  return parseInt(c, 10) || 0;
}

function BrandCard({ brand }: { brand: BrandWithScores }) {
  const top = topDim(brand.dims);
  return (
    <Link
      href={`/brands/${brand.slug}`}
      className="border border-border-hairline rounded bg-surface-card p-5 flex flex-col gap-4 hover:border-primary transition-colors group"
    >
      <div className="flex items-start justify-between gap-3">
        <BrandLogo name={brand.name} domain={brand.domain} size="w-14 h-14" />
        <span
          className={`${tierClass100(brand.score)} px-3 py-1 rounded font-data-tabular text-data-tabular shrink-0`}
        >
          {brand.score}
        </span>
      </div>
      <div>
        <h3 className="font-headline-md text-headline-md text-primary group-hover:underline m-0">
          {brand.name}
        </h3>
        <p className="font-caption text-caption text-text-caption mt-1">
          {brand.categories.join(" · ")}
        </p>
      </div>
      <div className="flex items-center justify-between border-t border-border-hairline pt-3 mt-auto">
        <div className="flex flex-col">
          <span className="font-label-caps text-label-caps text-text-caption uppercase">
            Top standard
          </span>
          <span className="font-caption text-caption text-text-main truncate">
            {top.name}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span
            className={`font-data-tabular text-data-tabular ${tierTextClass(top.score)}`}
          >
            {top.score}/20
          </span>
          <span className={`font-caption text-caption ${changeClass(brand.change)}`}>
            {brand.change}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between text-text-caption font-caption text-caption">
        <span>
          {brand.review_count} review{brand.review_count === 1 ? "" : "s"}
        </span>
        <span>{brand.claimed_by ? "Claimed" : "Unclaimed"}</span>
      </div>
    </Link>
  );
}

export function BrandDirectoryClient({
  brands,
}: {
  brands: BrandWithScores[];
}) {
  const { open: openSignIn } = useSignInModal();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortMode, setSortMode] = useState<SortMode>("score");

  const categories = useMemo(() => ["All", ...allCategories(brands)], [brands]);

  const filtered = useMemo(() => {
    let list = brands.slice();

    if (activeCategory !== "All") {
      list = list.filter((b) => b.categories.includes(activeCategory));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((b) => b.name.toLowerCase().includes(q));
    }

    if (sortMode === "score")
      list.sort((a, b) => b.score - a.score);
    else if (sortMode === "movers")
      list.sort(
        (a, b) =>
          Math.abs(changeNumeric(b.change)) -
          Math.abs(changeNumeric(a.change))
      );
    else if (sortMode === "reviews")
      list.sort((a, b) => b.review_count - a.review_count);
    else if (sortMode === "alpha")
      list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [brands, activeCategory, searchQuery, sortMode]);

  const visible = filtered.slice(0, BRAND_GATE_LIMIT);
  const remaining = filtered.slice(BRAND_GATE_LIMIT);

  const resultSummary =
    `${filtered.length} of ${brands.length} brands` +
    (activeCategory !== "All" ? ` in ${activeCategory}` : "") +
    (searchQuery ? ` matching "${searchQuery}"` : "");

  return (
    <main className="flex-grow">
      {/* Hero — dark navy centered */}
      <section className="bg-primary pt-16 md:pt-20 pb-12 md:pb-14">
        <div className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <h1 className="font-display-lg text-display-lg text-white mb-4">
            All brands in the index
          </h1>
          <p className="font-body-lg text-body-lg text-white/70 max-w-xl mx-auto">
            Filter by category, search by name, or sort by score, momentum, or
            recency. Click any brand to open their full profile.
          </p>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <div className="bg-background-paper sticky top-[73px] z-40 border-b border-border-hairline py-4">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-text-caption">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.trim())}
              className="w-full pl-10 pr-4 py-2 border border-border-hairline rounded bg-surface-card font-body-md text-body-md text-text-main focus:outline-none focus:border-primary transition-colors"
              placeholder="Find a brand"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            {categories.map((c) => {
              const active = c === activeCategory;
              return (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`px-4 py-1.5 rounded-full font-caption text-caption whitespace-nowrap cursor-pointer transition-colors ${
                    active
                      ? "bg-primary text-on-primary"
                      : "border border-border-hairline text-text-main hover:bg-surface-variant"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
          <div className="w-full md:w-auto flex justify-end">
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="border-none bg-transparent font-caption text-caption text-text-main font-bold cursor-pointer focus:ring-0"
            >
              <option value="score">Sort: Overall score</option>
              <option value="movers">Sort: Biggest movers</option>
              <option value="reviews">Sort: Most reviewed</option>
              <option value="alpha">Sort: A → Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <div className="font-caption text-caption text-text-caption mb-4">
          {resultSummary}
        </div>

        {filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {visible.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
            </div>

            {remaining.length > 0 && (
              <div className="relative mt-gutter">
                <div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter pointer-events-none select-none"
                  style={{ filter: "blur(6px)", opacity: 0.5 }}
                >
                  {remaining.slice(0, 4).map((brand) => (
                    <BrandCard key={brand.id} brand={brand} />
                  ))}
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-background-paper via-background-paper/90 to-transparent z-10 px-6 py-10">
                  <span className="material-symbols-outlined text-4xl text-primary mb-3">
                    lock
                  </span>
                  <h3 className="font-headline-md text-headline-md text-primary mb-2 text-center">
                    See all brands
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-5 text-center max-w-md">
                    Create a free account to browse every brand in the index,
                    view detailed scores, and compare across categories.
                  </p>
                  <button
                    onClick={() => openSignIn({ view: "signup" })}
                    className="bg-primary text-on-primary font-semibold px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    Create Free Account
                  </button>
                  <p className="font-caption text-caption text-text-caption mt-3">
                    Already have an account?{" "}
                    <button
                      onClick={() => openSignIn()}
                      className="text-primary hover:underline cursor-pointer"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="border border-dashed border-border-hairline rounded p-12 text-center">
            <p className="font-headline-md text-headline-md text-text-main mb-2">
              No brands match.
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Try a different category or clear your search.
            </p>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <section className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop pb-16">
        <div className="border border-border-hairline rounded bg-surface-card p-8 md:p-12 text-center">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-3">
            Don&apos;t see a brand you carry?
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mx-auto mb-6">
            Be the first to rate them. Your review adds them to the index and
            gives them actionable feedback on how to better support specialty
            retail.
          </p>
          <Link
            href="/submit"
            className="inline-block bg-primary text-on-primary font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-opacity active:scale-[0.98] text-lg"
          >
            Review a Brand
          </Link>
        </div>
      </section>
    </main>
  );
}
