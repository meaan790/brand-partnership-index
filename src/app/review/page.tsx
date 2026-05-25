"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { DIMENSIONS, DIMENSION_ICONS } from "@/lib/constants";
import { SEED_BRANDS } from "@/lib/seed-data";
import { tierClass20, tierTextClass, strokeColor } from "@/lib/scoring";
import { createClient } from "@/lib/supabase/client";
import { useSignInModal } from "@/components/SignInModalProvider";

const DIM_ANCHORS: Record<string, { low: string; high: string }> = {
  website: { low: "Aggressive DTC behavior", high: "Retailer-friendly DTC site" },
  pricing: { low: "MAP not enforced", high: "Strict pricing discipline" },
  local:   { low: "No demand routing", high: "Active local support" },
  floor:   { low: "No store investment", high: "Strong floor support" },
  pro:     { low: "Undisciplined pro deals", high: "Controlled pro program" },
};

const DIM_HINTS: Record<string, string> = {
  website: "Sale sections, Discount popups, Flash sale cadence, DTC cashback",
  pricing: "Reseller policing, Retailer compliance, MAP response time, Price stability",
  local: "Local stock visibility, Store finder, Dealer accuracy, Cashback routing",
  floor: "Co-op marketing, Mobile incentives, In-store clinics, Rep support",
  pro: "Pro eligibility, Purchase caps, Insider controls, Discount depth",
};

interface BrandResult {
  name: string;
  domain: string;
  icon?: string;
  inIndex: boolean;
}

type DimScores = Record<string, number>;

/* ── Star rating row with anchor labels ── */
function StarRow({ value, onChange, dimKey }: { value: number; onChange: (v: number) => void; dimKey: string }) {
  const [hover, setHover] = useState(0);
  const anchors = DIM_ANCHORS[dimKey];
  return (
    <div>
      <div className="flex items-center" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" onClick={() => onChange(i)} onMouseEnter={() => setHover(i)}
            className="flex-1 flex items-center justify-center py-1 transition-colors focus:outline-none cursor-pointer">
            <span className={`material-symbols-outlined ${i <= (hover || value) ? "star-filled text-accent" : "text-[#94A3B8] hover:text-accent/50"}`}
              style={{ fontSize: 36, fontVariationSettings: "'FILL' 1" }}>star</span>
          </button>
        ))}
      </div>
      {anchors && (
        <div className="flex mt-0.5">
          <div className="flex-1 flex flex-col items-center text-center">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-score-low/10 text-score-low font-bold text-xs">1</span>
            <span className="text-xs text-score-low leading-tight">{anchors.low}</span>
          </div>
          <div className="flex-1" />
          <div className="flex-1" />
          <div className="flex-1" />
          <div className="flex-1 flex flex-col items-center text-center">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-score-high/10 text-score-high font-bold text-xs">5</span>
            <span className="text-xs text-score-high leading-tight">{anchors.high}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Animated score circle for confirmation ── */
function ScoreCircle({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? score / max : 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const color = strokeColor(score);
  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-container-low" />
        <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display-lg text-display-lg text-primary leading-none">{score}</span>
        <span className="font-caption text-caption text-text-caption">/ {max}</span>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  const { open: openSignIn } = useSignInModal();

  const [brand, setBrand] = useState<{ name: string; domain: string } | null>(null);
  const [brandQuery, setBrandQuery] = useState("");
  const [brandResults, setBrandResults] = useState<BrandResult[]>([]);
  const [brandSearching, setBrandSearching] = useState(false);
  const brandDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const bfCacheRef = useRef(new Map<string, any[]>());
  const brandDropdownRef = useRef<HTMLDivElement>(null);

  const [scores, setScores] = useState<DimScores>({});
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showRatings, setShowRatings] = useState(false);
  const draftRestoredRef = useRef(false);

  // Restore draft from sessionStorage on mount
  useEffect(() => {
    if (draftRestoredRef.current) return;
    draftRestoredRef.current = true;
    try {
      const raw = sessionStorage.getItem("bpi_review_draft");
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft.brand) setBrand(draft.brand);
      if (draft.brandQuery) setBrandQuery(draft.brandQuery);
      if (draft.scores) setScores(draft.scores);
      if (draft.pros) setPros(draft.pros);
      if (draft.cons) setCons(draft.cons);
      if (draft.autoSubmit) pendingSubmitRef.current = true;
      sessionStorage.removeItem("bpi_review_draft");
    } catch { /* ignore corrupt data */ }
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(e.target as Node))
        setBrandResults([]);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => () => { if (brandDebounceRef.current) clearTimeout(brandDebounceRef.current); }, []);

  useEffect(() => {
    if (brand && !showRatings) { const t = setTimeout(() => setShowRatings(true), 50); return () => clearTimeout(t); }
    if (!brand) setShowRatings(false);
  }, [brand, showRatings]);

  async function searchBrandsDb(query: string): Promise<BrandResult[]> {
    try {
      const res = await fetch(`/api/brands?q=${encodeURIComponent(query)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data || []).map((b: any) => ({
        name: b.name,
        domain: b.domain,
        icon: b.logo_url || `https://logo.clearbit.com/${b.domain}`,
        inIndex: true,
      }));
    } catch { return []; }
  }

  async function searchBrandfetchApi(query: string): Promise<any[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];
    const cacheKey = trimmed.toLowerCase();
    if (bfCacheRef.current.has(cacheKey)) return bfCacheRef.current.get(cacheKey)!;
    try {
      const clientId = process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID || "1idHCc0gXMFVaiisN8L";
      const res = await fetch(`https://api.brandfetch.io/v2/search/${encodeURIComponent(trimmed)}?c=${clientId}`);
      if (!res.ok) { bfCacheRef.current.set(cacheKey, []); return []; }
      const data = await res.json();
      const results = Array.isArray(data) ? data : [];
      bfCacheRef.current.set(cacheKey, results);
      return results;
    } catch { bfCacheRef.current.set(cacheKey, []); return []; }
  }

  function handleBrandSearch(q: string) {
    setBrandQuery(q);
    if (brandDebounceRef.current) clearTimeout(brandDebounceRef.current);
    if (!q.trim() || q.trim().length < 2) { setBrandResults([]); setBrandSearching(false); return; }
    setBrandSearching(true);
    brandDebounceRef.current = setTimeout(async () => {
      // Priority 1: search the brands database
      const dbMatches = await searchBrandsDb(q);
      const dbDomains = new Set(dbMatches.map((r) => r.domain));

      // Priority 2: Brandfetch for brands not yet in the index
      const remote = await searchBrandfetchApi(q);
      setBrandSearching(false);
      const remoteFiltered: BrandResult[] = remote
        .filter((r: any) => r?.domain && !dbDomains.has(r.domain))
        .slice(0, 6)
        .map((r: any) => ({ name: r.name, domain: r.domain, icon: r.icon, inIndex: false }));

      // Priority 3: manual add option if no exact match
      const allResults = [...dbMatches, ...remoteFiltered];
      const trimmed = q.trim();
      const hasExactMatch = allResults.some((r) => r.name.toLowerCase() === trimmed.toLowerCase());
      if (!hasExactMatch && trimmed.length >= 2) {
        allResults.push({ name: trimmed, domain: "", inIndex: false });
      }

      setBrandResults(allResults);
    }, 250);
  }

  function selectBrand(b: BrandResult) { setBrand({ name: b.name, domain: b.domain }); setBrandQuery(b.name); setBrandResults([]); }
  function clearBrand() { setBrand(null); setBrandQuery(""); setScores({}); setPros(""); setCons(""); }
  function rateDimension(key: string, val: number) { setScores((prev) => ({ ...prev, [key]: val })); }

  const ratedCount = Object.values(scores).filter((v) => v > 0).length;
  const allRated = ratedCount === DIMENSIONS.length;
  const hasFeedback = pros.trim().length > 0 && cons.trim().length > 0;
  const canSubmit = allRated && hasFeedback;
  const progressPct = brand ? Math.round((ratedCount / DIMENSIONS.length) * 100) : 0;
  const totalScore = DIMENSIONS.reduce((sum, d) => sum + ((scores[d.key] || 0) * 4), 0);
  const isInIndex = brand ? SEED_BRANDS.some((b) => b.domain === brand.domain) : false;

  const doSubmit = useCallback(async () => {
    if (!brand || !allRated || !hasFeedback) return;
    setSubmitting(true); setSubmitError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand_name: brand.name, brand_domain: brand.domain, scores, pros: pros.trim() || null, cons: cons.trim() || null, status: "submitted" }),
      });
      if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data.error || "Failed to submit review"); }
      setSubmitted(true);
    } catch (err: any) { setSubmitError(err.message || "Something went wrong"); }
    finally { setSubmitting(false); }
  }, [brand, allRated, hasFeedback, scores, pros, cons]);

  const pendingSubmitRef = useRef(false);
  useEffect(() => {
    if (!pendingSubmitRef.current) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => { if (data.user) { pendingSubmitRef.current = false; doSubmit(); } });
  });

  function saveDraft(autoSubmit: boolean) {
    try {
      sessionStorage.setItem("bpi_review_draft", JSON.stringify({
        brand, brandQuery, scores, pros, cons, autoSubmit,
      }));
    } catch { /* storage full or unavailable */ }
  }

  async function handleSubmit() {
    if (!brand || !canSubmit) return;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) { doSubmit(); }
      else { saveDraft(true); pendingSubmitRef.current = true; openSignIn({ view: "signup", preselectedRole: "retailer" }); }
    } catch { saveDraft(true); pendingSubmitRef.current = true; openSignIn({ view: "signup", preselectedRole: "retailer" }); }
  }

  function autoGrow(e: React.ChangeEvent<HTMLTextAreaElement>) { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }

  /* ══════════════════════════════════════════════════
     CONFIRMATION SCREEN
     ══════════════════════════════════════════════════ */
  if (submitted) {
    const dimPills = DIMENSIONS.map((d) => ({ short: d.short, score: (scores[d.key] || 0) * 4 }));
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-margin-mobile md:px-margin-desktop py-16">
        <div className="text-center max-w-lg mx-auto">
          <ScoreCircle score={totalScore} max={100} />
          <h1 className="font-display-lg text-display-lg text-primary mt-6 mb-2">Review Submitted</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-1">
            Thank you for rating <strong className="text-primary">{brand?.name}</strong>.
          </p>
          <p className="font-body-md text-body-md text-text-caption mb-6">Your score: {totalScore}/100</p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {dimPills.map((p) => (
              <span key={p.short} className={`${tierClass20(p.score)} px-3 py-1 rounded font-data-tabular text-data-tabular`}>{p.short} {p.score}/20</span>
            ))}
          </div>
          <p className="font-caption text-caption text-text-caption max-w-xs mx-auto mb-8">
            Your review will be verified and published within 48 hours.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-sm mx-auto">
            <button onClick={() => { clearBrand(); setSubmitted(false); }}
              className="bg-primary text-on-primary font-semibold px-6 py-3.5 rounded-full hover:opacity-90 transition-opacity cursor-pointer">
              Review another brand
            </button>
            <a href="/" className="border border-border-hairline text-primary font-semibold px-6 py-3.5 rounded-full hover:bg-surface-container-low transition-colors text-center">
              Back to Leaderboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════
     MAIN FORM
     ══════════════════════════════════════════════════ */
  return (
    <>
      {/* ── Hero band with colored background ── */}
      <section className="bg-primary">
        <div className="max-w-[720px] mx-auto px-margin-mobile md:px-margin-desktop pt-12 pb-14 md:pt-16 md:pb-16 text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-accent text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>rate_review</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-primary mb-3">
            Review a Brand
          </h1>
          <p className="font-body-md text-body-md text-on-primary/70 max-w-md mx-auto mb-8">
            Rate how well a brand supports the wholesale channel. Five dimensions, under a minute.
          </p>

          {/* Search inside the hero */}
          {!brand && (
            <div className="max-w-md mx-auto relative" ref={brandDropdownRef}>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-caption text-xl">search</span>
                <input
                  type="text" value={brandQuery} onChange={(e) => handleBrandSearch(e.target.value)}
                  placeholder="Search for a brand…"
                  autoFocus
                  className="w-full rounded-xl pl-12 pr-10 py-4 font-body-md text-body-md text-text-main placeholder:text-text-caption bg-white shadow-lg border-0 focus:ring-2 focus:ring-accent focus:outline-none transition-shadow"
                />
                {brandSearching && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-caption animate-spin text-lg">progress_activity</span>
                )}
              </div>
              {brandResults.length > 0 && (
                <div className="absolute z-20 top-full mt-1 w-full bg-white border border-border-hairline rounded-xl shadow-xl max-h-80 overflow-y-auto">
                  {brandResults.map((b) => {
                    const isManualAdd = !b.domain;
                    return (
                    <button key={b.domain || `manual-${b.name}`} onClick={() => selectBrand(b)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors cursor-pointer text-left border-b border-border-hairline last:border-b-0">
                      {isManualAdd ? (
                        <span className="w-7 h-7 rounded bg-accent/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-accent text-sm">add</span>
                        </span>
                      ) : b.icon ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={b.icon} alt="" className="w-7 h-7 rounded object-contain bg-white" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <span className="w-7 h-7 rounded bg-surface-container-low flex items-center justify-center text-xs font-bold text-primary">{b.name[0]}</span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-body-md text-body-md text-on-background truncate">
                          {isManualAdd ? `Add "${b.name}" as a new brand` : b.name}
                        </p>
                        <p className="font-caption text-caption text-text-caption truncate">
                          {isManualAdd ? "Not in the index yet" : b.domain}
                        </p>
                      </div>
                      {b.inIndex && (
                        <span className="font-label-caps text-label-caps text-score-high bg-score-high/10 px-2 py-0.5 rounded-full text-[10px] shrink-0 flex items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>check_circle</span> In Index
                        </span>
                      )}
                    </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Selected brand — inside hero */}
          {brand && (
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://logo.clearbit.com/${brand.domain}`} alt=""
                  className="w-10 h-10 rounded-lg object-contain bg-white shadow-sm"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <div className="text-left">
                  <p className="font-headline-sm text-headline-sm text-on-primary">{brand.name}</p>
                  <p className="font-caption text-caption text-on-primary/60">{brand.domain}</p>
                </div>
                {isInIndex && (
                  <span className="font-label-caps text-label-caps text-accent bg-accent/20 px-2 py-0.5 rounded-full text-[10px] shrink-0 flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: 12 }}>check_circle</span> In Index
                  </span>
                )}
              </div>
              <button onClick={clearBrand} className="mt-2 font-caption text-caption text-on-primary/60 hover:text-on-primary transition-colors cursor-pointer underline">
                Change brand
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Before brand selected: show what to expect ── */}
      {!brand && (
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
          {/* What you'll rate */}
          <h2 className="font-headline-sm text-headline-sm text-primary text-center mb-6">
            Five partnership standards, five quick ratings
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-10">
            {DIMENSIONS.map((dim) => (
              <div key={dim.key} className="bg-surface-card border border-border-hairline rounded-xl p-4 flex flex-col">
                <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center shrink-0 mb-3">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>
                    {DIMENSION_ICONS[dim.key]}
                  </span>
                </div>
                <p className="font-data-tabular text-data-tabular text-primary mb-2 leading-snug">{dim.name}</p>
                <ul className="text-[11px] text-text-caption leading-relaxed space-y-0.5">
                  {DIM_HINTS[dim.key].split(", ").map((item) => (
                    <li key={item} className="flex items-start gap-1.5">
                      <span className="text-accent shrink-0 mt-px">&bull;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Trust signals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {[
              { icon: "schedule", label: "Under 1 minute", desc: "Rate 5 dimensions with simple star ratings" },
              { icon: "visibility_off", label: "Anonymous", desc: "Your identity is never shared with the brand" },
              { icon: "verified", label: "Verified retailers only", desc: "Only specialty retailers can submit reviews" },
            ].map((item) => (
              <div key={item.icon} className="flex items-start gap-3">
                <span className="material-symbols-outlined text-accent shrink-0 mt-0.5" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                <div>
                  <p className="font-body-md text-body-md font-semibold text-primary">{item.label}</p>
                  <p className="font-caption text-caption text-text-caption">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="text-center border-t border-border-hairline pt-8">
            <p className="font-data-tabular text-data-tabular text-text-caption mb-2">
              <span className="text-primary font-bold">312</span> verified reviews submitted &middot; <span className="text-primary font-bold">48</span> brands tracked
            </p>
            <p className="font-caption text-caption text-text-caption">
              Your feedback directly impacts how brands invest in the wholesale channel.
            </p>
          </div>
        </div>
      )}

      {/* ── Rating form (after brand selected) ── */}
      {brand && (
        <div className="max-w-[720px] mx-auto px-margin-mobile md:px-margin-desktop py-8">
          {/* Progress bar + running total */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-caption text-caption text-text-caption">{ratedCount} of {DIMENSIONS.length} rated</span>
              <div className="flex items-center gap-2">
                {ratedCount > 0 && (
                  <>
                    <span className={`font-data-tabular text-data-tabular ${tierTextClass(totalScore)}`}>{totalScore}</span>
                    <span className="font-caption text-caption text-text-caption">/ 100</span>
                  </>
                )}
                {!ratedCount && <span className="font-caption text-caption text-text-caption">{progressPct}%</span>}
              </div>
            </div>
            <div className="w-full h-[3px] bg-border-hairline rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all duration-300 ease-out" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* Dimension cards */}
          <div className={`transition-all duration-300 ease-out ${showRatings ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <section className="space-y-4 mb-8">
              {DIMENSIONS.map((dim) => {
                const raw = scores[dim.key] || 0;
                const scaled = raw * 4;
                const isRated = raw > 0;
                return (
                  <div key={dim.key}
                    className={`bg-surface-card border rounded-xl p-5 md:p-6 transition-all duration-200 hover:shadow-card-hover ${
                      isRated ? "border-l-[3px] border-l-accent border-t-border-hairline border-r-border-hairline border-b-border-hairline" : "border-border-hairline"
                    }`}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>
                          {DIMENSION_ICONS[dim.key]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-headline-sm text-headline-sm text-on-background">{dim.name}</h3>
                          {isRated && (
                            <span className={`${tierClass20(scaled)} px-2.5 py-0.5 rounded font-data-tabular text-data-tabular text-xs shrink-0`}>
                              {scaled}/20
                            </span>
                          )}
                        </div>
                        <p className="font-caption text-caption text-on-surface-variant mt-0.5">{DIM_HINTS[dim.key]}</p>
                      </div>
                    </div>
                    <StarRow value={raw} onChange={(v) => rateDimension(dim.key, v)} dimKey={dim.key} />
                  </div>
                );
              })}
            </section>

            {/* Qualitative feedback */}
            <section className="space-y-4 mb-8">
              <h2 className="font-headline-sm text-headline-sm text-on-background">
                Tell {brand.name} what matters
              </h2>
              <div>
                <label htmlFor="pros" className="flex items-center gap-2 font-body-md text-body-md text-on-background font-semibold mb-1.5">
                  <span className="material-symbols-outlined text-score-high" style={{ fontSize: 16 }}>thumb_up</span>
                  What does {brand.name} do well?
                </label>
                <textarea id="pros" value={pros} onChange={(e) => { setPros(e.target.value); autoGrow(e); }}
                  placeholder="e.g., Great MAP enforcement, reps visit regularly, strong co-op program…"
                  rows={3} className="w-full border border-border-hairline rounded-xl px-4 py-3 font-body-md text-body-md text-text-main placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent resize-none transition-colors" />
              </div>
              <div>
                <label htmlFor="cons" className="flex items-center gap-2 font-body-md text-body-md text-on-background font-semibold mb-1.5">
                  <span className="material-symbols-outlined text-score-low" style={{ fontSize: 16 }}>flag</span>
                  What should {brand.name} improve?
                </label>
                <textarea id="cons" value={cons} onChange={(e) => { setCons(e.target.value); autoGrow(e); }}
                  placeholder="e.g., DTC pricing undercuts retail, pro deals too loose, no store finder…"
                  rows={3} className="w-full border border-border-hairline rounded-xl px-4 py-3 font-body-md text-body-md text-text-main placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent resize-none transition-colors" />
              </div>
            </section>

            {/* Score summary banner */}
            {canSubmit && (
              <div className="text-center mb-6 py-5 bg-primary-container rounded-xl">
                <span className="font-label-caps text-label-caps text-on-primary-container uppercase">Overall Score</span>
                <div className="font-display-lg text-display-lg text-on-primary mt-1">{totalScore}<span className="text-on-primary-container">/100</span></div>
                <p className="font-caption text-caption text-on-primary-container mt-2">{brand.name}</p>
              </div>
            )}

            {/* Submit */}
            <section>
              {submitError && (
                <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-xl">
                  <p className="font-body-md text-body-md text-error">{submitError}</p>
                </div>
              )}
              <button onClick={handleSubmit} disabled={!canSubmit || submitting}
                className="w-full bg-primary text-on-primary font-semibold py-4 rounded-full hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                {submitting ? (
                  <><span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" /> Submitting…</>
                ) : canSubmit ? (
                  <>Submit Review <span className="material-symbols-outlined text-sm">send</span></>
                ) : !allRated ? (
                  `Rate all ${DIMENSIONS.length} dimensions to submit`
                ) : (
                  "Add your feedback above to submit"
                )}
              </button>
              <p className="font-caption text-caption text-text-caption text-center mt-3">
                Reviews are anonymous. Your company name is never shown publicly.
              </p>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
