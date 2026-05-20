"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SEED_BRANDS } from "@/lib/seed-data";
import { DIMENSIONS } from "@/lib/constants";
import { tierBg, tierBg100, changeClass } from "@/lib/scoring";
import { BrandLogo } from "@/components/BrandLogo";
import { useSignInModal } from "@/components/SignInModalProvider";
import { createClient } from "@/lib/supabase/client";
import type { BrandWithScores } from "@/lib/types";

function getBrand(name: string): BrandWithScores | undefined {
  return SEED_BRANDS.find((b) => b.name === name);
}

export default function ComparePage() {
  const { open: openSignIn } = useSignInModal();
  const [slots, setSlots] = useState<(string | null)[]>([
    "Brooks",
    "Hoka",
    "Patagonia",
    "YETI",
  ]);

  const updateSlot = (idx: number, val: string | null) => {
    setSlots((prev) => {
      const next = [...prev];
      next[idx] = val || null;
      return next;
    });
  };

  const removeSlot = (idx: number) => updateSlot(idx, null);

  const picked = slots.map((n) => (n ? getBrand(n) ?? null : null));
  const filled = picked.filter(Boolean) as BrandWithScores[];

  const brandOptions = (selectedName: string | null) => (
    <>
      <option value="">— Select brand —</option>
      {SEED_BRANDS.map((b) => (
        <option key={b.name} value={b.name} selected={b.name === selectedName}>
          {b.name}
        </option>
      ))}
    </>
  );

  const [isAuthed, setIsAuthed] = useState(false);
  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => { if (data.user) setIsAuthed(true); });
    } catch { /* ignore */ }
  }, []);

  const isGated = (i: number) => !isAuthed && i >= 2;

  const overallScores = picked.map((b) => (b ? b.score : null));
  const maxOverall = Math.max(
    ...(overallScores.filter((s) => s !== null) as number[])
  );

  function pickerCard(slotIdx: number) {
    const name = slots[slotIdx];
    const brand = name ? getBrand(name) : null;
    if (!brand) {
      return (
        <div className="border border-dashed border-border-hairline rounded bg-surface-card p-card-padding flex flex-col items-center justify-center gap-3 min-h-[160px]">
          <span className="material-symbols-outlined text-text-caption text-[32px]">
            add_circle
          </span>
          <select
            className="border border-border-hairline rounded px-3 py-2 font-body-md focus:outline-none focus:border-primary"
            value=""
            onChange={(e) => updateSlot(slotIdx, e.target.value)}
          >
            {brandOptions(null)}
          </select>
        </div>
      );
    }
    return (
      <div className="border border-border-hairline rounded bg-surface-card p-card-padding flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <BrandLogo
            name={brand.name}
            domain={brand.domain}
            size="w-14 h-14"
          />
          <button
            onClick={() => removeSlot(slotIdx)}
            className="font-caption text-caption text-text-caption hover:text-score-low transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">
              close
            </span>{" "}
            Remove
          </button>
        </div>
        <Link
          href={`/brands/${brand.slug}`}
          className="font-headline-md text-headline-md text-primary hover:underline"
        >
          {brand.name}
        </Link>
        <select
          className="border border-border-hairline rounded px-3 py-2 font-body-md focus:outline-none focus:border-primary"
          value={brand.name}
          onChange={(e) => updateSlot(slotIdx, e.target.value)}
        >
          {brandOptions(brand.name)}
        </select>
        <div className="flex items-center justify-between border-t border-border-hairline pt-3">
          <span
            className={`${tierBg100(brand.score)} px-3 py-1 rounded font-data-tabular text-data-tabular`}
          >
            {brand.score}
          </span>
          <span
            className={`font-data-tabular text-data-tabular ${changeClass(brand.change)}`}
          >
            {brand.change} vs last year
          </span>
        </div>
      </div>
    );
  }

  function gatedPicker() {
    const brand3 = slots[2] ? getBrand(slots[2]) : null;
    const brand4 = slots[3] ? getBrand(slots[3]) : null;
    return (
      <div className="md:col-span-2 relative rounded overflow-hidden min-h-[160px]">
        <div
          className="grid grid-cols-2 gap-gutter pointer-events-none select-none"
          style={{ filter: "blur(6px)", opacity: 0.5 }}
        >
          {brand3 ? (
            <div className="border border-border-hairline rounded bg-surface-card p-card-padding flex flex-col gap-3">
              <div className="flex items-start">
                <BrandLogo
                  name={brand3.name}
                  domain={brand3.domain}
                  size="w-14 h-14"
                />
              </div>
              <span className="font-headline-md text-headline-md text-primary">
                {brand3.name}
              </span>
              <div className="flex items-center gap-2 border-t border-border-hairline pt-3">
                <span
                  className={`${tierBg100(brand3.score)} px-3 py-1 rounded font-data-tabular text-data-tabular`}
                >
                  {brand3.score}
                </span>
                <span
                  className={`font-data-tabular text-data-tabular ${changeClass(brand3.change)}`}
                >
                  {brand3.change} vs last year
                </span>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-border-hairline rounded bg-surface-card p-card-padding min-h-[160px]" />
          )}
          {brand4 ? (
            <div className="border border-border-hairline rounded bg-surface-card p-card-padding flex flex-col gap-3">
              <div className="flex items-start">
                <BrandLogo
                  name={brand4.name}
                  domain={brand4.domain}
                  size="w-14 h-14"
                />
              </div>
              <span className="font-headline-md text-headline-md text-primary">
                {brand4.name}
              </span>
              <div className="flex items-center gap-2 border-t border-border-hairline pt-3">
                <span
                  className={`${tierBg100(brand4.score)} px-3 py-1 rounded font-data-tabular text-data-tabular`}
                >
                  {brand4.score}
                </span>
                <span
                  className={`font-data-tabular text-data-tabular ${changeClass(brand4.change)}`}
                >
                  {brand4.change} vs last year
                </span>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-border-hairline rounded bg-surface-card p-card-padding min-h-[160px]" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/60 flex flex-col items-center justify-center gap-3 text-center px-6">
          <span className="material-symbols-outlined text-primary text-[32px]">
            lock
          </span>
          <p className="font-body-md text-body-md text-primary font-semibold">
            Compare up to four brands
          </p>
          <p className="font-caption text-caption text-text-caption">
            Sign in to unlock two more brand slots and compare side by side.
          </p>
          <button
            onClick={() => openSignIn()}
            className="bg-primary text-on-primary font-semibold px-5 py-2 rounded-full text-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  function comparisonTable() {
    if (filled.length < 2) {
      return (
        <div className="p-12 text-center">
          <p className="font-headline-md text-headline-md text-text-main mb-2">
            Add at least two brands to compare.
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Use the dropdowns above.
          </p>
        </div>
      );
    }

    const headerCols = picked.map((b, i) => {
      if (!b)
        return (
          <div
            key={i}
            className="p-4 border-l border-border-hairline"
          />
        );
      return (
        <div
          key={i}
          className="p-4 border-l border-border-hairline"
          style={isGated(i) ? { filter: "blur(5px)" } : undefined}
        >
          <Link
            href={`/brands/${b.slug}`}
            className="flex items-center gap-3 hover:underline"
          >
            <BrandLogo name={b.name} domain={b.domain} />
            <span className="font-body-md text-body-md font-bold text-primary">
              {b.name}
            </span>
          </Link>
        </div>
      );
    });

    const overallCols = picked.map((b, i) => {
      if (!b)
        return (
          <div
            key={i}
            className="p-4 border-l border-border-hairline"
          />
        );
      const isBest = b.score === maxOverall && filled.length > 1;
      return (
        <div
          key={i}
          className="p-4 border-l border-border-hairline flex items-center gap-2"
          style={isGated(i) ? { filter: "blur(5px)" } : undefined}
        >
          <span
            className={`${tierBg100(b.score)} px-3 py-1 rounded font-data-tabular text-data-tabular`}
          >
            {b.score}
          </span>
          {isBest && (
            <span
              className="material-symbols-outlined text-score-high text-[18px]"
              data-weight="fill"
              title="Best of compared brands"
            >
              check_circle
            </span>
          )}
        </div>
      );
    });

    const dimRows = DIMENSIONS.map((d, di) => {
      const scores = picked.map((b) => (b ? b.dims[di] : null));
      const max = Math.max(
        ...(scores.filter((s) => s !== null) as number[])
      );
      const cells = picked.map((b, j) => {
        if (!b)
          return (
            <div
              key={j}
              className="p-4 border-l border-border-hairline"
            />
          );
        const isBest = b.dims[di] === max && filled.length > 1;
        return (
          <div
            key={j}
            className="p-4 border-l border-border-hairline flex items-center gap-2"
            style={isGated(j) ? { filter: "blur(5px)" } : undefined}
          >
            <span
              className={`${tierBg(b.dims[di])} px-2 py-1 rounded font-data-tabular text-data-tabular`}
            >
              {b.dims[di]}/20
            </span>
            {isBest && (
              <span
                className="material-symbols-outlined text-score-high text-[18px]"
                data-weight="fill"
                title="Best on this dimension"
              >
                check_circle
              </span>
            )}
          </div>
        );
      });
      return (
        <div
          key={d.key}
          className="grid grid-cols-[200px_repeat(4,1fr)] border-t border-border-hairline"
        >
          <div className="p-4 bg-surface-container-low">
            <div className="font-data-tabular text-data-tabular text-text-main">
              {d.name}
            </div>
            <div className="font-caption text-caption text-text-caption">
              {d.blurb}
            </div>
          </div>
          {cells}
        </div>
      );
    });

    const reviewsCols = picked.map((b, i) => {
      if (!b)
        return (
          <div
            key={i}
            className="p-4 border-l border-border-hairline"
          />
        );
      return (
        <div
          key={i}
          className="p-4 border-l border-border-hairline font-caption text-caption text-text-main"
          style={isGated(i) ? { filter: "blur(5px)" } : undefined}
        >
          {b.review_count} verified review{b.review_count === 1 ? "" : "s"}
        </div>
      );
    });

    const mobileCards = picked.map((b) => {
      if (!b) return null;
      const isBestOverall = b.score === maxOverall && filled.length > 1;
      return (
        <div
          key={b.name}
          className="border border-border-hairline rounded bg-surface-card p-card-padding"
        >
          <div className="flex items-center gap-3 mb-4">
            <BrandLogo name={b.name} domain={b.domain} />
            <Link
              href={`/brands/${b.slug}`}
              className="font-body-md text-body-md font-bold text-primary hover:underline"
            >
              {b.name}
            </Link>
          </div>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-hairline">
            <span className="font-data-tabular text-data-tabular text-text-caption">
              Overall
            </span>
            <span
              className={`${tierBg100(b.score)} px-3 py-1 rounded font-data-tabular text-data-tabular`}
            >
              {b.score}
            </span>
            {isBestOverall && (
              <span
                className="material-symbols-outlined text-score-high text-[18px]"
                data-weight="fill"
              >
                check_circle
              </span>
            )}
          </div>
          {DIMENSIONS.map((d, di) => {
            const isBest =
              b.dims[di] ===
                Math.max(
                  ...picked
                    .filter(Boolean)
                    .map((x) => (x as BrandWithScores).dims[di])
                ) && filled.length > 1;
            return (
              <div
                key={d.key}
                className="flex items-center justify-between py-2 border-b border-border-hairline last:border-b-0"
              >
                <span className="font-data-tabular text-data-tabular text-text-main">
                  {d.name}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`${tierBg(b.dims[di])} px-2 py-1 rounded font-data-tabular text-data-tabular`}
                  >
                    {b.dims[di]}/20
                  </span>
                  {isBest && (
                    <span
                      className="material-symbols-outlined text-score-high text-[18px]"
                      data-weight="fill"
                    >
                      check_circle
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          <div className="pt-3 mt-2 font-caption text-caption text-text-main">
            {b.review_count} verified review
            {b.review_count === 1 ? "" : "s"}
          </div>
        </div>
      );
    });

    return (
      <>
        <div className="md:hidden flex flex-col gap-4 p-4">{mobileCards}</div>
        <div className="hidden md:block">
          <div className="grid grid-cols-[200px_repeat(4,1fr)] bg-surface-container-low">
            <div className="p-4">
              <span className="font-label-caps text-label-caps text-text-caption uppercase">
                Brand
              </span>
            </div>
            {headerCols}
          </div>
          <div className="grid grid-cols-[200px_repeat(4,1fr)] border-t border-border-hairline">
            <div className="p-4 bg-surface-container-low">
              <div className="font-data-tabular text-data-tabular text-text-main">
                Overall
              </div>
              <div className="font-caption text-caption text-text-caption">
                0–100
              </div>
            </div>
            {overallCols}
          </div>
          {dimRows}
          <div className="grid grid-cols-[200px_repeat(4,1fr)] border-t border-border-hairline">
            <div className="p-4 bg-surface-container-low">
              <div className="font-data-tabular text-data-tabular text-text-main">
                Reviews
              </div>
            </div>
            {reviewsCols}
          </div>
        </div>
      </>
    );
  }

  function highlights() {
    if (filled.length < 2) return null;
    const wins = filled.map((b) => ({ brand: b, count: 0 }));
    DIMENSIONS.forEach((_, i) => {
      const max = Math.max(...filled.map((b) => b.dims[i]));
      filled.forEach((b, j) => {
        if (b.dims[i] === max) wins[j].count += 1;
      });
    });
    const sorted = wins.slice().sort((a, b) => b.count - a.count);
    const leader = sorted[0];
    return (
      <div className="border border-border-hairline rounded bg-surface-card p-card-padding">
        <h2 className="font-headline-md text-headline-md text-primary mb-3">
          Highlights
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          <strong className="text-primary">{leader.brand.name}</strong> wins on{" "}
          <strong>{leader.count}</strong> of {DIMENSIONS.length} dimensions in
          this comparison, with an overall score of{" "}
          <strong>{leader.brand.score}/100</strong>.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Hero — dark navy centered */}
      <section className="bg-primary pt-16 md:pt-20 pb-12 md:pb-14">
        <div className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <h1 className="font-display-lg text-display-lg text-white mb-4">
            Lay brands side by side
          </h1>
          <p className="font-body-lg text-body-lg text-white/70 max-w-xl mx-auto">
            Pick up to four brands. We&apos;ll show overall and per-dimension
            scores in a single view, with the best on each row highlighted.
          </p>
        </div>
      </section>

    <div className="max-w-[1280px] mx-auto w-full px-margin-mobile md:px-margin-desktop py-12">

      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-12">
        {pickerCard(0)}
        {pickerCard(1)}
        {gatedPicker()}
      </div>

      <div className="border border-border-hairline rounded bg-surface-card overflow-x-auto">
        {comparisonTable()}
      </div>

      <div className="mt-12">{highlights()}</div>
    </div>
    </>
  );
}
