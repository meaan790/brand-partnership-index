"use client";

import Link from "next/link";

const RECENT_REVIEWS = [
  {
    brand: "Patagonia",
    date: "Mar 12, 2026",
    score: 87,
    scoreBg: "bg-score-high",
    status: "Published",
    dotBg: "bg-score-high",
  },
  {
    brand: "Arc'teryx",
    date: "Feb 28, 2026",
    score: 72,
    scoreBg: "bg-score-mid",
    status: "Pending Response",
    dotBg: "bg-score-mid",
  },
  {
    brand: "Hoka",
    date: "Feb 15, 2026",
    score: 78,
    scoreBg: "bg-score-high",
    status: "Published",
    dotBg: "bg-score-high",
  },
];

const RECOMMENDED = [
  { initials: "MH", name: "Mountain Hardwear", category: "Outerwear" },
  { initials: "SM", name: "Smartwool", category: "Apparel" },
  { initials: "OR", name: "Outdoor Research", category: "Outerwear" },
];

export default function RetailerDashboardPage() {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
      {/* Welcome */}
      <header className="mb-section-gap">
        <h1 className="font-display-lg text-display-lg text-primary mb-2">
          Welcome back, Summit Cycles &amp; Outdoor
        </h1>
        <p className="font-body-lg text-body-lg text-text-caption">
          Here&apos;s a summary of your recent activity and pending items.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-section-gap">
          {/* Activity & Quick Action */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {/* Activity Summary */}
            <div className="bg-surface-card border border-border-hairline p-card-padding flex flex-col justify-between h-full">
              <div>
                <h2 className="font-label-caps text-label-caps text-text-caption uppercase mb-4">
                  Your Activity
                </h2>
                <div className="flex items-baseline space-x-2 mb-6">
                  <span className="font-headline-lg text-headline-lg text-primary">
                    12
                  </span>
                  <span className="font-body-md text-body-md text-text-caption">
                    Reviews Submitted
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-surface-variant pb-2">
                  <span className="font-body-md text-body-md text-text-main">
                    Published
                  </span>
                  <span className="font-data-tabular text-data-tabular text-primary">
                    10
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-surface-variant pb-2">
                  <span className="font-body-md text-body-md text-text-main">
                    Pending Response
                  </span>
                  <span className="font-data-tabular text-data-tabular text-score-mid">
                    2
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action */}
            <Link
              href="/review"
              className="bg-surface-card border border-border-hairline p-card-padding flex flex-col justify-center items-start h-full group hover:bg-surface-container-low transition-colors cursor-pointer relative overflow-hidden no-underline"
            >
              <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-[120px]">
                  rate_review
                </span>
              </div>
              <div className="bg-surface-container-low text-primary w-12 h-12 flex items-center justify-center rounded-full mb-6 z-10">
                <span className="material-symbols-outlined">add</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-primary mb-2 z-10">
                Review a New Brand
              </h2>
              <p className="font-body-md text-body-md text-text-caption mb-6 z-10">
                Submit a new wholesale partner review. Bypasses initial
                verification for established accounts.
              </p>
              <span className="font-label-caps text-label-caps uppercase bg-primary text-on-primary px-6 py-3 rounded-full hover:bg-primary/90 transition-colors z-10">
                Start Review
              </span>
            </Link>
          </section>

          {/* Recent Reviews Table */}
          <section>
            <div className="flex justify-between items-end border-b border-border-hairline pb-4 mb-6">
              <h2 className="font-headline-md text-headline-md text-primary">
                Your Recent Reviews
              </h2>
              <a className="font-label-caps text-label-caps text-text-caption hover:text-primary uppercase transition-colors" href="#">
                View All
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-hairline">
                    <th className="py-3 px-2 font-label-caps text-label-caps text-text-caption uppercase font-normal">
                      Brand
                    </th>
                    <th className="py-3 px-2 font-label-caps text-label-caps text-text-caption uppercase font-normal">
                      Date
                    </th>
                    <th className="py-3 px-2 font-label-caps text-label-caps text-text-caption uppercase font-normal">
                      Score
                    </th>
                    <th className="py-3 px-2 font-label-caps text-label-caps text-text-caption uppercase font-normal">
                      Status
                    </th>
                    <th className="py-3 px-2" />
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md">
                  {RECENT_REVIEWS.map((r) => (
                    <tr
                      key={r.brand}
                      className="border-b border-border-hairline hover:bg-surface-container-low transition-colors group"
                    >
                      <td className="py-4 px-2 font-semibold text-primary">
                        {r.brand}
                      </td>
                      <td className="py-4 px-2 text-text-caption">{r.date}</td>
                      <td className="py-4 px-2">
                        <div
                          className={`${r.scoreBg} text-white font-data-tabular text-data-tabular px-2 h-8 flex items-center justify-center`}
                        >
                          {r.score}/100
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className="inline-flex items-center px-2 py-1 bg-surface-variant text-text-main font-caption text-caption rounded-full">
                          <span
                            className={`w-2 h-2 rounded-full ${r.dotBg} mr-2`}
                          />
                          {r.status}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-text-caption hover:text-primary">
                          <span className="material-symbols-outlined text-[20px]">
                            chevron_right
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-gutter mt-12 lg:mt-0">
          {/* Recommended to Review */}
          <div className="bg-surface-container-low border border-border-hairline p-card-padding">
            <h3 className="font-label-caps text-label-caps text-text-caption uppercase mb-6 tracking-widest border-b border-border-hairline pb-4">
              Recommended to Review
            </h3>
            <p className="font-caption text-caption text-text-caption mb-6">
              Based on your category profile (Outerwear, Hardgoods), we recommend
              submitting reviews for these brands to strengthen the index.
            </p>
            <ul className="space-y-4">
              {RECOMMENDED.map((r) => (
                <li
                  key={r.initials}
                  className="flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-surface-card border border-border-hairline flex items-center justify-center font-label-caps text-label-caps text-primary">
                      {r.initials}
                    </div>
                    <div>
                      <div className="font-body-md text-body-md font-semibold text-primary group-hover:text-link-endvr transition-colors">
                        {r.name}
                      </div>
                      <div className="font-caption text-caption text-text-caption">
                        {r.category}
                      </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-text-caption opacity-0 group-hover:opacity-100 transition-opacity">
                    add_circle
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Editorial Callout */}
          <div className="border border-border-hairline p-card-padding bg-surface-card relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-surface-container-low opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="font-headline-md text-headline-md text-primary mb-3 relative z-10">
              State of the Industry Report
            </h3>
            <p className="font-body-md text-body-md text-text-caption mb-4 relative z-10">
              Read our Q3 analysis on shipping minimums and their impact on
              independent retailers.
            </p>
            <a
              className="inline-flex items-center font-label-caps text-label-caps text-primary hover:text-link-endvr uppercase tracking-wider relative z-10"
              href="#"
            >
              Read Report{" "}
              <span className="material-symbols-outlined ml-1 text-[16px]">
                arrow_forward
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
