"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSignInModal } from "./SignInModalProvider";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { href: "/", label: "Leaderboard" },
  { href: "/brands", label: "Brands" },
  { href: "/compare", label: "Compare" },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { open: openSignIn } = useSignInModal();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    try {
      const supabase = createClient();

      supabase.auth.getUser().then(({ data }) => {
        if (mounted) {
          setUser(data.user);
          setLoading(false);
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } catch {
      if (mounted) setLoading(false);
      return () => { mounted = false; };
    }
  }, []);

  async function handleSignOut() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      router.push("/");
      router.refresh();
    } catch {
      // ignore
    }
  }

  function userInitial(): string {
    if (!user?.email) return "?";
    return user.email[0].toUpperCase();
  }

  const userRole = user?.user_metadata?.role as string | undefined;
  const isBrandUser = userRole === "brand";

  return (
    <>
      <nav className="bg-background w-full top-0 sticky border-b border-border-hairline z-50">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-[1280px] mx-auto">
          <Link
            href="/"
            className="flex flex-col"
          >
            <span className="font-headline-md text-headline-md font-bold tracking-tight text-primary">
              Brand Partnership Index
            </span>
            <span className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] tracking-wide uppercase text-on-surface-variant/60 font-medium">powered by</span>
              <img src="/endvr-logo.webp" alt="ENDVR" className="h-[14px] w-auto" />
            </span>
          </Link>
          <ul className="hidden md:flex gap-6 items-center">
            {NAV_LINKS.map((l) => {
              const isActive = pathname === l.href;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={
                      isActive
                        ? "text-primary font-bold border-b-2 border-primary pb-1 cursor-pointer transition-opacity active:opacity-70"
                        : "text-on-surface-variant hover:text-primary transition-colors cursor-pointer transition-opacity active:opacity-70"
                    }
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="hidden md:flex items-center gap-4">
            {!isBrandUser && (
              <Link
                href="/review"
                className="font-body-md text-body-md bg-primary text-on-primary px-5 py-2 rounded-full hover:opacity-90 transition-opacity active:scale-[0.98]"
              >
                Review a Brand
              </Link>
            )}
            {!loading && user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 cursor-pointer">
                  <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-semibold text-sm">
                    {userInitial()}
                  </span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-background-paper border border-border-hairline rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="px-4 py-3 border-b border-border-hairline">
                    <p className="font-caption text-caption text-text-caption truncate">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2.5 text-sm text-on-background hover:bg-surface-container-low transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    className="block px-4 py-2.5 text-sm text-on-background hover:bg-surface-container-low transition-colors"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-sm text-error hover:bg-surface-container-low transition-colors cursor-pointer rounded-b-lg"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : !loading ? (
              <button
                onClick={() => openSignIn()}
                className="font-body-md text-body-md text-primary hover:opacity-70 transition-opacity cursor-pointer"
              >
                Sign In
              </button>
            ) : null}
          </div>
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 text-primary"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined text-[28px]">menu</span>
          </button>
        </div>
      </nav>

      {/* Mobile fullscreen menu */}
      <div
        className={`fixed inset-0 z-[100] bg-background ${mobileOpen ? "flex" : "hidden"} flex-col`}
      >
        <div className="flex justify-between items-center px-margin-mobile py-4 border-b border-border-hairline">
          <Link
            href="/"
            className="flex flex-col"
            onClick={() => setMobileOpen(false)}
          >
            <span className="font-headline-md text-headline-md font-bold tracking-tight text-primary">
              Brand Partnership Index
            </span>
            <span className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] tracking-wide uppercase text-on-surface-variant/60 font-medium">powered by</span>
              <img src="/endvr-logo.webp" alt="ENDVR" className="h-[14px] w-auto" />
            </span>
          </Link>
          <button
            className="flex items-center justify-center w-10 h-10 text-primary"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined text-[28px]">
              close
            </span>
          </button>
        </div>
        <div className="flex flex-col gap-2 px-margin-mobile py-6">
          {NAV_LINKS.map((l) => {
            const isActive = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={
                  isActive
                    ? "text-body-lg font-body-lg py-3 text-primary font-bold"
                    : "text-body-lg font-body-lg py-3 text-on-surface-variant hover:text-primary transition-colors"
                }
              >
                {l.label}
              </Link>
            );
          })}
          <hr className="border-border-hairline my-2" />
          {!isBrandUser && (
            <Link
              href="/review"
              onClick={() => setMobileOpen(false)}
              className="text-body-lg font-body-lg bg-primary text-on-primary px-4 py-3 rounded-full text-center hover:opacity-90 transition-opacity"
            >
              Review a Brand
            </Link>
          )}
          {!loading && user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="text-body-lg font-body-lg py-3 text-primary text-center hover:opacity-70 transition-opacity"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleSignOut();
                }}
                className="text-body-lg font-body-lg py-3 text-error text-center hover:opacity-70 transition-opacity cursor-pointer"
              >
                Sign Out
              </button>
            </>
          ) : !loading ? (
            <button
              onClick={() => {
                setMobileOpen(false);
                openSignIn();
              }}
              className="text-body-lg font-body-lg py-3 text-primary text-center hover:opacity-70 transition-opacity cursor-pointer"
            >
              Sign In
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}
