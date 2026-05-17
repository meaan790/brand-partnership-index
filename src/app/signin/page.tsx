"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { validateWorkEmail } from "@/lib/scoring";
import { PERSONAL_EMAIL_DOMAINS } from "@/lib/constants";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showTooltip, setShowTooltip] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validation = validateWorkEmail(email, PERSONAL_EMAIL_DOMAINS);
    if (!validation.ok) {
      setError(validation.reason ?? "Invalid email.");
      return;
    }

    startTransition(async () => {
      try {
        const supabase = createClient();
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: email.trim(),
        });

        if (otpError) {
          if (otpError.status === 429) {
            setError("Too many requests — please wait a minute and try again.");
          } else {
            setError(otpError.message);
          }
          return;
        }

        setSent(true);
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border-hairline bg-surface-card px-8 py-10 shadow-card-hover">
          <div className="mb-8 text-center">
            <h1 className="font-serif text-2xl font-semibold text-primary">
              Brand Partnership Index
            </h1>
            <p className="mt-2 text-sm text-text-caption">
              Sign in with your work email to continue
            </p>
          </div>

          {sent ? (
            <div className="rounded-xl border border-accent/20 bg-accent/5 px-6 py-8 text-center">
              <span className="material-symbols-outlined mb-3 block text-4xl text-accent">
                mark_email_read
              </span>
              <p className="font-medium text-text-main">Check your inbox</p>
              <p className="mt-1 text-sm text-text-caption">
                We sent a sign-in link to{" "}
                <span className="font-medium text-text-main">{email}</span>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <div className="mb-1.5 flex items-center gap-1.5">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-text-main"
                  >
                    Work email
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      aria-label="Why work email?"
                      className="flex items-center text-text-caption transition-colors hover:text-accent"
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      onFocus={() => setShowTooltip(true)}
                      onBlur={() => setShowTooltip(false)}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        help
                      </span>
                    </button>
                    {showTooltip && (
                      <div className="absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 rounded-lg border border-border-hairline bg-primary px-3 py-2 text-xs leading-relaxed text-on-primary shadow-lg">
                        Reviewers must verify their role at a retail business.
                        Work emails let us confirm you represent a real store.
                        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-primary" />
                      </div>
                    )}
                  </div>
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@yourstore.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full rounded-lg border border-border-hairline bg-background px-4 py-2.5 text-sm text-text-main placeholder:text-text-caption/60 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-error/5 px-3 py-2.5 text-sm text-error">
                  <span className="material-symbols-outlined mt-0.5 text-[18px]">
                    error
                  </span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-on-primary/30 border-t-on-primary" />
                    Sending…
                  </>
                ) : (
                  "Send Magic Link"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
