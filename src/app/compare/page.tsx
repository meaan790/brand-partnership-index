"use client";

import { useState, useMemo } from "react";
import { SEED_BRANDS } from "@/lib/seed-data";
import { DIMENSIONS } from "@/lib/constants";
import { BrandLogo } from "@/components/BrandLogo";
import { ScoreBadge } from "@/components/ScoreBadge";
import { tierBarClass } from "@/lib/scoring";
import type { BrandWithScores } from "@/lib/types";

export default function ComparePage() {
  const [selected, setSelected] = useState<BrandWithScores[]>([]);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return SEED_BRANDS.filter(
      (b) =>
        b.name.toLowerCase().includes(q) &&
        !selected.some((s) => s.slug === b.slug)
    ).slice(0, 6);
  }, [search, selected]);

  const addBrand = (brand: BrandWithScores) => {
    if (selected.length < 4) {
      setSelected([...selected, brand]);
      setSearch("");
    }
  };

  const removeBrand = (slug: string) => {
    setSelected(selected.filter((b) => b.slug !== slug));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-2">
        Compare Brands
      </h1>
      <p className="text-on-surface-variant mb-8">
        Select up to 4 brands to compare side by side across all five
        partnership standards.
      </p>

      <div className="relative mb-8 max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for a brand to add..."
          className="w-full px-4 py-3 border border-border-hairline rounded-lg bg-surface-card text-text-main placeholder:text-text-caption focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
        {filtered.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-surface-card border border-border-hairline rounded-lg shadow-card-hover overflow-hidden">
            {filtered.map((b) => (
              <button
                key={b.slug}
                onClick={() => addBrand(b)}
                className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low border-b border-border-hairline last:border-b-0 transition-colors"
              >
                <BrandLogo name={b.name} domain={b.domain} size="w-8 h-8" />
                <span className="font-medium text-text-main">{b.name}</span>
                <span className="text-text-caption text-sm ml-auto">
                  {b.score}/100
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {selected.map((b) => (
            <span
              key={b.slug}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
            >
              {b.name}
              <button
                onClick={() => removeBrand(b.slug)}
                className="hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined text-base">
                  close
                </span>
              </button>
            </span>
          ))}
        </div>
      )}

      {selected.length >= 2 ? (
        <div className="bg-surface-card border border-border-hairline rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-primary text-on-primary">
                  <th className="text-left px-4 py-3 font-semibold text-sm">
                    Standard
                  </th>
                  {selected.map((b) => (
                    <th
                      key={b.slug}
                      className="text-center px-4 py-3 font-semibold text-sm min-w-[120px]"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <BrandLogo
                          name={b.name}
                          domain={b.domain}
                          size="w-8 h-8"
                        />
                        <span className="text-xs">{b.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DIMENSIONS.map((dim, i) => (
                  <tr
                    key={dim.key}
                    className="border-b border-border-hairline last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-text-caption text-lg">
                          {
                            {
                              website: "language",
                              pricing: "payments",
                              local: "storefront",
                              floor: "support_agent",
                              pro: "badge",
                            }[dim.key]
                          }
                        </span>
                        <div>
                          <p className="font-medium text-sm text-text-main">
                            {dim.name}
                          </p>
                          <p className="text-xs text-text-caption">
                            {dim.blurb}
                          </p>
                        </div>
                      </div>
                    </td>
                    {selected.map((b) => (
                      <td key={b.slug} className="text-center px-4 py-3">
                        <div className="flex flex-col items-center gap-1">
                          <ScoreBadge score={b.dims[i]} max={20} size="sm" />
                          <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${tierBarClass(b.dims[i])}`}
                              style={{ width: `${(b.dims[i] / 20) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-surface-container-low font-bold">
                  <td className="px-4 py-4 text-sm text-text-main">Overall</td>
                  {selected.map((b) => (
                    <td key={b.slug} className="text-center px-4 py-4">
                      <ScoreBadge score={b.score} max={100} size="md" />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-surface-card border border-border-hairline rounded-xl">
          <span className="material-symbols-outlined text-5xl text-text-caption mb-4">
            compare_arrows
          </span>
          <p className="text-on-surface-variant">
            {selected.length === 0
              ? "Search and select at least 2 brands to compare."
              : "Select one more brand to start comparing."}
          </p>
        </div>
      )}
    </div>
  );
}
