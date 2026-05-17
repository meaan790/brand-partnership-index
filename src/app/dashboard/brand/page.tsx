"use client";

import { useState } from "react";
import Link from "next/link";
import { DIMENSIONS } from "@/lib/constants";

const BRAND_SCORES = [
  { name: "Website Standards", score: 16, avg: 14, variance: "+2" },
  { name: "Pricing Standards", score: 13, avg: 14, variance: "-1" },
  { name: "Shop Local Support", score: 16, avg: 13, variance: "+3" },
  { name: "Shop Floor Support", score: 14, avg: 14, variance: "0" },
  { name: "Pro Deal Standards", score: 10, avg: 11, variance: "-1" },
];

function scoreBg(s: number) {
  if (s >= 15) return "bg-score-high";
  if (s >= 10) return "bg-score-mid";
  return "bg-score-low";
}
function varianceColor(v: string) {
  if (v.startsWith("+")) return "text-score-high";
  if (v.startsWith("-")) return "text-score-low";
  return "text-on-surface-variant";
}

const INITIAL_COMMITMENTS = [
  { label: "MAP Defense Pledge", active: true },
  { label: "Retail Investment Parity Pledge", active: false },
  { label: "Shop Local First Pledge", active: false },
  { label: "Pro Deal Discipline Pledge", active: false },
  { label: "MAP Enforcement Policy", active: true },
  { label: "B2B Portal Access", active: true },
  { label: "Pre-book Guarantees", active: false },
];

const REVIEWS = [
  {
    source: "SPECIALTY RUNNING STORE \u2022 MIDWEST",
    date: "Submitted Mar 14, 2026",
    stars: 3,
    quote:
      "\u201cGreat product as always, but communication from our rep has dropped off significantly since the reorg. Hard to get clear answers on restocks.\u201d",
  },
  {
    source: "MULTI-DOOR RETAILER \u2022 PACIFIC NW",
    date: "Submitted Feb 28, 2026",
    stars: 2,
    quote:
      "\u201cMAP violations online are killing our margin. We need Brooks to enforce their policies better before we commit to Fall '26.\u201d",
  },
];

export default function BrandDashboardPage() {
  const [commitments, setCommitments] = useState(INITIAL_COMMITMENTS);
  const [editing, setEditing] = useState(false);
  const [newCommitment, setNewCommitment] = useState("");

  const toggleCommitment = (idx: number) => {
    setCommitments((prev) =>
      prev.map((c, i) =>
        i === idx ? { ...c, active: !c.active } : c
      )
    );
  };
  const removeCommitment = (idx: number) => {
    setCommitments((prev) => prev.filter((_, i) => i !== idx));
  };
  const addCommitment = () => {
    if (!newCommitment.trim()) return;
    setCommitments((prev) => [
      ...prev,
      { label: newCommitment.trim(), active: true },
    ]);
    setNewCommitment("");
  };

  const active = commitments.filter((c) => c.active);
  const inactive = commitments.filter((c) => !c.active);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12 flex flex-col gap-section-gap">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border-hairline pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h1 className="font-display-lg text-display-lg text-primary">
              Brooks
            </h1>
            <span className="inline-flex items-center gap-1 bg-surface-dim px-3 py-1 rounded-full font-label-caps text-label-caps text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px]">
                verified
              </span>
              CLAIMED BRAND
            </span>
          </div>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Manage your brand&apos;s presence, respond to retailer feedback, and
            update your public commitments on the Wholesale Partnership Index.
          </p>
        </div>
        <div className="flex gap-4 flex-wrap">
          <Link
            href="/brands/brooks"
            className="px-6 py-3 border border-border-hairline rounded font-label-caps text-label-caps text-primary hover:bg-surface-container-low transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">
              visibility
            </span>
            View Public Profile
          </Link>
          <button className="px-6 py-3 border border-border-hairline rounded font-label-caps text-label-caps text-primary hover:bg-surface-container-low transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">edit</span>
            Manage Profile
          </button>
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Column */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          {/* Overall Score */}
          <div className="bg-surface-card border border-border-hairline p-card-padding flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="font-label-caps text-label-caps text-on-surface-variant">
                Overall Index Score
              </h2>
              <span className="material-symbols-outlined text-outline">
                info
              </span>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="font-display-lg text-display-lg text-primary">
                74
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant">
                / 100
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between font-caption text-caption">
                <span className="text-on-surface-variant">Category Average</span>
                <span className="text-primary font-bold">68</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div
                  className="bg-score-high h-full"
                  style={{ width: "74%" }}
                />
              </div>
            </div>
            <div className="pt-4 border-t border-border-hairline">
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption text-on-surface-variant">
                  Trend (Last 12 mo)
                </span>
                <span className="material-symbols-outlined text-score-high">
                  trending_up
                </span>
              </div>
              <div className="h-12 w-full mt-2 relative">
                <svg
                  className="w-full h-full text-primary"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 30"
                >
                  <path
                    d="M0,25 L20,20 L40,22 L60,10 L80,15 L100,5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Public Commitments */}
          <div className="bg-surface-card border border-border-hairline p-card-padding flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="font-label-caps text-label-caps text-on-surface-variant">
                Public Commitments
              </h2>
              <button
                className="font-caption text-caption text-link-endvr hover:underline"
                onClick={() => setEditing(!editing)}
              >
                {editing ? "Cancel" : "Edit"}
              </button>
            </div>
            {!editing ? (
              <div className="flex flex-col gap-3">
                {active.map((c) => (
                  <div key={c.label} className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-score-high/10 text-score-high">
                      <span className="material-symbols-outlined text-[14px]">
                        check
                      </span>
                    </span>
                    <span className="font-body-md text-body-md text-primary">
                      {c.label}
                    </span>
                  </div>
                ))}
                {inactive.map((c) => (
                  <div key={c.label} className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-surface-container text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px]">
                        close
                      </span>
                    </span>
                    <span className="font-body-md text-body-md text-on-surface-variant">
                      {c.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="font-caption text-caption text-text-caption">
                  Toggle commitments on or off. These are visible on your public
                  brand profile.
                </p>
                <div className="flex flex-col gap-3">
                  {commitments.map((c, i) => (
                    <label
                      key={i}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div
                        className={`relative w-10 h-6 rounded-full transition-colors ${c.active ? "bg-score-high" : "bg-surface-container"}`}
                        onClick={() => toggleCommitment(i)}
                      >
                        <div
                          className={`absolute top-1 ${c.active ? "left-5" : "left-1"} w-4 h-4 rounded-full bg-white shadow transition-all`}
                        />
                      </div>
                      <span
                        className={`font-body-md text-body-md ${c.active ? "text-primary" : "text-on-surface-variant"}`}
                      >
                        {c.label}
                      </span>
                      {i >= 4 && (
                        <button
                          onClick={() => removeCommitment(i)}
                          className="ml-auto text-text-caption hover:text-error transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            delete
                          </span>
                        </button>
                      )}
                    </label>
                  ))}
                </div>
                <div className="border-t border-border-hairline pt-4 mt-2">
                  <p className="font-caption text-caption text-text-caption mb-2">
                    Add a custom commitment
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Retailer-First Pricing"
                      className="flex-1 border border-border-hairline rounded px-3 py-2 font-body-md text-body-md text-text-main placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent"
                      value={newCommitment}
                      onChange={(e) => setNewCommitment(e.target.value)}
                    />
                    <button
                      onClick={addCommitment}
                      className="px-4 py-2 bg-primary text-on-primary font-caption text-caption rounded hover:opacity-90 transition-opacity"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setEditing(false)}
                  className="w-full py-2 bg-primary text-on-primary font-body-md text-body-md rounded hover:opacity-90 transition-opacity mt-2"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Right Column */}
        <section className="lg:col-span-8 flex flex-col gap-gutter">
          {/* Standard Breakdown */}
          <div className="bg-surface-card border border-border-hairline flex flex-col">
            <div className="p-card-padding border-b border-border-hairline flex justify-between items-center">
              <h2 className="font-headline-md text-headline-md text-primary">
                Standard Breakdown
              </h2>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-hairline bg-surface-container-low">
                    <th className="p-4 font-label-caps text-label-caps text-on-surface-variant w-1/3">
                      Dimension
                    </th>
                    <th className="p-4 font-label-caps text-label-caps text-on-surface-variant text-center">
                      Score
                    </th>
                    <th className="p-4 font-label-caps text-label-caps text-on-surface-variant text-center">
                      Category Avg
                    </th>
                    <th className="p-4 font-label-caps text-label-caps text-on-surface-variant text-right">
                      Variance
                    </th>
                  </tr>
                </thead>
                <tbody className="font-data-tabular text-data-tabular">
                  {BRAND_SCORES.map((row, i) => (
                    <tr
                      key={row.name}
                      className={`${i < BRAND_SCORES.length - 1 ? "border-b border-border-hairline" : ""} hover:bg-surface-container-low transition-colors`}
                    >
                      <td className="p-4 text-primary font-body-md text-body-md">
                        {row.name}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 ${scoreBg(row.score)} text-white rounded`}
                        >
                          {row.score}
                        </span>
                      </td>
                      <td className="p-4 text-center text-on-surface-variant">
                        {row.avg}
                      </td>
                      <td
                        className={`p-4 text-right ${varianceColor(row.variance)}`}
                      >
                        {row.variance === "0" ? "0" : row.variance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Unanswered Reviews */}
          <div className="bg-surface-card border border-border-hairline flex flex-col">
            <div className="p-card-padding border-b border-border-hairline flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h2 className="font-headline-md text-headline-md text-primary">
                  Unanswered Reviews
                </h2>
                <span className="bg-error text-on-error px-2 py-0.5 rounded-full font-label-caps text-label-caps">
                  2 Pending
                </span>
              </div>
            </div>
            <div className="flex flex-col divide-y divide-border-hairline">
              {REVIEWS.map((r, i) => {
                const starColor =
                  r.stars >= 3 ? "text-score-high" : "text-score-low";
                const emptyColor = "text-surface-container";
                return (
                  <div key={i} className="p-card-padding flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="font-label-caps text-label-caps text-on-surface-variant">
                          {r.source}
                        </span>
                        <span className="font-caption text-caption text-text-caption mt-1">
                          {r.date}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span
                            key={s}
                            className={`material-symbols-outlined ${s <= r.stars ? starColor : emptyColor}`}
                            style={{
                              fontVariationSettings: "'FILL' 1",
                            }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                    </div>
                    <blockquote className="font-body-md text-body-md italic text-primary border-l-2 border-border-hairline pl-4">
                      {r.quote}
                    </blockquote>
                    <div className="flex justify-end mt-2">
                      <button className="px-4 py-2 bg-primary text-on-primary rounded font-label-caps text-label-caps hover:bg-primary/90 transition-colors">
                        Respond Privately
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
