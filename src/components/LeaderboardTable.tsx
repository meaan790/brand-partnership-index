"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DIMENSIONS } from "@/lib/constants";
import { changeClass } from "@/lib/scoring";
import { ScoreBadge } from "@/components/ScoreBadge";
import { BrandLogo } from "@/components/BrandLogo";
import type { BrandWithScores } from "@/lib/types";

const PAGE_SIZE = 10;

type SortField = "score" | "review_count" | "change" | `dim_${number}`;

function allCategories(brands: BrandWithScores[]): string[] {
  const set = new Set<string>();
  brands.forEach((b) => b.categories.forEach((c) => set.add(c)));
  return Array.from(set).sort();
}

export function LeaderboardTable({ brands }: { brands: BrandWithScores[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("score");
  const [sortAsc, setSortAsc] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const categories = useMemo(() => allCategories(brands), [brands]);

  const sorted = useMemo(() => {
    let list = [...brands];

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.categories.some((c) => c.toLowerCase().includes(q)),
      );
    }
    if (category) {
      list = list.filter((b) => b.categories.includes(category));
    }

    list.sort((a, b) => {
      let av: number, bv: number;
      if (sortField === "score") {
        av = a.score;
        bv = b.score;
      } else if (sortField === "review_count") {
        av = a.review_count;
        bv = b.review_count;
      } else if (sortField === "change") {
        av = parseFloat(a.change) || 0;
        bv = parseFloat(b.change) || 0;
      } else {
        const idx = parseInt(sortField.split("_")[1]);
        av = a.dims[idx];
        bv = b.dims[idx];
      }
      return sortAsc ? av - bv : bv - av;
    });

    return list;
  }, [brands, query, category, sortField, sortAsc]);

  const visible = showAll ? sorted : sorted.slice(0, PAGE_SIZE);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return null;
    return (
      <span className="material-symbols-outlined text-xs ml-0.5">
        {sortAsc ? "arrow_upward" : "arrow_downward"}
      </span>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
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

      {/* Desktop table */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border border-border-hairline bg-surface-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-hairline bg-surface-container-low text-text-caption text-xs uppercase tracking-wider">
              <th className="py-3 px-4 text-left font-medium w-12">#</th>
              <th className="py-3 px-4 text-left font-medium">Brand</th>
              {DIMENSIONS.map((d, i) => (
                <th key={d.key} className="py-3 px-2 text-center font-medium">
                  <button
                    onClick={() => handleSort(`dim_${i}` as SortField)}
                    className="inline-flex items-center hover:text-text-main transition-colors"
                  >
                    {d.short}
                    <SortIcon field={`dim_${i}` as SortField} />
                  </button>
                </th>
              ))}
              <th className="py-3 px-3 text-center font-medium">
                <button
                  onClick={() => handleSort("score")}
                  className="inline-flex items-center hover:text-text-main transition-colors"
                >
                  Overall
                  <SortIcon field="score" />
                </button>
              </th>
              <th className="py-3 px-3 text-center font-medium">
                <button
                  onClick={() => handleSort("review_count")}
                  className="inline-flex items-center hover:text-text-main transition-colors"
                >
                  Reviews
                  <SortIcon field="review_count" />
                </button>
              </th>
              <th className="py-3 px-3 text-center font-medium">
                <button
                  onClick={() => handleSort("change")}
                  className="inline-flex items-center hover:text-text-main transition-colors"
                >
                  Δ
                  <SortIcon field="change" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((brand, idx) => (
              <tr
                key={brand.id}
                className="border-b border-border-hairline last:border-0 hover:bg-surface-container-low transition-colors"
              >
                <td className="py-3 px-4 text-text-caption font-medium tabular-nums">
                  {idx + 1}
                </td>
                <td className="py-3 px-4">
                  <Link
                    href={`/brands/${brand.slug}`}
                    className="flex items-center gap-3 group"
                  >
                    <BrandLogo name={brand.name} domain={brand.domain} />
                    <div>
                      <span className="font-semibold text-text-main group-hover:text-accent transition-colors">
                        {brand.name}
                      </span>
                      <div className="flex gap-1.5 mt-0.5">
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
                  </Link>
                </td>
                {brand.dims.map((d, i) => (
                  <td key={DIMENSIONS[i].key} className="py-3 px-2 text-center">
                    <div className="flex justify-center">
                      <ScoreBadge score={d} max={20} size="sm" />
                    </div>
                  </td>
                ))}
                <td className="py-3 px-3 text-center">
                  <div className="flex justify-center">
                    <ScoreBadge score={brand.score} max={100} size="md" />
                  </div>
                </td>
                <td className="py-3 px-3 text-center text-text-caption tabular-nums">
                  {brand.review_count}
                </td>
                <td className="py-3 px-3 text-center">
                  <span
                    className={`text-xs font-semibold tabular-nums ${changeClass(brand.change)}`}
                  >
                    {brand.change !== "0" ? brand.change : "—"}
                  </span>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="py-12 text-center text-text-caption"
                >
                  No brands match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-2">
        {visible.map((brand, idx) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-surface-card border border-border-hairline hover:shadow-card-hover transition-shadow"
          >
            <span className="text-sm font-medium text-text-caption w-6 text-right tabular-nums shrink-0">
              {idx + 1}
            </span>
            <BrandLogo name={brand.name} domain={brand.domain} size="w-9 h-9" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-text-main truncate">
                {brand.name}
              </p>
              <div className="flex gap-1 mt-0.5">
                {brand.categories.slice(0, 2).map((c) => (
                  <span
                    key={c}
                    className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-container text-text-caption"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <ScoreBadge score={brand.score} max={100} size="md" />
          </Link>
        ))}
        {visible.length === 0 && (
          <div className="py-12 text-center text-text-caption text-sm">
            No brands match your search.
          </div>
        )}
      </div>

      {/* Show more */}
      {!showAll && sorted.length > PAGE_SIZE && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAll(true)}
            className="px-6 py-2.5 rounded-full border border-border-hairline text-sm font-medium text-text-main hover:bg-surface-container-low transition-colors"
          >
            Show all {sorted.length} brands
          </button>
        </div>
      )}
    </div>
  );
}
