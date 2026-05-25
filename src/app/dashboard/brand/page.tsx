"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DIMENSIONS, DIMENSION_ICONS } from "@/lib/constants";
import { tierClass20, tierTextClass } from "@/lib/scoring";
import { createClient } from "@/lib/supabase/client";

interface BrandData {
  id: string;
  name: string;
  slug: string;
  domain: string;
  score: number;
  dims: number[];
  review_count: number;
}

interface ReviewRow {
  id: string;
  status: string;
  created_at: string;
  country: string | null;
  store_city: string | null;
  pros: string | null;
  cons: string | null;
  total_score: number;
}

interface Commitment {
  id: string;
  text: string;
  active: boolean;
}

interface BrandSearchResult {
  id: string;
  name: string;
  domain: string;
  slug: string;
}

export default function BrandDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState<BrandData | null>(null);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [newCommitment, setNewCommitment] = useState("");

  // Claim flow state
  const [claimQuery, setClaimQuery] = useState("");
  const [claimResults, setClaimResults] = useState<BrandSearchResult[]>([]);
  const [claimSearching, setClaimSearching] = useState(false);
  const [claimSearchDone, setClaimSearchDone] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const loadDashboard = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/"); return; }

    // Find the brand claimed by this user
    const { data: claimedBrand } = await supabase
      .from("brands")
      .select("id, name, slug, domain")
      .eq("claimed_by", user.id)
      .single();

    if (!claimedBrand) {
      setLoading(false);
      return;
    }

    // Get scores from the view
    const { data: scoreData } = await supabase
      .from("brand_scores_v")
      .select("*")
      .eq("id", claimedBrand.id)
      .single();

    const brandData: BrandData = {
      id: claimedBrand.id,
      name: claimedBrand.name,
      slug: claimedBrand.slug,
      domain: claimedBrand.domain,
      score: scoreData?.score || 0,
      dims: scoreData?.dims || [],
      review_count: scoreData?.review_count || 0,
    };
    setBrand(brandData);

    // Fetch reviews for this brand
    const { data: rawReviews } = await supabase
      .from("reviews")
      .select(`
        id, status, created_at, country, store_city,
        review_scores(dimension_key, score),
        review_comments(dimension_key, comment_text)
      `)
      .eq("brand_id", claimedBrand.id)
      .in("status", ["submitted", "published"])
      .order("created_at", { ascending: false })
      .limit(20);

    const parsedReviews: ReviewRow[] = (rawReviews || []).map((r: any) => {
      const total = (r.review_scores || []).reduce((sum: number, s: any) => sum + s.score * 4, 0);
      const prosComment = (r.review_comments || []).find((c: any) => c.dimension_key === "_pros");
      const consComment = (r.review_comments || []).find((c: any) => c.dimension_key === "_cons");
      return {
        id: r.id,
        status: r.status,
        created_at: r.created_at,
        country: r.country,
        store_city: r.store_city,
        pros: prosComment?.comment_text || null,
        cons: consComment?.comment_text || null,
        total_score: total,
      };
    });
    setReviews(parsedReviews);

    // Fetch commitments
    const res = await fetch(`/api/brands/commitments?brand_id=${claimedBrand.id}`);
    if (res.ok) setCommitments(await res.json());

    setLoading(false);
  }, [router]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  // Claim flow search
  function handleClaimSearch(q: string) {
    setClaimQuery(q);
    setClaimSearchDone(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) { setClaimResults([]); setClaimSearching(false); return; }
    setClaimSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/brands?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          setClaimResults((data || []).slice(0, 8));
        } else {
          setClaimResults([]);
        }
      } catch {
        setClaimResults([]);
      }
      setClaimSearching(false);
      setClaimSearchDone(true);
    }, 250);
  }

  async function handleClaim(brandId: string) {
    setClaiming(true);
    const res = await fetch("/api/brands/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand_id: brandId }),
    });
    if (res.ok) {
      await loadDashboard();
    }
    setClaiming(false);
  }

  // Commitment CRUD
  async function addCommitment() {
    if (!newCommitment.trim()) return;
    const res = await fetch("/api/brands/commitments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newCommitment }),
    });
    if (res.ok) {
      const c = await res.json();
      setCommitments((prev) => [...prev, c]);
      setNewCommitment("");
    }
  }

  async function toggleCommitment(id: string, active: boolean) {
    await fetch("/api/brands/commitments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    setCommitments((prev) => prev.map((c) => c.id === id ? { ...c, active } : c));
  }

  async function deleteCommitment(id: string) {
    await fetch(`/api/brands/commitments?id=${id}`, { method: "DELETE" });
    setCommitments((prev) => prev.filter((c) => c.id !== id));
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // No claimed brand — show claim flow
  if (!brand) {
    return (
      <div className="w-full max-w-[720px] mx-auto px-margin-mobile md:px-margin-desktop py-16">
        <div className="text-center mb-10">
          <span className="material-symbols-outlined text-accent mb-4" style={{ fontSize: 48, fontVariationSettings: "'FILL' 1" }}>corporate_fare</span>
          <h1 className="font-display-lg text-display-lg text-primary mb-3">Claim your brand</h1>
          <p className="font-body-md text-body-md text-text-caption max-w-md mx-auto">
            Search for your brand below to claim it. You&apos;ll be able to see your scores, read retailer feedback, and manage public commitments.
          </p>
        </div>

        <div className="relative max-w-md mx-auto">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-caption text-xl">search</span>
          <input type="text" value={claimQuery} onChange={(e) => handleClaimSearch(e.target.value)}
            placeholder="Search for your brand…" autoFocus
            className="w-full rounded-xl pl-12 pr-10 py-4 font-body-md text-body-md text-text-main placeholder:text-text-caption bg-surface-card border border-border-hairline focus:ring-2 focus:ring-accent focus:outline-none" />
          {claimSearching && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-caption animate-spin text-lg">progress_activity</span>
          )}

          {claimResults.length > 0 && (
            <div className="absolute z-20 top-full mt-1 w-full bg-white border border-border-hairline rounded-xl shadow-xl max-h-80 overflow-y-auto">
              {claimResults.map((b) => (
                <button key={b.id} onClick={() => handleClaim(b.id)} disabled={claiming}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors cursor-pointer text-left border-b border-border-hairline last:border-b-0 disabled:opacity-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://www.google.com/s2/favicons?domain=${b.domain}&sz=128`} alt="" className="w-8 h-8 rounded object-contain bg-white"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-body-md text-body-md text-on-background truncate">{b.name}</p>
                    <p className="font-caption text-caption text-text-caption truncate">{b.domain}</p>
                  </div>
                  <span className="font-caption text-caption text-primary">Claim</span>
                </button>
              ))}
            </div>
          )}

          {claimSearchDone && claimResults.length === 0 && claimQuery.trim().length >= 2 && !claimSearching && (
            <div className="absolute z-20 top-full mt-1 w-full bg-white border border-border-hairline rounded-xl shadow-xl px-4 py-6 text-center">
              <span className="material-symbols-outlined text-text-caption mb-2" style={{ fontSize: 32 }}>search_off</span>
              <p className="font-body-md text-body-md text-text-caption">No brands found matching &ldquo;{claimQuery.trim()}&rdquo;</p>
              <p className="font-caption text-caption text-text-caption mt-1">Try a different search, or contact us to add your brand.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Claimed brand — real dashboard
  return (
    <div className="w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
      {/* Header */}
      <header className="mb-section-gap flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=128`} alt="" className="w-14 h-14 rounded-xl object-contain bg-white shadow-sm"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <div>
            <h1 className="font-display-lg text-display-lg text-primary">{brand.name}</h1>
            <p className="font-body-md text-body-md text-text-caption">{brand.domain}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/brands/${brand.slug}`}
            className="border border-border-hairline text-primary font-semibold px-5 py-2.5 rounded-full hover:bg-surface-container-low transition-colors text-sm">
            View Public Profile
          </Link>
          <Link href="/dashboard/profile"
            className="border border-border-hairline text-primary font-semibold px-5 py-2.5 rounded-full hover:bg-surface-container-low transition-colors text-sm">
            Edit Profile
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Main */}
        <div className="lg:col-span-8 space-y-section-gap">
          {/* Score overview */}
          <section className="bg-surface-card border border-border-hairline p-card-padding">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline-md text-headline-md text-primary">Partnership Score</h2>
              <div className="text-right">
                <span className={`font-display-lg text-display-lg ${tierTextClass(brand.score)}`}>{brand.score}</span>
                <span className="font-body-md text-body-md text-text-caption">/100</span>
              </div>
            </div>
            {brand.dims.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {DIMENSIONS.map((dim, i) => {
                  const dimScore = brand.dims[i] ?? 0;
                  return (
                    <div key={dim.key} className="text-center">
                      <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center mx-auto mb-2">
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>
                          {DIMENSION_ICONS[dim.key]}
                        </span>
                      </div>
                      <span className={`${tierClass20(dimScore)} px-2 py-0.5 rounded font-data-tabular text-data-tabular text-xs`}>
                        {dimScore}/20
                      </span>
                      <p className="font-caption text-caption text-text-caption mt-1">{dim.short}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="font-body-md text-body-md text-text-caption text-center py-4">
                No reviews yet. Your scores will appear here once retailers review your brand.
              </p>
            )}
            <p className="font-caption text-caption text-text-caption mt-4 text-center">
              Based on {brand.review_count} {brand.review_count === 1 ? "review" : "reviews"}
            </p>
          </section>

          {/* Recent reviews */}
          <section>
            <h2 className="font-headline-md text-headline-md text-primary mb-4 pb-4 border-b border-border-hairline">
              Retailer Feedback
              {reviews.length > 0 && <span className="font-caption text-caption text-text-caption ml-2">({reviews.length})</span>}
            </h2>
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-text-caption mb-3" style={{ fontSize: 48 }}>reviews</span>
                <p className="font-body-md text-body-md text-text-caption">No reviews yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-surface-card border border-border-hairline p-5 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-caption text-caption text-text-caption">{formatDate(r.created_at)}</span>
                        {r.country && (
                          <span className="font-label-caps text-[10px] bg-surface-container-low text-text-caption px-2 py-0.5 rounded-full">{r.country}</span>
                        )}
                        {r.store_city && (
                          <span className="font-caption text-caption text-text-caption">{r.store_city}</span>
                        )}
                      </div>
                      <span className={`font-data-tabular text-data-tabular text-sm ${r.total_score >= 70 ? "text-score-high" : r.total_score >= 40 ? "text-score-mid" : "text-score-low"}`}>
                        {r.total_score}/100
                      </span>
                    </div>
                    {r.pros && (
                      <div className="mb-2">
                        <span className="font-caption text-caption font-semibold text-score-high">What we do well:</span>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">{r.pros}</p>
                      </div>
                    )}
                    {r.cons && (
                      <div>
                        <span className="font-caption text-caption font-semibold text-score-low">What to improve:</span>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">{r.cons}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-gutter mt-12 lg:mt-0">
          {/* Commitments */}
          <div className="bg-surface-card border border-border-hairline p-card-padding">
            <h3 className="font-label-caps text-label-caps text-text-caption uppercase mb-4 tracking-widest border-b border-border-hairline pb-4">
              Public Commitments
            </h3>
            <p className="font-caption text-caption text-text-caption mb-4">
              Show retailers what you&apos;re working on. These appear on your public profile.
            </p>
            <ul className="space-y-2 mb-4">
              {commitments.map((c) => (
                <li key={c.id} className="flex items-center gap-2 group">
                  <button onClick={() => toggleCommitment(c.id, !c.active)}
                    className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${c.active ? "bg-accent border-accent text-white" : "border-border-hairline"}`}>
                    {c.active && <span className="material-symbols-outlined text-xs">check</span>}
                  </button>
                  <span className={`font-body-md text-body-md flex-1 ${c.active ? "text-on-background" : "text-text-caption line-through"}`}>
                    {c.text}
                  </span>
                  <button onClick={() => deleteCommitment(c.id)}
                    className="opacity-0 group-hover:opacity-100 text-text-caption hover:text-error transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input type="text" value={newCommitment} onChange={(e) => setNewCommitment(e.target.value)}
                placeholder="Add a commitment…"
                onKeyDown={(e) => { if (e.key === "Enter") addCommitment(); }}
                className="flex-1 rounded-lg px-3 py-2 font-body-md text-body-md text-text-main bg-surface-container-low border border-border-hairline focus:ring-2 focus:ring-accent focus:outline-none text-sm" />
              <button onClick={addCommitment} disabled={!newCommitment.trim()}
                className="bg-primary text-on-primary px-3 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-30 text-sm">
                Add
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
