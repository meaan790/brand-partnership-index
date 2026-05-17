"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { DIMENSIONS, DIMENSION_SUBS, DIMENSION_ICONS, PERSONAL_EMAIL_DOMAINS } from "@/lib/constants";
import { SEED_BRANDS } from "@/lib/seed-data";
import { BrandLogo } from "@/components/BrandLogo";
import { validateWorkEmail } from "@/lib/scoring";

const DIM_DESCRIPTIONS: Record<string, string> = {
  website: "How brand.com presents and behaves on its own digital surface.",
  pricing: "MAP enforcement and pricing discipline across the channel beyond brand.com.",
  local: "Brand actively routing customers to the retailers carrying it.",
  floor: "Brand investment in the people and the partnership that drive in-store sell-through.",
  pro: "Discipline on internal discount programs that affect retail customer flow.",
};

type BrandPick = { name: string; domain: string };
type Ratings = Record<string, Record<string, number>>;
type DimText = Record<string, { praise: string; improve: string }>;

function dimScore(ratings: Ratings, key: string) {
  const subs = ratings[key];
  return subs ? Object.values(subs).reduce((s, v) => s + v, 0) : 0;
}
function totalScore(ratings: Ratings) {
  return DIMENSIONS.reduce((s, d) => s + dimScore(ratings, d.key), 0);
}
function countRated(ratings: Ratings) {
  let n = 0;
  DIMENSIONS.forEach((d) => {
    DIMENSION_SUBS[d.key].forEach((sub) => {
      if ((ratings[d.key]?.[sub.key] || 0) > 0) n++;
    });
  });
  return n;
}
function tierColor20(s: number) {
  if (s >= 16) return "text-score-high";
  if (s >= 13) return "text-score-mid";
  return "text-score-low";
}

function StarRow({
  dimKey,
  subKey,
  current,
  anchor1,
  anchor5,
  onRate,
}: {
  dimKey: string;
  subKey: string;
  current: number;
  anchor1: string;
  anchor5: string;
  onRate: (v: number) => void;
}) {
  return (
    <div className="mt-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onRate(i)}
            className="flex-1 flex items-center justify-center transition-colors focus:outline-none py-1 cursor-pointer"
          >
            <span
              className={`material-symbols-outlined ${i <= current ? "star-filled text-accent" : "text-[#94A3B8] hover:text-accent/50"}`}
              style={{ fontSize: 36 }}
            >
              star
            </span>
          </button>
        ))}
      </div>
      <div className="flex mt-0.5">
        <div className="flex-1 flex flex-col items-center">
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-score-low/10 text-score-low font-bold text-xs">
            1
          </span>
          <span className="text-xs text-score-low leading-tight whitespace-nowrap">
            {anchor1}
          </span>
        </div>
        <div className="flex-1" />
        <div className="flex-1" />
        <div className="flex-1" />
        <div className="flex-1 flex flex-col items-center">
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-score-high/10 text-score-high font-bold text-xs">
            5
          </span>
          <span className="text-xs text-score-high leading-tight whitespace-nowrap">
            {anchor5}
          </span>
        </div>
      </div>
    </div>
  );
}

function CenteredIcon({ icon }: { icon: string }) {
  return (
    <div className="w-16 h-16 mx-auto mb-8 rounded-xl bg-surface-container flex items-center justify-center">
      <span className="material-symbols-outlined text-primary text-3xl">
        {icon}
      </span>
    </div>
  );
}

function CtaBtn({
  label,
  icon,
  onClick,
  enabled = true,
}: {
  label: string;
  icon?: string;
  onClick: () => void;
  enabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={enabled ? onClick : undefined}
      className={`w-full py-4 font-body-md text-body-md text-on-primary bg-primary rounded-xl ${enabled ? "hover:opacity-90 active:scale-[0.98]" : "opacity-30 cursor-not-allowed"} transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex justify-center items-center gap-2`}
    >
      {label}
      {icon && (
        <span className="material-symbols-outlined text-sm">{icon}</span>
      )}
    </button>
  );
}

export default function ReviewPage() {
  const [step, setStep] = useState(0);
  const [anim, setAnim] = useState("");
  const transitioning = useRef(false);

  const [verifyMethod, setVerifyMethod] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [userName, setUserName] = useState("");

  const [storeName, setStoreName] = useState("");
  const [storeLocation, setStoreLocation] = useState("");

  const [brand, setBrand] = useState<BrandPick | null>(null);
  const [brandQuery, setBrandQuery] = useState("");
  const [brandResults, setBrandResults] = useState<BrandPick[]>([]);
  const [brandSearching, setBrandSearching] = useState(false);
  const [showManualBrand, setShowManualBrand] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualDomain, setManualDomain] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [ratings, setRatings] = useState<Ratings>({});
  const [dimText, setDimText] = useState<DimText>({});
  const [validationMsg, setValidationMsg] = useState("");

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setBrandResults([]);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const go = (target: number, fwd: boolean) => {
    if (transitioning.current) return;
    transitioning.current = true;
    setAnim(fwd ? "step-exit-fwd" : "step-exit-bwd");
    setTimeout(() => {
      setStep(target);
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      setAnim(fwd ? "step-enter-fwd" : "step-enter-bwd");
      setTimeout(() => {
        setAnim("");
        transitioning.current = false;
      }, 250);
    }, 200);
  };

  const goNext = () => go(step + 1, true);
  const goBack = () => go(step - 1, false);

  const rate = (dimKey: string, subKey: string, v: number) => {
    setRatings((prev) => ({
      ...prev,
      [dimKey]: { ...prev[dimKey], [subKey]: v },
    }));
  };

  const allRated = (dimKey: string) =>
    DIMENSION_SUBS[dimKey].every(
      (s) => (ratings[dimKey]?.[s.key] || 0) > 0
    );

  const validateDimAndGo = () => {
    const dim = DIMENSIONS[step - 4];
    if (!allRated(dim.key)) {
      setValidationMsg("Please rate all sub-components before continuing.");
      return;
    }
    setValidationMsg("");
    go(step + 1, true);
  };

  const handleEmailVerify = () => {
    const result = validateWorkEmail(email, PERSONAL_EMAIL_DOMAINS);
    if (!result.ok) {
      setEmailErr(result.reason || "Invalid email");
      return;
    }
    setEmailErr("");
    setVerifyMethod("email");
    go(1, true);
  };

  const searchBrand = useCallback((q: string) => {
    setBrandQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!q.trim()) {
      setBrandResults([]);
      setBrandSearching(false);
      return;
    }
    setBrandSearching(true);
    searchTimer.current = setTimeout(() => {
      const lower = q.toLowerCase();
      const indexMatches = SEED_BRANDS.filter((b) =>
        b.name.toLowerCase().includes(lower)
      ).map((b) => ({ name: b.name, domain: b.domain }));
      setBrandResults(indexMatches.slice(0, 8));
      setBrandSearching(false);
    }, 150);
  }, []);

  const selectBrand = (b: BrandPick) => {
    setBrand(b);
    setBrandQuery(b.name);
    setBrandResults([]);
    setShowManualBrand(false);
  };

  const clearBrand = () => {
    setBrand(null);
    setBrandQuery("");
    setShowManualBrand(false);
  };

  const applyManualBrand = () => {
    if (!manualName.trim()) return;
    setBrand({ name: manualName.trim(), domain: manualDomain.trim() });
    setShowManualBrand(false);
  };

  const submitReview = () => {
    go(10, true);
  };

  const progressInfo = () => {
    if (step === 0) return { pct: 0, label: "Verify your identity", count: "" };
    if (step === 1) return { pct: 5, label: "Your retailer", count: "" };
    if (step === 2) return { pct: 10, label: "Select brand", count: "" };
    if (step === 3) return { pct: 15, label: "Overview", count: "" };
    if (step >= 4 && step <= 8) {
      const dimIdx = step - 4;
      const dim = DIMENSIONS[dimIdx];
      const pct = 15 + (dimIdx + 1) * 16;
      const rated = countRated(ratings);
      return {
        pct: Math.min(95, pct),
        label: dim.name,
        count: Math.round((rated / 20) * 100) + "% complete",
      };
    }
    if (step === 9)
      return {
        pct: 95,
        label: "Review & submit",
        count: Math.round((countRated(ratings) / 20) * 100) + "% complete",
      };
    return { pct: 100, label: "", count: "" };
  };

  const isConfirm = step >= 10;
  const info = progressInfo();

  return (
    <>
      {/* Overlay header */}
      <header className="w-full top-0 sticky bg-background z-50">
        <div className="flex items-center px-margin-mobile md:px-margin-desktop py-4 max-w-[840px] mx-auto relative">
          <button
            onClick={step === 0 || isConfirm ? undefined : goBack}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-border-hairline hover:bg-surface-container transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-primary text-xl">
              {step === 0 || isConfirm ? (
                <Link href="/">close</Link>
              ) : (
                "arrow_back"
              )}
            </span>
          </button>
          <span className="absolute left-1/2 -translate-x-1/2 font-label-caps text-label-caps text-text-main uppercase tracking-widest select-none">
            Review a Brand
          </span>
        </div>
        {!isConfirm && (
          <div className="px-margin-mobile md:px-margin-desktop max-w-[840px] mx-auto pb-2">
            <div className="w-full h-[3px] rounded-full bg-border-hairline overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${info.pct}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-1.5">
              <span className="font-caption text-caption text-text-caption">
                {info.label}
              </span>
              <span className="font-caption text-caption text-text-caption">
                {info.count}
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <div
        className={`flex-grow w-full max-w-[840px] mx-auto px-margin-mobile md:px-margin-desktop flex flex-col ${anim}`}
      >
        {/* Step 0: Verify */}
        {step === 0 && (
          <div className="flex-grow flex flex-col items-center justify-center text-center py-12">
            <CenteredIcon icon="verified_user" />
            <h1 className="font-display-lg text-display-lg text-primary mb-4 px-4">
              Are you a retailer?
            </h1>
            <p className="font-body-md text-body-md text-text-caption max-w-xs mx-auto mb-8">
              Reviews on the Index come from verified retailers only. We use
              LinkedIn to confirm.
            </p>
            <div className="w-full max-w-sm mx-auto space-y-3">
              <button
                onClick={() => { setVerifyMethod("linkedin"); go(1, true); }}
                className="w-full flex items-center justify-center px-6 py-3 border border-border-hairline bg-surface-card hover:bg-surface-container-low transition-colors rounded font-data-tabular text-data-tabular text-primary"
              >
                <svg aria-hidden="true" className="w-5 h-5 mr-3 text-[#0a66c2]" fill="currentColor" viewBox="0 0 24 24">
                  <path clipRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fillRule="evenodd" />
                </svg>
                Continue with LinkedIn
              </button>
              <button
                onClick={() => { setVerifyMethod("google"); go(1, true); }}
                className="w-full flex items-center justify-center px-6 py-3 border border-border-hairline bg-surface-card hover:bg-surface-container-low transition-colors rounded font-data-tabular text-data-tabular text-primary"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </button>
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 border-t border-border-hairline" />
                <span className="font-caption text-caption text-text-caption">or</span>
                <div className="flex-1 border-t border-border-hairline" />
              </div>
              {!showEmailForm ? (
                <>
                  <button
                    onClick={() => setShowEmailForm(true)}
                    className="w-full flex items-center justify-center px-6 py-3 border border-border-hairline bg-surface-card hover:bg-surface-container-low transition-colors rounded font-data-tabular text-data-tabular text-primary"
                  >
                    <span className="material-symbols-outlined text-lg mr-3">mail</span>
                    Continue with Email
                  </button>
                  <p className="font-caption text-caption text-text-caption text-center">
                    We don&apos;t post anything. We only confirm you work in retail.
                  </p>
                </>
              ) : (
                <>
                  <div className="space-y-3 text-left">
                    <div>
                      <label className="sr-only" htmlFor="verify-email">Work Email</label>
                      <input id="verify-email" type="email" value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailErr(""); }}
                        placeholder="you@yourretailer.com"
                        className={`w-full px-4 py-3 bg-surface-card border ${emailErr ? "border-error" : "border-border-hairline"} rounded font-body-md text-body-md text-text-main placeholder:text-text-caption focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors`}
                      />
                      {emailErr && <p className="font-caption text-caption text-error mt-1">{emailErr}</p>}
                    </div>
                    <div>
                      <label className="sr-only" htmlFor="verify-name">Your name</label>
                      <input id="verify-name" type="text" value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Your name (optional)"
                        className="w-full px-4 py-3 bg-surface-card border border-border-hairline rounded font-body-md text-body-md text-text-main placeholder:text-text-caption focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                      />
                    </div>
                    <button onClick={handleEmailVerify}
                      className="w-full flex items-center justify-center px-6 py-3 border border-border-hairline bg-surface-card hover:bg-surface-container-low transition-colors rounded font-data-tabular text-data-tabular text-primary"
                    >
                      Continue with Email
                    </button>
                  </div>
                  <p className="font-caption text-caption text-text-caption text-center mt-3">
                    We don&apos;t post anything. We only confirm you work in retail.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 1: Retailer */}
        {step === 1 && (
          <div className="flex-grow flex flex-col py-12">
            <div className="text-center mb-10">
              <CenteredIcon icon="storefront" />
              <h1 className="font-display-lg text-display-lg text-primary mb-3 px-4">
                Which retailer do you work for?
              </h1>
              <p className="font-body-md text-body-md text-text-caption max-w-xs mx-auto">
                We&apos;ll show your store name on the review.
              </p>
            </div>
            <div className="space-y-5 mb-auto">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-xl">storefront</span>
                <input type="text" placeholder="Your store name" value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full border border-border-hairline rounded-xl pl-12 pr-4 py-3.5 font-body-md text-body-md text-text-main placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent"
                />
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-xl">location_on</span>
                <input type="text" placeholder="City, State" value={storeLocation}
                  onChange={(e) => setStoreLocation(e.target.value)}
                  className="w-full border border-border-hairline rounded-xl pl-12 pr-4 py-3.5 font-body-md text-body-md text-text-main placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent"
                />
              </div>
            </div>
            <div className="pt-8">
              <CtaBtn label="Continue" icon="arrow_forward" onClick={goNext}
                enabled={!!storeName.trim() && !!storeLocation.trim()} />
            </div>
          </div>
        )}

        {/* Step 2: Brand search */}
        {step === 2 && (
          <div className="flex-grow flex flex-col py-12">
            <div className="text-center mb-10">
              <CenteredIcon icon="search" />
              <h1 className="font-display-lg text-display-lg text-primary mb-3 px-4">
                Which brand are you reviewing?
              </h1>
              <p className="font-body-md text-body-md text-text-caption max-w-xs mx-auto">
                Search by name. We&apos;ll match it to the right company.
              </p>
            </div>
            <div className="mb-auto" ref={dropdownRef}>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-xl">search</span>
                <input type="text" placeholder="Brand name…" value={brandQuery}
                  onChange={(e) => searchBrand(e.target.value)}
                  className="w-full border border-border-hairline rounded-xl pl-12 pr-10 py-3.5 font-body-md text-body-md text-text-main placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent"
                  autoFocus
                />
                {brand && (
                  <button onClick={clearBrand}
                    className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg hover:text-primary transition-colors"
                  >close</button>
                )}
                {brandSearching && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-caption animate-spin text-lg">progress_activity</span>
                )}
                {brandResults.length > 0 && (
                  <div className="absolute z-40 left-0 right-0 mt-1 bg-surface-card border border-border-hairline rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {brandResults.map((r) => (
                      <button key={r.domain} type="button" onClick={() => selectBrand(r)}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low border-b border-border-hairline last:border-b-0"
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
              {!brand && !showManualBrand && (
                <p className="text-center mt-4">
                  <button type="button" onClick={() => setShowManualBrand(true)}
                    className="font-caption text-caption text-link-endvr hover:underline"
                  >Can&apos;t find your brand? Enter it manually</button>
                </p>
              )}
              {!brand && showManualBrand && (
                <div className="mt-6 space-y-4 border border-border-hairline rounded-xl p-5">
                  <p className="font-body-md text-body-md font-semibold text-primary">Enter brand details</p>
                  <div>
                    <label className="block font-caption text-caption text-text-caption mb-1.5">Brand name <span className="text-error">*</span></label>
                    <input type="text" placeholder="Brand name" value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      className="w-full border border-border-hairline rounded-xl px-4 py-3 font-body-md text-body-md text-text-main placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block font-caption text-caption text-text-caption mb-1.5">Brand website <span className="text-outline">(optional)</span></label>
                    <input type="text" placeholder="e.g. brandname.com" value={manualDomain}
                      onChange={(e) => setManualDomain(e.target.value)}
                      className="w-full border border-border-hairline rounded-xl px-4 py-3 font-body-md text-body-md text-text-main placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent"
                    />
                  </div>
                  <button type="button" onClick={applyManualBrand}
                    className="w-full py-3 font-body-md text-body-md text-primary border border-border-hairline rounded-xl hover:bg-surface-container transition-colors"
                  >Use this brand</button>
                </div>
              )}
              {brand && brandResults.length === 0 && (
                <div className="text-center py-8">
                  <p className="font-headline-md text-headline-md text-primary mb-1">{brand.name}</p>
                  <p className="font-caption text-caption text-text-caption mb-3">{brand.domain}</p>
                  {SEED_BRANDS.some((b) => b.domain === brand.domain) ? (
                    <span className="inline-flex items-center gap-1 font-caption text-caption text-score-high">
                      <span className="material-symbols-outlined text-sm">check_circle</span> IN INDEX
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-caption text-caption text-text-caption">
                      <span className="material-symbols-outlined text-sm">add_circle</span> New to Index
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="pt-8">
              <CtaBtn label="Continue" icon="arrow_forward" onClick={goNext} enabled={!!brand} />
            </div>
          </div>
        )}

        {/* Step 3: Expectations */}
        {step === 3 && (
          <div className="flex-grow flex flex-col py-12">
            <div className="text-center mb-10">
              <CenteredIcon icon="checklist" />
              <h1 className="font-display-lg text-display-lg text-primary mb-4 px-4">
                Here&apos;s what to expect
              </h1>
              <p className="font-body-md text-body-md text-text-caption max-w-sm mx-auto">
                You&apos;ll rate <strong className="text-primary">{brand?.name || "this brand"}</strong> across 5 partnership standards, with 4 questions each — 20 ratings total.
              </p>
            </div>
            <div className="space-y-4 mb-auto">
              {DIMENSIONS.map((dim, i) => (
                <div key={dim.key} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0 mt-0.5">
                    <span className="font-data-tabular text-data-tabular text-primary">{i + 1}</span>
                  </div>
                  <div>
                    <p className="font-body-md text-body-md font-semibold text-primary">{dim.name}</p>
                    <p className="font-caption text-caption text-text-caption">{DIM_DESCRIPTIONS[dim.key]}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-4 pt-4">
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: 18 }}>schedule</span>
                </div>
                <p className="font-body-md text-body-md text-text-caption">About 3 minutes to complete</p>
              </div>
              <p className="font-caption text-caption text-text-caption pt-2 pl-12">
                Each question uses a 1–5 star rating. You can add optional comments to give the brand specific, actionable feedback.
              </p>
            </div>
            <div className="pt-8">
              <CtaBtn label="Continue" icon="arrow_forward" onClick={goNext} enabled />
            </div>
          </div>
        )}

        {/* Steps 4-8: Dimension ratings */}
        {step >= 4 && step <= 8 && (() => {
          const dimIdx = step - 4;
          const dim = DIMENSIONS[dimIdx];
          const subs = DIMENSION_SUBS[dim.key];
          const icon = DIMENSION_ICONS[dim.key];
          const score = dimScore(ratings, dim.key);
          const nextLabel = dimIdx < 4 ? DIMENSIONS[dimIdx + 1].name : "Review & Submit";
          const brandName = brand?.name || "this brand";
          const dt = dimText[dim.key] || { praise: "", improve: "" };

          return (
            <div className="flex-grow flex flex-col py-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: 22 }}>{icon}</span>
                  <h2 className="font-headline-sm text-headline-sm text-primary">{dim.name}</h2>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-headline-sm text-headline-sm text-primary">{score}</span>
                  <span className="font-body-md text-body-md text-text-caption">/ 20</span>
                </div>
              </div>
              {subs.map((sub) => {
                const rated = (ratings[dim.key]?.[sub.key] || 0) > 0;
                return (
                  <div key={sub.key}
                    className={`bg-surface-container-low rounded-lg p-4 mb-2 ${rated ? "border-l-2 border-accent" : ""}`}
                  >
                    <p className="font-body-md text-body-md font-semibold text-primary">{sub.label}</p>
                    <p className="font-caption text-caption text-on-surface-variant">{sub.desc}</p>
                    <StarRow
                      dimKey={dim.key} subKey={sub.key}
                      current={ratings[dim.key]?.[sub.key] || 0}
                      anchor1={sub.anchor1} anchor5={sub.anchor5}
                      onRate={(v) => rate(dim.key, sub.key, v)}
                    />
                  </div>
                );
              })}
              <div className="mt-2 space-y-1.5">
                <div>
                  <label className="block font-caption text-caption font-semibold text-primary mb-1">
                    What does {brandName} do well in {dim.name}?
                  </label>
                  <textarea value={dt.praise}
                    onChange={(e) => setDimText((p) => ({ ...p, [dim.key]: { ...p[dim.key], praise: e.target.value, improve: p[dim.key]?.improve || "" } }))}
                    placeholder="e.g., Their website is clean with no permanent sale sections"
                    rows={2}
                    className="w-full border border-border-hairline rounded-lg px-3 py-2 font-body-md text-body-md text-text-main placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent resize-none"
                  />
                </div>
                <div>
                  <label className="block font-caption text-caption font-semibold text-primary mb-1">
                    What should {brandName} improve in {dim.name}?
                  </label>
                  <textarea value={dt.improve}
                    onChange={(e) => setDimText((p) => ({ ...p, [dim.key]: { praise: p[dim.key]?.praise || "", improve: e.target.value } }))}
                    placeholder="e.g., The 15% popup for new visitors undercuts our in-store experience"
                    rows={2}
                    className="w-full border border-border-hairline rounded-lg px-3 py-2 font-body-md text-body-md text-text-main placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent resize-none"
                  />
                </div>
              </div>
              <div className="mt-2">
                {validationMsg && (
                  <p className="text-error font-caption text-caption text-center mb-2">{validationMsg}</p>
                )}
                <CtaBtn label={`Next: ${nextLabel}`} icon="arrow_forward"
                  onClick={validateDimAndGo} enabled />
              </div>
            </div>
          );
        })()}

        {/* Step 9: Review & Submit */}
        {step === 9 && (
          <div className="flex-grow flex flex-col py-8">
            <div className="text-center mb-8">
              <CenteredIcon icon="checklist" />
              <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Review &amp; Submit</h1>
              <p className="font-body-md text-body-md text-text-caption max-w-xs mx-auto">
                Check your ratings below. Tap &ldquo;Edit&rdquo; to change any section.
              </p>
            </div>
            <div className="text-center mb-6 py-6 bg-primary rounded-xl">
              <span className="font-label-caps text-label-caps text-on-primary/60 uppercase">Overall Score</span>
              <div className="font-display-lg text-display-lg text-on-primary mt-1">
                {totalScore(ratings)}<span className="text-on-primary/60">/100</span>
              </div>
              <p className="font-caption text-caption text-on-primary/60 mt-2">
                {brand?.name || "—"} / by {storeName || "—"}, {storeLocation || "—"}
              </p>
            </div>
            <div className="mb-auto">
              {DIMENSIONS.map((dim, i) => {
                const subs = DIMENSION_SUBS[dim.key];
                const score = dimScore(ratings, dim.key);
                const icon = DIMENSION_ICONS[dim.key];
                const dt = dimText[dim.key] || { praise: "", improve: "" };
                return (
                  <div key={dim.key} className="py-5 border-b border-border-hairline last:border-b-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>{icon}</span>
                        <span className="font-body-md text-body-md font-semibold text-primary">{dim.name}</span>
                      </div>
                      <span className={`font-body-md text-body-md font-semibold ${tierColor20(score)}`}>
                        {score}<span className="text-text-caption font-normal">/20</span>
                      </span>
                    </div>
                    {subs.map((sub) => {
                      const sr = ratings[dim.key]?.[sub.key] || 0;
                      return (
                        <div key={sub.key} className="flex justify-between items-center py-1.5">
                          <span className="font-caption text-caption text-text-main">{sub.label}</span>
                          <div className="flex gap-0">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span key={s} className={`material-symbols-outlined ${s <= sr ? "star-filled text-primary" : "text-outline"}`} style={{ fontSize: 14 }}>star</span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    {dt.praise && (
                      <div className="mt-3 flex items-start gap-2">
                        <span className="material-symbols-outlined text-score-high shrink-0" style={{ fontSize: 14 }}>thumb_up</span>
                        <p className="font-caption text-caption text-text-main">{dt.praise}</p>
                      </div>
                    )}
                    {dt.improve && (
                      <div className="mt-2 flex items-start gap-2">
                        <span className="material-symbols-outlined text-score-low shrink-0" style={{ fontSize: 14 }}>flag</span>
                        <p className="font-caption text-caption text-text-main">{dt.improve}</p>
                      </div>
                    )}
                    <button onClick={() => go(4 + i, false)}
                      className="mt-2 font-caption text-caption text-link-endvr flex items-center gap-1 hover:opacity-80 transition-opacity"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span> Edit
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="pt-8">
              <CtaBtn label="Submit Review" icon="send" onClick={submitReview} enabled />
            </div>
          </div>
        )}

        {/* Step 10: Confirmation */}
        {step >= 10 && (
          <div className="flex-grow flex flex-col items-center justify-center text-center py-16 px-4">
            <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-score-high/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-score-high text-5xl">check_circle</span>
            </div>
            <h1 className="font-display-lg text-display-lg text-primary mb-3">Review Submitted</h1>
            <p className="font-body-md text-body-md text-text-caption mb-1">
              Thank you for rating <strong className="text-primary">{brand?.name || "this brand"}</strong>.
            </p>
            <p className="font-headline-md text-headline-md text-primary mb-8">
              Your score: {totalScore(ratings)}/100
            </p>
            <p className="font-caption text-caption text-text-caption max-w-xs mb-10">
              Your review will be verified and published within 48 hours.
            </p>
            <div className="w-full max-w-sm space-y-3">
              <Link href="/"
                className="block w-full py-4 font-body-md text-body-md text-on-primary bg-primary rounded-xl hover:opacity-90 transition-opacity text-center"
              >Back to Leaderboard</Link>
              {brand && (
                <Link href={`/brands/${brand.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className="block w-full py-4 font-body-md text-body-md text-primary border border-border-hairline rounded-xl hover:bg-surface-container transition-colors text-center"
                >View Brand Profile</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
