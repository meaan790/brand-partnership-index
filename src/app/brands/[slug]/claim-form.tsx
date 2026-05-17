"use client";

import { useState } from "react";

interface ClaimFormProps {
  brandName: string;
  domain: string;
}

export function ClaimForm({ brandName, domain }: ClaimFormProps) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="claim-form" className="mb-16 scroll-mt-24">
      <div className="bg-surface-card border border-border-hairline p-card-padding rounded">
        <span className="font-label-caps text-label-caps bg-primary text-on-primary px-3 py-1.5 rounded-full">
          CLAIM REQUEST
        </span>
        <h3 className="font-headline-md text-headline-md text-primary mt-3">
          Claim {brandName}&rsquo;s Brand
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-2xl">
          Verify that you represent {brandName} and start managing this brand.
          We&rsquo;ll cross-check your work email against the brand&rsquo;s
          domain and confirm via a secondary contact at the company.
        </p>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-gutter mt-6 max-w-3xl"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <label className="flex flex-col gap-1">
            <span className="font-label-caps text-label-caps text-text-caption">
              YOUR NAME
            </span>
            <input
              type="text"
              required
              className="border border-border-hairline rounded px-3 py-2 font-body-md focus:outline-none focus:border-primary"
              placeholder="Jamie Singh"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-label-caps text-label-caps text-text-caption">
              ROLE
            </span>
            <input
              type="text"
              required
              className="border border-border-hairline rounded px-3 py-2 font-body-md focus:outline-none focus:border-primary"
              placeholder="VP, Wholesale"
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="font-label-caps text-label-caps text-text-caption">
              WORK EMAIL (must match @{domain})
            </span>
            <input
              type="email"
              required
              className="border border-border-hairline rounded px-3 py-2 font-body-md focus:outline-none focus:border-primary"
              placeholder={`jamie@${domain}`}
            />
          </label>
          <div className="md:col-span-2 flex items-center gap-3 mt-2">
            <button
              type="submit"
              className="bg-primary text-on-primary font-data-tabular text-data-tabular px-6 py-3 rounded hover:bg-primary/90 transition-colors"
            >
              Submit claim request
            </button>
            {submitted && (
              <span className="font-caption text-caption text-score-high inline-flex items-center gap-1">
                <span
                  className="material-symbols-outlined text-[16px]"
                  data-weight="fill"
                >
                  check_circle
                </span>
                Request received. We&rsquo;ll be in touch within 2 business
                days.
              </span>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
