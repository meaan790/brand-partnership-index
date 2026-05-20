"use client";

import { useState, useEffect, useCallback } from "react";
import { PERSONAL_EMAIL_DOMAINS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

type View = "signin" | "signup";
type Role = "retailer" | "brand" | null;

function OAuthButtonsComingSoon() {
  return (
    <>
      <div className="relative">
        <button
          className="w-full flex items-center justify-center px-5 py-2.5 border border-border-hairline bg-surface-container-low transition-colors rounded-full font-data-tabular text-data-tabular text-text-caption cursor-not-allowed opacity-60"
          type="button"
          disabled
        >
          <svg
            aria-hidden="true"
            className="w-5 h-5 mr-3 text-[#0a66c2] opacity-50"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              clipRule="evenodd"
              d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
              fillRule="evenodd"
            />
          </svg>
          LinkedIn — coming soon
        </button>
      </div>
      <div className="relative">
        <button
          className="w-full flex items-center justify-center px-5 py-2.5 border border-border-hairline bg-surface-container-low transition-colors rounded-full font-data-tabular text-data-tabular text-text-caption cursor-not-allowed opacity-60"
          type="button"
          disabled
        >
          <svg className="w-5 h-5 mr-3 opacity-50" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google — coming soon
        </button>
      </div>
    </>
  );
}

function EmailForm({
  idPrefix,
  emailValue,
  emailError,
  loading,
  onEmailChange,
  onSubmit,
}: {
  idPrefix: string;
  emailValue: string;
  emailError: string;
  loading: boolean;
  onEmailChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div>
        <label className="sr-only" htmlFor={`modal-${idPrefix}-email`}>
          Work Email
        </label>
        <input
          className={`w-full px-4 py-2.5 bg-surface-card border ${emailError ? "border-error" : "border-border-hairline"} rounded font-body-md text-body-md text-on-background placeholder:text-text-caption focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors`}
          id={`modal-${idPrefix}-email`}
          placeholder="you@company.com"
          type="email"
          value={emailValue}
          onChange={(e) => onEmailChange(e.target.value)}
          disabled={loading}
        />
        {emailError && (
          <p className="font-caption text-caption text-error mt-1">
            {emailError}
          </p>
        )}
      </div>
      <button
        className="w-full flex items-center justify-center px-5 py-2.5 bg-primary text-on-primary rounded-full font-data-tabular text-data-tabular hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        type="submit"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
            Sending...
          </span>
        ) : (
          "Continue with Email"
        )}
      </button>
    </form>
  );
}

function InboxState({
  sentEmail,
  onReset,
}: {
  sentEmail: string;
  onReset: () => void;
}) {
  return (
    <div className="text-center">
      <span
        className="material-symbols-outlined text-accent mb-3"
        style={{ fontSize: 40, fontVariationSettings: "'FILL' 1" }}
      >
        mark_email_read
      </span>
      <h3 className="font-headline-sm text-headline-sm text-primary mb-2">
        Check your inbox
      </h3>
      <p className="font-body-md text-body-md text-on-surface-variant mb-3">
        We sent a magic link to{" "}
        <strong className="text-primary">{sentEmail}</strong>.
      </p>
      <p className="font-caption text-caption text-text-caption mb-3">
        Click the link in the email to sign in. It expires in 1 hour.
      </p>
      <button
        onClick={onReset}
        className="font-caption text-caption text-primary hover:underline cursor-pointer"
      >
        Use a different email
      </button>
    </div>
  );
}

export function SignInModal({
  open,
  onClose,
  initialView = "signin",
  preselectedRole,
}: {
  open: boolean;
  onClose: () => void;
  initialView?: View;
  preselectedRole?: "retailer" | "brand";
}) {
  const [view, setView] = useState<View>(initialView);
  const [role, setRole] = useState<Role>(preselectedRole || null);

  const [signinEmail, setSigninEmail] = useState("");
  const [signinError, setSigninError] = useState("");
  const [signinLoading, setSigninLoading] = useState(false);
  const [signinInbox, setSigninInbox] = useState(false);
  const [signinSentEmail, setSigninSentEmail] = useState("");

  const [signupEmail, setSignupEmail] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupInbox, setSignupInbox] = useState(false);
  const [signupSentEmail, setSignupSentEmail] = useState("");

  const resetAll = useCallback(() => {
    setSigninEmail("");
    setSigninError("");
    setSigninLoading(false);
    setSigninInbox(false);
    setSignupEmail("");
    setSignupError("");
    setSignupLoading(false);
    setSignupInbox(false);
    setRole(null);
  }, []);

  useEffect(() => {
    if (open) {
      resetAll();
      setView(initialView);
      if (preselectedRole) setRole(preselectedRole);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, initialView, preselectedRole, resetAll]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  async function handleEmail(prefix: "signin" | "signup") {
    const email = prefix === "signin" ? signinEmail : signupEmail;
    const setError = prefix === "signin" ? setSigninError : setSignupError;
    const setLoading = prefix === "signin" ? setSigninLoading : setSignupLoading;
    const val = email.trim().toLowerCase();

    setError("");
    if (!val || !val.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    const domain = val.split("@")[1];
    if (PERSONAL_EMAIL_DOMAINS.has(domain)) {
      setError(`Please use a work email address (not ${domain}).`);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const currentPath = window.location.pathname;
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      if (currentPath && currentPath !== "/") {
        callbackUrl.searchParams.set("redirect", currentPath);
      }
      const redirectTo = callbackUrl.toString();

      const options: { emailRedirectTo: string; data?: Record<string, string> } = {
        emailRedirectTo: redirectTo,
      };

      if (prefix === "signup" && role) {
        options.data = { role };
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: val,
        options,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (prefix === "signin") {
        setSigninSentEmail(val);
        setSigninInbox(true);
      } else {
        setSignupSentEmail(val);
        setSignupInbox(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex items-center justify-center min-h-full p-4">
        <div className="bg-background-paper rounded-lg shadow-xl w-full max-w-[480px] relative">
          <button
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors cursor-pointer"
            onClick={onClose}
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-text-caption text-xl">
              close
            </span>
          </button>

          {/* VIEW: Sign In */}
          {view === "signin" && (
            <div>
              <div className="text-center pt-8 pb-4 px-8">
                <h2 className="font-headline-md text-headline-md text-on-background mb-2">
                  Sign in to the Index
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mx-auto">
                  Enter your work email and we&apos;ll send you a magic link.
                </p>
              </div>
              <div className="px-8 pb-6">
                {!signinInbox ? (
                  <div className="space-y-3">
                    <EmailForm
                      idPrefix="signin"
                      emailValue={signinEmail}
                      emailError={signinError}
                      loading={signinLoading}
                      onEmailChange={(v) => {
                        setSigninEmail(v);
                        setSigninError("");
                      }}
                      onSubmit={() => handleEmail("signin")}
                    />
                    <div className="flex items-center gap-3 my-1">
                      <div className="flex-1 border-t border-border-hairline" />
                      <span className="font-caption text-caption text-text-caption">
                        or
                      </span>
                      <div className="flex-1 border-t border-border-hairline" />
                    </div>
                    <OAuthButtonsComingSoon />
                  </div>
                ) : (
                  <InboxState
                    sentEmail={signinSentEmail}
                    onReset={() => setSigninInbox(false)}
                  />
                )}
              </div>
              <div className="border-t border-border-hairline px-8 py-4 text-center">
                <p className="font-caption text-caption text-text-caption">
                  New here?{" "}
                  <button
                    onClick={() => {
                      resetAll();
                      setView("signup");
                    }}
                    className="text-primary font-semibold hover:underline cursor-pointer"
                  >
                    Create an account
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* VIEW: Create Account */}
          {view === "signup" && (
            <div>
              <div className="text-center pt-8 pb-4 px-8">
                <h2 className="font-headline-md text-headline-md text-on-background mb-2">
                  Create your free account
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mx-auto">
                  Select your role to get started.
                </p>
              </div>

              {!role ? (
                <div className="px-8 pb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setRole("retailer")}
                      className="group flex flex-col items-center text-center p-5 border border-border-hairline rounded-lg hover:border-primary hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                      <span className="inline-flex items-center justify-center w-10 h-10 bg-surface-container-low rounded-full mb-3 group-hover:bg-primary/10 transition-colors">
                        <span
                          className="material-symbols-outlined text-primary text-xl"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          storefront
                        </span>
                      </span>
                      <h3 className="font-headline-sm text-headline-sm text-on-background mb-1">
                        I am a Retailer
                      </h3>
                      <p className="font-caption text-caption text-on-surface-variant">
                        Review brands and access the full leaderboard.
                      </p>
                    </button>
                    <button
                      onClick={() => setRole("brand")}
                      className="group flex flex-col items-center text-center p-5 border border-border-hairline rounded-lg hover:border-primary hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                      <span className="inline-flex items-center justify-center w-10 h-10 bg-surface-container-low rounded-full mb-3 group-hover:bg-primary/10 transition-colors">
                        <span
                          className="material-symbols-outlined text-primary text-xl"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          corporate_fare
                        </span>
                      </span>
                      <h3 className="font-headline-sm text-headline-sm text-on-background mb-1">
                        I am a Brand
                      </h3>
                      <p className="font-caption text-caption text-on-surface-variant">
                        View your profile and respond to feedback.
                      </p>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-8 pb-6">
                  <button
                    onClick={() => {
                      setRole(null);
                      setSignupInbox(false);
                      setSignupError("");
                    }}
                    className="flex items-center gap-1 text-primary font-caption text-caption hover:underline cursor-pointer mb-4"
                  >
                    <span className="material-symbols-outlined text-sm">
                      arrow_back
                    </span>
                    <span>Change role</span>
                  </button>
                  <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-surface-container-low rounded">
                    <span
                      className="material-symbols-outlined text-primary text-lg"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {role === "brand" ? "corporate_fare" : "storefront"}
                    </span>
                    <span className="font-data-tabular text-data-tabular text-primary">
                      Signing up as a{" "}
                      {role === "brand" ? "Brand" : "Retailer"}
                    </span>
                  </div>
                  {!signupInbox ? (
                    <div className="space-y-3">
                      <EmailForm
                        idPrefix="signup"
                        emailValue={signupEmail}
                        emailError={signupError}
                        loading={signupLoading}
                        onEmailChange={(v) => {
                          setSignupEmail(v);
                          setSignupError("");
                        }}
                        onSubmit={() => handleEmail("signup")}
                      />
                      <div className="flex items-center gap-3 my-1">
                        <div className="flex-1 border-t border-border-hairline" />
                        <span className="font-caption text-caption text-text-caption">
                          or
                        </span>
                        <div className="flex-1 border-t border-border-hairline" />
                      </div>
                      <OAuthButtonsComingSoon />
                    </div>
                  ) : (
                    <InboxState
                      sentEmail={signupSentEmail}
                      onReset={() => setSignupInbox(false)}
                    />
                  )}
                </div>
              )}

              <div className="border-t border-border-hairline px-8 py-4 text-center">
                <p className="font-caption text-caption text-text-caption">
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      resetAll();
                      setView("signin");
                    }}
                    className="text-primary font-semibold hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          )}

          <div className="border-t border-border-hairline px-8 py-3 text-center">
            <p className="font-caption text-caption text-text-caption">
              By continuing, you agree to the{" "}
              <a className="text-primary hover:underline" href="/methodology">
                Terms of Service
              </a>{" "}
              and{" "}
              <a className="text-primary hover:underline" href="/methodology">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
