"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { DIMENSIONS } from "@/lib/constants";
import {
  tierClass20,
  tierClass100,
  changeClass,
  strokeColor,
  topDim,
  bottomDim,
} from "@/lib/scoring";
import { BrandLogo } from "@/components/BrandLogo";
import { useSignInModal } from "@/components/SignInModalProvider";
import type { BrandWithScores } from "@/lib/types";

const GATE_LIMIT = 10;
const GATED_PREVIEW = 4;

const CATEGORIES = ["All", "Outdoor", "Surf", "Action Sports", "Bike", "Ski", "Running"];

const DIM_HEADER_LABELS: [string, string][] = [
  ["Brand.com", "Standards"],
  ["Pricing", "Standards"],
  ["Shop Local", "Support"],
  ["Shop Floor", "Support"],
  ["Pro Deal", "Standards"],
];

function autoSummary(b: BrandWithScores): string {
  const top = topDim(b.dims);
  const bot = bottomDim(b.dims);
  return `Strongest performance in <strong class='text-secondary'>${top.name}</strong> (${top.score}/20). Lowest scoring dimension is <strong class='text-secondary'>${bot.name}</strong> (${bot.score}/20) — flagged by retailers as the primary opportunity for improvement.`;
}

function changeNumeric(c: string): number {
  return parseInt(c, 10) || 0;
}

export function LeaderboardTable({
  brands,
}: {
  brands: BrandWithScores[];
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("score");
  const [expandedRanks, setExpandedRanks] = useState<Set<number>>(new Set());
  const { open: openSignIn } = useSignInModal();

  const filtered = useMemo(() => {
    let list = [...brands];
    if (filter !== "All")
      list = list.filter(
        (b) =>
          b.categories &&
          b.categories.some(
            (c) => c.toLowerCase() === filter.toLowerCase(),
          ),
      );
    if (search)
      list = list.filter((b) =>
        b.name.toLowerCase().includes(search.toLowerCase()),
      );
    if (sort === "score") list.sort((a, b) => b.score - a.score);
    else if (sort === "movers")
      list.sort(
        (a, b) =>
          Math.abs(changeNumeric(b.change)) -
          Math.abs(changeNumeric(a.change)),
      );
    else if (sort === "recent")
      list.sort((a, b) => b.review_count - a.review_count);
    return list;
  }, [brands, filter, search, sort]);

  const visible = filtered.slice(0, Math.min(GATE_LIMIT, filtered.length));
  const gated = filtered.slice(GATE_LIMIT);
  const gatedPreview = gated.slice(0, GATED_PREVIEW);

  const toggleRow = useCallback((rank: number) => {
    setExpandedRanks((prev) => {
      const next = new Set(prev);
      if (next.has(rank)) next.delete(rank);
      else next.add(rank);
      return next;
    });
  }, []);

  return (
    <>
      {/* Search & Filter Bar */}
      <div className="bg-background-paper md:sticky md:top-[73px] z-40 border-b border-border-hairline py-4">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-text-caption">
              search
            </span>
            <input
              className="w-full pl-10 pr-4 py-2 border border-border-hairline rounded bg-surface-card font-body-md text-body-md text-text-main focus:outline-none focus:border-primary transition-colors"
              placeholder="Find a brand"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={
                  filter === cat
                    ? "px-4 py-1.5 rounded-full bg-primary text-on-primary font-caption text-caption whitespace-nowrap"
                    : "px-4 py-1.5 rounded-full border border-border-hairline text-text-main font-caption text-caption whitespace-nowrap hover:bg-surface-variant transition-colors"
                }
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="w-full md:w-auto flex justify-end">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border-none bg-transparent font-caption text-caption text-text-main font-bold cursor-pointer focus:ring-0"
            >
              <option value="score">Overall score</option>
              <option value="movers">Biggest movers</option>
              <option value="recent">Recently reviewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <div className="w-full overflow-x-auto mb-16">
          <div className="md:min-w-[1000px] border border-border-hairline bg-surface-card rounded">
            {/* Mobile Header */}
            <div className="flex md:hidden px-4 py-3 border-b border-border-hairline bg-surface-container-low font-label-caps text-label-caps text-text-caption uppercase">
              <div className="w-10">Rank</div>
              <div className="flex-1">Brand</div>
              <div className="w-14 text-right">Score</div>
            </div>
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-border-hairline bg-surface-container-low font-label-caps text-label-caps text-text-caption uppercase items-end">
              <div className="col-span-1 pb-1">Rank</div>
              <div className="col-span-3 pb-1">Brand</div>
              <div className="col-span-1 text-center pb-1">Score</div>
              <div className="col-span-5 flex flex-col items-center">
                <div className="w-full text-center mb-3">
                  BRAND PARTNERSHIP STANDARDS (EACH OUT OF 20)
                </div>
                <div className="grid grid-cols-5 gap-1 w-full text-[10px] text-center font-bold text-text-caption">
                  {DIM_HEADER_LABELS.map(([line1, line2], i) => (
                    <div
                      key={i}
                      className="tooltip flex flex-col items-center justify-end leading-tight px-1 pb-1"
                    >
                      <span>{line1}</span>
                      <span>{line2}</span>
                      <span className="tooltiptext">
                        {DIMENSIONS[i].blurb}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-1 text-center pb-1">Trend</div>
              <div className="col-span-1 text-right pb-1">Change</div>
            </div>

            {/* Visible Rows */}
            <div>
              {visible.map((b, i) => {
                const rank = i + 1;
                const isTop = rank === 1;
                const expanded = expandedRanks.has(rank);
                const brandHref = `/brands/${b.slug}`;
                const summary = autoSummary(b);

                return (
                  <div
                    key={b.id}
                    className={`brand-row-wrapper border-b border-border-hairline ${isTop ? "bg-surface-bright relative z-10 shadow-sm" : ""}`}
                  >
                    {/* Mobile row */}
                    <div
                      className="brand-row flex md:hidden items-center px-4 py-3 hover:bg-background-paper transition-colors cursor-pointer"
                      role="button"
                      tabIndex={0}
                      aria-expanded={expanded}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest("a")) return;
                        toggleRow(rank);
                      }}
                      onKeyDown={(e) => {
                        if ((e.target as HTMLElement).closest("a")) return;
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleRow(rank);
                        }
                      }}
                    >
                      <div className="w-10 font-data-tabular text-data-tabular text-text-caption">
                        {rank}
                      </div>
                      <div className="flex-1 flex items-center gap-3 min-w-0">
                        <BrandLogo
                          name={b.name}
                          domain={b.domain}
                          size="w-8 h-8"
                        />
                        <Link
                          href={brandHref}
                          className={`brand-link font-body-md text-body-md font-bold truncate hover:underline ${isTop ? "text-primary" : "text-text-main"}`}
                        >
                          {b.name}
                        </Link>
                      </div>
                      <div className="w-14 flex justify-end">
                        <span
                          className={`${tierClass100(b.score)} px-2 py-0.5 rounded font-data-tabular text-data-tabular text-sm`}
                        >
                          {b.score}
                        </span>
                      </div>
                    </div>

                    {/* Desktop row */}
                    <div
                      className="brand-row hidden md:grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-background-paper transition-colors cursor-pointer"
                      role="button"
                      tabIndex={0}
                      aria-expanded={expanded}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest("a")) return;
                        toggleRow(rank);
                      }}
                      onKeyDown={(e) => {
                        if ((e.target as HTMLElement).closest("a")) return;
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleRow(rank);
                        }
                      }}
                    >
                      <div className="col-span-1 font-data-tabular text-data-tabular text-text-caption">
                        {rank}
                      </div>
                      <div className="col-span-3 flex items-center gap-3 min-w-0">
                        <BrandLogo
                          name={b.name}
                          domain={b.domain}
                          size="w-10 h-10"
                        />
                        <Link
                          href={brandHref}
                          className={`brand-link font-body-md text-body-md font-bold truncate hover:underline ${isTop ? "text-primary" : "text-text-main"}`}
                        >
                          {b.name}
                        </Link>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <span
                          className={`${tierClass100(b.score)} px-3 py-1 rounded font-data-tabular text-data-tabular`}
                        >
                          {b.score}
                        </span>
                      </div>
                      <div className="col-span-5 grid grid-cols-5 gap-1 font-data-tabular text-[10px]">
                        {b.dims.map((d, di) => (
                          <div
                            key={di}
                            className={`h-6 ${tierClass20(d)} rounded flex items-center justify-center`}
                          >
                            {d}/20
                          </div>
                        ))}
                      </div>
                      <div className="col-span-1 flex justify-center items-center">
                        <svg
                          className="w-20 h-6"
                          preserveAspectRatio="none"
                          viewBox="0 0 80 24"
                        >
                          <polyline
                            fill="none"
                            stroke={strokeColor(b.score)}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={`0,${b.spark[0]} 26,${b.spark[1]} 53,${b.spark[2]} 80,${b.spark[3]}`}
                          />
                        </svg>
                      </div>
                      <div
                        className={`col-span-1 text-right font-data-tabular text-data-tabular ${changeClass(b.change)}`}
                      >
                        <span className="inline-flex items-center justify-end gap-1">
                          <span>{b.change}</span>
                          <span className="chevron material-symbols-outlined text-base text-text-caption">
                            expand_more
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Detail pane */}
                    <div
                      className={`brand-detail ${expanded ? "" : "hidden"} px-4 md:px-6 pb-6 pt-2 md:ml-14 border-t border-border-hairline mx-4 md:mx-6 mt-2 flex flex-col gap-4`}
                    >
                      {/* Mobile dimension scores */}
                      <div className="md:hidden bg-background-paper rounded-lg border border-border-hairline p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-label-caps text-label-caps text-text-caption uppercase">
                            Dimension Scores
                          </span>
                          <span
                            className={`font-caption text-caption ${changeClass(b.change)}`}
                          >
                            {b.change}
                          </span>
                        </div>
                        {b.dims.map((d, di) => (
                          <div
                            key={di}
                            className={`flex items-center justify-between py-1.5 ${di < b.dims.length - 1 ? "border-b border-border-hairline" : ""}`}
                          >
                            <span className="font-body-md text-body-md text-on-surface-variant">
                              {DIMENSIONS[di].name}
                            </span>
                            <span
                              className={`${tierClass20(d)} px-2 py-0.5 rounded font-data-tabular text-sm`}
                            >
                              {d}/20
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-caption text-caption text-text-caption">
                          Based on{" "}
                          <strong className="text-primary-container">
                            {b.review_count} reviews
                          </strong>{" "}
                          from verified retailers.
                        </span>
                        <Link
                          href={brandHref}
                          className="font-caption text-caption text-primary font-bold hover:underline inline-flex items-center gap-1"
                        >
                          View full profile
                          <span className="material-symbols-outlined text-base">
                            arrow_forward
                          </span>
                        </Link>
                      </div>
                      <div className="bg-background-paper p-5 rounded-lg border border-border-hairline text-body-md font-body-md">
                        <h4 className="font-bold text-primary-container mb-2">
                          Performance Summary
                        </h4>
                        <p
                          className="text-on-surface-variant"
                          dangerouslySetInnerHTML={{ __html: summary }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {visible.length === 0 && (
                <div className="px-6 py-12 text-center text-text-caption font-body-md text-body-md">
                  No brands match your search.
                </div>
              )}
            </div>

            {/* Gated rows (blurred) */}
            {gatedPreview.length > 0 && (
              <div className="relative">
                <div
                  className="pointer-events-none select-none"
                  style={{ filter: "blur(6px)", opacity: 0.5 }}
                >
                  {gatedPreview.map((b, i) => {
                    const rank = GATE_LIMIT + i + 1;
                    return (
                      <div
                        key={b.id}
                        className="border-b border-border-hairline"
                      >
                        {/* Mobile blurred row */}
                        <div className="flex md:hidden items-center px-4 py-3">
                          <div className="w-10 font-data-tabular text-data-tabular text-text-caption">
                            {rank}
                          </div>
                          <div className="flex-1 flex items-center gap-3 min-w-0">
                            <BrandLogo
                              name={b.name}
                              domain={b.domain}
                              size="w-8 h-8"
                            />
                            <span className="font-body-md text-body-md font-bold truncate text-text-main">
                              {b.name}
                            </span>
                          </div>
                          <div className="w-14 flex justify-end">
                            <span
                              className={`${tierClass100(b.score)} px-2 py-0.5 rounded font-data-tabular text-data-tabular text-sm`}
                            >
                              {b.score}
                            </span>
                          </div>
                        </div>
                        {/* Desktop blurred row */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 items-center">
                          <div className="col-span-1 font-data-tabular text-data-tabular text-text-caption">
                            {rank}
                          </div>
                          <div className="col-span-3 flex items-center gap-3 min-w-0">
                            <BrandLogo
                              name={b.name}
                              domain={b.domain}
                              size="w-10 h-10"
                            />
                            <span className="font-body-md text-body-md font-bold truncate text-text-main">
                              {b.name}
                            </span>
                          </div>
                          <div className="col-span-1 flex justify-center">
                            <span
                              className={`${tierClass100(b.score)} px-3 py-1 rounded font-data-tabular text-data-tabular`}
                            >
                              {b.score}
                            </span>
                          </div>
                          <div className="col-span-5 grid grid-cols-5 gap-1 font-data-tabular text-[10px]">
                            {b.dims.map((d, di) => (
                              <div
                                key={di}
                                className={`h-6 ${tierClass20(d)} rounded flex items-center justify-center`}
                              >
                                {d}/20
                              </div>
                            ))}
                          </div>
                          <div className="col-span-1 flex justify-center items-center">
                            <svg
                              className="w-20 h-6"
                              preserveAspectRatio="none"
                              viewBox="0 0 80 24"
                            >
                              <polyline
                                fill="none"
                                stroke={strokeColor(b.score)}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={`0,${b.spark[0]} 26,${b.spark[1]} 53,${b.spark[2]} 80,${b.spark[3]}`}
                              />
                            </svg>
                          </div>
                          <div
                            className={`col-span-1 text-right font-data-tabular text-data-tabular ${changeClass(b.change)}`}
                          >
                            {b.change}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-surface-card via-surface-card/90 to-transparent z-10 px-6 py-10">
                  <span className="material-symbols-outlined text-4xl text-primary mb-3">
                    lock
                  </span>
                  <h3 className="font-headline-md text-headline-md text-primary mb-2 text-center">
                    See all brand rankings
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-5 text-center max-w-md">
                    Create a free account to view the full leaderboard, detailed
                    scores, and brand comparisons.
                  </p>
                  <button
                    onClick={() => openSignIn({ view: "signup" })}
                    className="bg-primary text-on-primary font-semibold px-8 py-3 rounded-full hover:bg-primary/90 transition-colors cursor-pointer"
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
          </div>
        </div>
      </div>
    </>
  );
}
