"use client";

import { useState } from "react";

interface SelfReportTabsProps {
  dimensions: { name: string; short: string }[];
  statements: Record<string, string>;
}

export function SelfReportTabs({
  dimensions,
  statements,
}: SelfReportTabsProps) {
  const [active, setActive] = useState(dimensions[0].name);

  return (
    <div className="lg:col-span-8 bg-surface-card border border-border-hairline rounded flex flex-col">
      <div className="flex border-b border-border-hairline px-6 pt-4 overflow-x-auto hide-scrollbar">
        {dimensions.map((d) => (
          <button
            key={d.name}
            type="button"
            onClick={() => setActive(d.name)}
            className={`font-data-tabular text-data-tabular pb-3 px-4 whitespace-nowrap border-b-2 ${
              active === d.name
                ? "text-primary border-primary"
                : "text-text-caption border-transparent hover:text-primary"
            }`}
          >
            {d.short}
          </button>
        ))}
      </div>
      <div className="p-card-padding">
        <h4 className="font-label-caps text-label-caps text-text-caption mb-3 uppercase">
          Brand Statement
        </h4>
        <p className="font-body-lg text-body-lg text-on-surface">
          &ldquo;{statements[active]}&rdquo;
        </p>
        <div className="mt-6 flex items-center gap-2 text-caption font-caption text-text-caption">
          <span className="material-symbols-outlined text-[16px]">update</span>
          <span>Last updated: April 2026</span>
        </div>
      </div>
    </div>
  );
}
