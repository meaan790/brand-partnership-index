"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PERSONAL_EMAIL_DOMAINS } from "@/lib/constants";

function SignInContent() {
  const searchParams = useSearchParams();
  const isBrandType = searchParams.get("type") === "brand";

  const [retailerEmail, setRetailerEmail] = useState("");
  const [retailerError, setRetailerError] = useState("");
  const [retailerInbox, setRetailerInbox] = useState(false);
  const [retailerSentEmail, setRetailerSentEmail] = useState("");

  const [brandEmail, setBrandEmail] = useState("");
  const [brandError, setBrandError] = useState("");
  const [brandInbox, setBrandInbox] = useState(false);
  const [brandSentEmail, setBrandSentEmail] = useState("");

  function handleEmail(role: "retailer" | "brand") {
    const email =
      role === "retailer"
        ? retailerEmail.trim().toLowerCase()
        : brandEmail.trim().toLowerCase();
    const setError = role === "retailer" ? setRetailerError : setBrandError;

    setError("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    const domain = email.split("@")[1];
    if (PERSONAL_EMAIL_DOMAINS.has(domain)) {
      setError(`Please use a work email address (not ${domain}).`);
      return;
    }

    if (role === "retailer") {
      setRetailerSentEmail(email);
      setRetailerInbox(true);
    } else {
      setBrandSentEmail(email);
      setBrandInbox(true);
    }
  }

  function resetEmail(role: "retailer" | "brand") {
    if (role === "retailer") {
      setRetailerInbox(false);
    } else {
      setBrandInbox(false);
    }
  }

  return (
    <div className="flex-grow flex items-center justify-center px-margin-mobile py-12 md:py-24">
      <div className="w-full max-w-[800px]">
        <div className="text-center mb-12">
          <Link
            href="/"
            className="inline-block font-headline-md text-headline-md font-bold tracking-tight text-primary mb-6"
          >
            Brand Partnership Index
          </Link>
          <h1 className="font-display-lg text-display-lg text-on-background mb-4">
            Sign in to the Index
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mx-auto">
            Access verified brand reviews and submit your own data to the
            central resource for the wholesale community.
          </p>
        </div>

        <div
          className="bg-surface-card border border-border-hairline rounded overflow-hidden grid grid-cols-1 md:grid-cols-2"
        >
          {/* Retailer Column */}
          <div className="p-8 md:p-12 md:border-r border-border-hairline border-b md:border-b-0 flex flex-col">
            <div className="mb-8 min-h-[140px]">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-surface-container-low rounded-full mb-4">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  storefront
                </span>
              </span>
              <h2 className="font-headline-md text-headline-md text-on-background mb-2">
                I am a Retailer
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Sign in to review brands you carry, view detailed methodology,
                and access the full leaderboard.
              </p>
            </div>
            {!retailerInbox ? (
              <div className="mt-auto space-y-3">
                <button
                  className="w-full flex items-center justify-center px-6 py-3 border border-border-hairline bg-surface-card hover:bg-surface-container-low transition-colors rounded font-data-tabular text-data-tabular text-primary"
                  type="button"
                  onClick={() =>
                    (window.location.href = "/dashboard/retailer")
                  }
                >
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5 mr-3 text-[#0a66c2]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      clipRule="evenodd"
                      d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                      fillRule="evenodd"
                    />
                  </svg>
                  Continue with LinkedIn
                </button>
                <button
                  className="w-full flex items-center justify-center px-6 py-3 border border-border-hairline bg-surface-card hover:bg-surface-container-low transition-colors rounded font-data-tabular text-data-tabular text-primary"
                  type="button"
                  onClick={() =>
                    (window.location.href = "/dashboard/retailer")
                  }
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </button>
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 border-t border-border-hairline" />
                  <span className="font-caption text-caption text-text-caption">
                    or
                  </span>
                  <div className="flex-1 border-t border-border-hairline" />
                </div>
                <form
                  className="space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEmail("retailer");
                  }}
                >
                  <div>
                    <label className="sr-only" htmlFor="retailer-email">
                      Work Email
                    </label>
                    <input
                      className="w-full px-4 py-3 bg-surface-card border border-border-hairline rounded font-body-md text-body-md text-on-background placeholder:text-text-caption focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                      id="retailer-email"
                      name="retailer-email"
                      placeholder="you@yourstore.com"
                      type="email"
                      value={retailerEmail}
                      onChange={(e) => setRetailerEmail(e.target.value)}
                    />
                    {retailerError && (
                      <p className="font-caption text-caption text-error mt-1">
                        {retailerError}
                      </p>
                    )}
                  </div>
                  <button
                    className="w-full flex items-center justify-center px-6 py-3 border border-border-hairline bg-surface-card hover:bg-surface-container-low transition-colors rounded font-data-tabular text-data-tabular text-primary"
                    type="submit"
                  >
                    Continue with Email
                  </button>
                </form>
                <p className="font-caption text-caption text-text-caption text-center">
                  We use LinkedIn to verify employment at an active retailer. We
                  will never post on your behalf.
                </p>
                <p className="font-caption text-caption text-on-surface-variant text-center mt-2">
                  Looking to review a brand?{" "}
                  <Link
                    href="/review"
                    className="text-link-endvr hover:underline"
                  >
                    Start here
                  </Link>{" "}
                  — verification is built into the review flow.
                </p>
              </div>
            ) : (
              <div className="mt-auto text-center">
                <span
                  className="material-symbols-outlined text-accent mb-4"
                  style={{
                    fontSize: 48,
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  mark_email_read
                </span>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-2">
                  Check your inbox
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                  We sent a magic link to{" "}
                  <strong className="text-primary">{retailerSentEmail}</strong>.
                  Click it to sign in.
                </p>
                <button
                  onClick={() => resetEmail("retailer")}
                  className="font-caption text-caption text-primary hover:underline"
                >
                  Use a different email
                </button>
              </div>
            )}
          </div>

          {/* Brand Column */}
          <div
            className={`p-8 md:p-12 flex flex-col${isBrandType ? " ring-2 ring-primary" : ""}`}
          >
            <div className="mb-8 min-h-[140px]">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-surface-container-low rounded-full mb-4">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  corporate_fare
                </span>
              </span>
              <h2 className="font-headline-md text-headline-md text-on-background mb-2">
                I am a Brand
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Sign in to view your company&apos;s profile, respond to verified
                reviews, and update your public commitments.
              </p>
            </div>
            {!brandInbox ? (
              <div className="mt-auto space-y-3">
                <button
                  className="w-full flex items-center justify-center px-6 py-3 border border-border-hairline bg-surface-card hover:bg-surface-container-low transition-colors rounded font-data-tabular text-data-tabular text-primary"
                  type="button"
                  onClick={() =>
                    (window.location.href = "/dashboard/brand")
                  }
                >
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5 mr-3 text-[#0a66c2]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      clipRule="evenodd"
                      d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                      fillRule="evenodd"
                    />
                  </svg>
                  Continue with LinkedIn
                </button>
                <button
                  className="w-full flex items-center justify-center px-6 py-3 border border-border-hairline bg-surface-card hover:bg-surface-container-low transition-colors rounded font-data-tabular text-data-tabular text-primary"
                  type="button"
                  onClick={() =>
                    (window.location.href = "/dashboard/brand")
                  }
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </button>
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 border-t border-border-hairline" />
                  <span className="font-caption text-caption text-text-caption">
                    or
                  </span>
                  <div className="flex-1 border-t border-border-hairline" />
                </div>
                <form
                  className="space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEmail("brand");
                  }}
                >
                  <div>
                    <label className="sr-only" htmlFor="work-email">
                      Work Email
                    </label>
                    <input
                      className="w-full px-4 py-3 bg-surface-card border border-border-hairline rounded font-body-md text-body-md text-on-background placeholder:text-text-caption focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                      id="work-email"
                      name="work-email"
                      placeholder="name@company.com"
                      type="email"
                      value={brandEmail}
                      onChange={(e) => setBrandEmail(e.target.value)}
                    />
                    {brandError && (
                      <p className="font-caption text-caption text-error mt-1">
                        {brandError}
                      </p>
                    )}
                  </div>
                  <button
                    className="w-full flex items-center justify-center px-6 py-3 border border-border-hairline bg-surface-card hover:bg-surface-container-low transition-colors rounded font-data-tabular text-data-tabular text-primary"
                    type="submit"
                  >
                    Continue with Email
                  </button>
                </form>
                <p className="font-caption text-caption text-text-caption text-center">
                  Use your official corporate email domain for immediate access.
                </p>
                {isBrandType && (
                  <p className="font-caption text-caption text-score-high text-center mt-2">
                    After signing in, you&apos;ll be taken to your brand
                    dashboard.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-auto text-center">
                <span
                  className="material-symbols-outlined text-accent mb-4"
                  style={{
                    fontSize: 48,
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  mark_email_read
                </span>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-2">
                  Check your inbox
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                  We sent a magic link to{" "}
                  <strong className="text-primary">{brandSentEmail}</strong>.
                  Click it to sign in.
                </p>
                <button
                  onClick={() => resetEmail("brand")}
                  className="font-caption text-caption text-primary hover:underline"
                >
                  Use a different email
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="font-caption text-caption text-text-caption">
            By signing in, you agree to the{" "}
            <a className="text-link-endvr hover:underline" href="#">
              Terms of Service
            </a>{" "}
            and{" "}
            <a className="text-link-endvr hover:underline" href="#">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}
