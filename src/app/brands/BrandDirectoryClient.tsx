"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ScoreBadge } from "@/components/ScoreBadge";
import { BrandLogo } from "@/components/BrandLogo";
import type { BrandWithScores } from "@/lib/types";

function allCategories(brands: BrandWithScores[]): string[] {
  const set = new Set<string>();
  brands.forEach((b) => b.categories.forEach((c) => set.add(c)));
  return Array.from(set).sort();
}

export function BrandDirectoryClient({ brands }: { brands: BrandWithScores[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(() => allCategories(brands), [brands]);

  const filtered = useMemo(() => {
    let list = brands;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((b) => b.name.toLowerCase().includes(q));
    }
    if (category) {
      list = list.filter((b) => b.categories.includes(category));
    }
    return list;
  }, [brands, query, category]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-main">
          Brands
        </h1>
        <p className="mt-2 text-text-caption">
          Browse and compare outdoor, running, and action-sports brands.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-caption text-xl">
            search
          </span>
          <input
            type="text"
            placeholder="Search brands…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-hairline bg-surface-card text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !category
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-text-caption hover:bg-surface-variant"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(category === c ? null : c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                category === c
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-text-caption hover:bg-surface-variant"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="flex flex-col p-5 rounded-xl bg-surface-card border border-border-hairline hover:shadow-card-hover transition-shadow group"
            >
              <div className="flex items-start gap-3 mb-4">
                <BrandLogo
                  name={brand.name}
                  domain={brand.domain}
                  size="w-12 h-12"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-text-main group-hover:text-accent transition-colors truncate">
                    {brand.name}
                  </h2>
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    {brand.categories.map((c) => (
                      <span
                        key={c}
                        className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-container text-text-caption"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between">
                <ScoreBadge score={brand.score} max={100} size="lg" />
                <span className="text-xs text-text-caption">
                  {brand.review_count} review{brand.review_count !== 1 ? "s" : ""}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-text-caption">
          No brands match your search.
        </div>
      )}
    </div>
  );
}
