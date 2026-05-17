"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DIMENSIONS, DIMENSION_SUBS, DIMENSION_ICONS } from "@/lib/constants";
import { StarRating } from "@/components/StarRating";
import { BrandLogo } from "@/components/BrandLogo";
import type { User } from "@supabase/supabase-js";

interface BrandfetchResult {
  name: string;
  domain: string;
}

type Scores = Record<string, Record<string, number>>;
type SubComments = Record<string, Record<string, string>>;

const DIM_START = 2;

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function dimTotal(scores: Scores, key: string) {
  const subs = scores[key];
  return subs ? Object.values(subs).reduce((s, v) => s + (v || 0), 0) : 0;
}

function overallTotal(scores: Scores) {
  return DIMENSIONS.reduce((s, d) => s + dimTotal(scores, d.key), 0);
}

function tierBadge(score: number, max: number) {
  const pct = score / max;
  if (score === 0) return "bg-surface-container text-text-caption";
  if (pct >= 0.75) return "bg-score-high text-white";
  if (pct >= 0.5) return "bg-score-mid text-gray-900";
  return "bg-score-low text-white";
}

export default function ReviewPage() {
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createClient();
    return supabaseRef.current;
  }
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [anim, setAnim] = useState("");
  const [saving, setSaving] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BrandfetchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [brand, setBrand] = useState<{ name: string; domain: string } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [scores, setScores] = useState<Scores>({});
  const [subComments, setSubComments] = useState<SubComments>({});
  const [dimComments, setDimComments] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [reviewId, setReviewId] = useState<string | null>(null);
  const reviewIdRef = useRef<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthLoading(false);
      if (data.user) setStep(1);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setResults([]);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const go = (target: number, dir: "fwd" | "bwd") => {
    setAnim(dir === "fwd" ? "step-exit-fwd" : "step-exit-bwd");
    setTimeout(() => {
      setStep(target);
      setAnim(dir === "fwd" ? "step-enter-fwd" : "step-enter-bwd");
    }, 200);
  };

  const search = useCallback((q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setResults([]); setSearching(false); return; }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.brandfetch.io/v2/search/${encodeURIComponent(q)}?c=${process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID}`
        );
        if (res.ok) setResults((await res.json()).slice(0, 8));
      } catch { /* noop */ }
      finally { setSearching(false); }
    }, 250);
  }, []);

  const pickBrand = (b: BrandfetchResult) => {
    if (brand?.domain !== b.domain) {
      setScores({});
      setSubComments({});
      setDimComments({});
      setExpanded(new Set());
      setReviewId(null);
      reviewIdRef.current = null;
    }
    setBrand({ name: b.name, domain: b.domain });
    setResults([]);
    setQuery(b.name);
    go(2, "fwd");
  };

  const rate = (dimKey: string, subKey: string, v: number) =>
    setScores(prev => ({ ...prev, [dimKey]: { ...prev[dimKey], [subKey]: v } }));

  const commentSub = (dimKey: string, subKey: string, v: string) =>
    setSubComments(prev => ({ ...prev, [dimKey]: { ...prev[dimKey], [subKey]: v } }));

  const toggleExpand = (key: string) =>
    setExpanded(prev => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });

  const allRated = (dimKey: string) =>
    DIMENSION_SUBS[dimKey].every(s => (scores[dimKey]?.[s.key] || 0) > 0);

  const saveDraft = async (dimKey: string) => {
    if (!user || !brand) return;
    let rid = reviewIdRef.current;

    try {
      if (!rid) {
        let { data: row } = await getSupabase()
          .from("brands").select("id").eq("domain", brand.domain).maybeSingle();
        if (!row) {
          const { data: created } = await getSupabase()
            .from("brands")
            .insert({ name: brand.name, domain: brand.domain, slug: slugify(brand.name) })
            .select("id").single();
          row = created;
        }
        if (!row) return;

        const { data: review } = await getSupabase()
          .from("reviews")
          .insert({ reviewer_id: user.id, brand_id: row.id, status: "draft" })
          .select("id").single();
        if (!review) return;
        rid = review.id;
        reviewIdRef.current = rid;
        setReviewId(rid);
      }

      const entries = Object.entries(scores[dimKey] || {}).filter(([, v]) => v > 0);
      if (entries.length) {
        await getSupabase().from("review_scores").upsert(
          entries.map(([subKey, score]) => ({
            review_id: rid!,
            dimension_key: dimKey,
            sub_component_key: subKey,
            score,
            comment: subComments[dimKey]?.[subKey] || null,
          })),
          { onConflict: "review_id,dimension_key,sub_component_key" }
        );
      }

      if (dimComments[dimKey]?.trim()) {
        await getSupabase().from("review_comments").upsert(
          { review_id: rid!, dimension_key: dimKey, comment_text: dimComments[dimKey] },
          { onConflict: "review_id,dimension_key" }
        );
      }
    } catch { /* best-effort draft save */ }
  };

  const nextDim = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await saveDraft(DIMENSIONS[step - DIM_START].key);
      go(step + 1, "fwd");
    } finally { setSaving(false); }
  };

  const submit = async () => {
    const rid = reviewIdRef.current;
    if (!rid) return;
    setSubmitting(true);

    try {
      const allRows = DIMENSIONS.flatMap(d =>
        Object.entries(scores[d.key] || {})
          .filter(([, v]) => v > 0)
          .map(([subKey, score]) => ({
            review_id: rid,
            dimension_key: d.key,
            sub_component_key: subKey,
            score,
            comment: subComments[d.key]?.[subKey] || null,
          }))
      );
      if (allRows.length) {
        await getSupabase().from("review_scores")
          .upsert(allRows, { onConflict: "review_id,dimension_key,sub_component_key" });
      }

      const cRows = DIMENSIONS
        .filter(d => dimComments[d.key]?.trim())
        .map(d => ({ review_id: rid, dimension_key: d.key, comment_text: dimComments[d.key] }));
      if (cRows.length) {
        await getSupabase().from("review_comments")
          .upsert(cRows, { onConflict: "review_id,dimension_key" });
      }

      await getSupabase().from("reviews").update({ status: "submitted" }).eq("id", rid);
      go(8, "fwd");
    } catch { /* noop */ }
    finally { setSubmitting(false); }
  };

  const reset = () => {
    setBrand(null);
    setQuery("");
    setScores({});
    setSubComments({});
    setDimComments({});
    setExpanded(new Set());
    setReviewId(null);
    reviewIdRef.current = null;
    setStep(1);
  };

  const total = overallTotal(scores);
  const scored = DIMENSIONS.some(d => Object.values(scores[d.key] || {}).some(v => v > 0));
  const isDim = step >= DIM_START && step <= 6;
  const dimIdx = isDim ? step - DIM_START : -1;
  const dim = isDim ? DIMENSIONS[dimIdx] : null;
  const showHeader = !!brand && step >= DIM_START && step <= 7;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-surface-card rounded-2xl border border-border-hairline shadow-sm overflow-hidden">

        {showHeader && (
          <div className="flex items-center justify-between px-8 pt-6 pb-2">
            <div className="flex items-center gap-3">
              <BrandLogo name={brand!.name} domain={brand!.domain} size="w-8 h-8" />
              <span className="font-semibold text-text-main">{brand!.name}</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-bold tabular-nums ${
              scored ? tierBadge(total, 100) : "bg-surface-container text-text-caption"
            }`}>
              {scored ? total : "\u2014"} / 100
            </div>
          </div>
        )}

        {isDim && (
          <div className="px-8 pt-3 pb-1">
            <div className="flex items-center justify-between text-xs text-text-caption mb-1.5">
              <span>{dim!.name}</span>
              <span>{dimIdx + 1} of {DIMENSIONS.length}</span>
            </div>
            <div className="flex gap-1">
              {DIMENSIONS.map((d, i) => (
                <div key={d.key} className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= dimIdx ? "bg-accent" : "bg-surface-container"
                }`} />
              ))}
            </div>
          </div>
        )}

        <div className={`p-8 ${anim}`}>

          {step === 0 && (
            <div className="text-center py-8">
              {authLoading ? (
                <div className="flex items-center justify-center gap-2 text-text-caption">
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Checking sign-in status&hellip;
                </div>
              ) : !user ? (
                <>
                  <span className="material-symbols-outlined text-5xl text-accent mb-4 block">lock</span>
                  <h2 className="text-xl font-bold text-text-main mb-2">Sign in to review</h2>
                  <p className="text-text-caption mb-6">
                    You need to be signed in with your work email to submit a review.
                  </p>
                  <Link
                    href="/signin?redirect=/review"
                    className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Sign in
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </Link>
                </>
              ) : null}
            </div>
          )}

          {step === 1 && (
            <div className="py-4">
              <h2 className="text-xl font-bold text-text-main mb-1">Which brand are you reviewing?</h2>
              <p className="text-text-caption mb-6">Search for the brand you&apos;d like to rate.</p>

              <div ref={dropdownRef} className="relative">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-caption">
                    search
                  </span>
                  <input
                    type="text"
                    value={query}
                    onChange={e => search(e.target.value)}
                    placeholder="e.g. Patagonia, Arc'teryx, Salomon…"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border-hairline bg-white text-text-main placeholder:text-text-caption/60 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition"
                    autoFocus
                  />
                  {searching && (
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-caption animate-spin text-lg">
                      progress_activity
                    </span>
                  )}
                </div>

                {results.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-surface-card border border-border-hairline rounded-lg shadow-lg overflow-hidden">
                    {results.map(r => (
                      <button
                        key={r.domain}
                        type="button"
                        onClick={() => pickBrand(r)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors text-left"
                      >
                        <BrandLogo name={r.name} domain={r.domain} size="w-8 h-8" />
                        <div>
                          <div className="font-medium text-text-main">{r.name}</div>
                          <div className="text-xs text-text-caption">{r.domain}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {query.trim() && !searching && results.length === 0 && (
                <p className="mt-3 text-sm text-text-caption text-center">No brands found. Try a different search.</p>
              )}

              {brand && results.length === 0 && (
                <div className="mt-6 flex items-center justify-between p-4 bg-accent-muted rounded-xl">
                  <div className="flex items-center gap-3">
                    <BrandLogo name={brand.name} domain={brand.domain} size="w-8 h-8" />
                    <div>
                      <div className="font-medium text-text-main">{brand.name}</div>
                      <div className="text-xs text-text-caption">{brand.domain}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => go(2, "fwd")}
                    className="flex items-center gap-1 bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Continue
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {isDim && dim && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-3xl text-accent">
                  {DIMENSION_ICONS[dim.key]}
                </span>
                <h2 className="text-xl font-bold text-text-main">{dim.name}</h2>
              </div>
              <p className="text-text-caption mb-6">Rate each aspect of {dim.blurb}.</p>

              <div className="space-y-5">
                {DIMENSION_SUBS[dim.key].map(sub => {
                  const ek = `${dim.key}-${sub.key}`;
                  return (
                    <div key={sub.key} className="border border-border-hairline rounded-xl p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-text-main mb-0.5">{sub.label}</h3>
                          <p className="text-sm text-text-caption">{sub.desc}</p>
                        </div>
                        <StarRating
                          value={scores[dim.key]?.[sub.key] || 0}
                          onChange={v => rate(dim.key, sub.key, v)}
                          anchor5={sub.anchor5}
                          anchor1={sub.anchor1}
                        />
                      </div>

                      <div className="mt-3">
                        {expanded.has(ek) ? (
                          <>
                            <textarea
                              value={subComments[dim.key]?.[sub.key] || ""}
                              onChange={e => commentSub(dim.key, sub.key, e.target.value)}
                              placeholder={sub.prompt}
                              rows={2}
                              className="w-full px-3 py-2 rounded-lg border border-border-hairline bg-white text-sm text-text-main placeholder:text-text-caption/50 focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none transition"
                            />
                            <button
                              type="button"
                              onClick={() => toggleExpand(ek)}
                              className="text-xs text-text-caption hover:text-text-main mt-1 transition-colors"
                            >
                              Collapse
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleExpand(ek)}
                            className="text-xs text-text-caption hover:text-accent transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">add_comment</span>
                            Add a note
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-text-main mb-1.5">
                  Overall thoughts on {dim.name}
                  <span className="text-text-caption font-normal ml-1">(optional)</span>
                </label>
                <textarea
                  value={dimComments[dim.key] || ""}
                  onChange={e => setDimComments(p => ({ ...p, [dim.key]: e.target.value }))}
                  placeholder={`Any additional thoughts on how this brand handles ${dim.blurb}\u2026`}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border-hairline bg-white text-sm text-text-main placeholder:text-text-caption/50 focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none transition"
                />
              </div>
            </div>
          )}

          {step === 7 && (
            <div>
              <h2 className="text-xl font-bold text-text-main mb-1">Review Summary</h2>
              <p className="text-text-caption mb-6">Confirm your ratings before submitting.</p>

              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-hairline">
                      <th className="text-left py-2 px-2 font-medium text-text-caption">Dimension</th>
                      {DIMENSION_SUBS[DIMENSIONS[0].key].map((_, i) => (
                        <th key={i} className="text-center py-2 px-1 font-medium text-text-caption w-10">
                          S{i + 1}
                        </th>
                      ))}
                      <th className="text-center py-2 px-2 font-medium text-text-caption">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DIMENSIONS.map(d => {
                      const dt = dimTotal(scores, d.key);
                      return (
                        <tr key={d.key} className="border-b border-border-hairline/50">
                          <td className="py-2.5 px-2 font-medium text-text-main">{d.short}</td>
                          {DIMENSION_SUBS[d.key].map(s => (
                            <td key={s.key} className="text-center py-2.5 px-1 tabular-nums text-text-main">
                              {scores[d.key]?.[s.key] || "\u2014"}
                            </td>
                          ))}
                          <td className="text-center py-2.5 px-2">
                            <span className={`inline-flex items-center justify-center w-10 h-6 rounded text-xs font-bold ${tierBadge(dt, 20)}`}>
                              {dt}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                <span className="font-semibold text-text-main">Overall Score</span>
                <span className={`px-4 py-1.5 rounded-full text-lg font-bold ${tierBadge(total, 100)}`}>
                  {total} / 100
                </span>
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-5xl text-score-high mb-4 block">check_circle</span>
              <h2 className="text-xl font-bold text-text-main mb-2">Review Submitted!</h2>
              <p className="text-text-caption mb-8">
                Thanks for rating <strong>{brand?.name}</strong>. Your review helps build a more transparent industry.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined text-lg">rate_review</span>
                  Review Another Brand
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 border border-border-hairline px-6 py-2.5 rounded-lg font-medium text-text-main hover:bg-surface-container-low transition-colors"
                >
                  View Leaderboard
                </Link>
              </div>
            </div>
          )}
        </div>

        {(isDim || step === 7) && (
          <div className="flex items-center justify-between px-8 pb-6">
            <button
              type="button"
              onClick={() => go(step - 1, "bwd")}
              className="flex items-center gap-1 text-text-caption hover:text-text-main transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back
            </button>
            {isDim ? (
              <button
                type="button"
                onClick={nextDim}
                disabled={!allRated(dim!.key) || saving}
                className="flex items-center gap-1 bg-primary text-on-primary px-5 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    Saving&hellip;
                  </>
                ) : (
                  <>
                    Next
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="flex items-center gap-2 bg-accent text-on-accent px-6 py-2.5 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    Submitting&hellip;
                  </>
                ) : (
                  <>
                    Submit Review
                    <span className="material-symbols-outlined text-lg">send</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
