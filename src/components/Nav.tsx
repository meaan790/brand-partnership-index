"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Leaderboard" },
  { href: "/brands", label: "Brands" },
  { href: "/compare", label: "Compare" },
];

export function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="bg-background w-full top-0 sticky border-b border-border-hairline z-50">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-[1280px] mx-auto">
          <Link
            href="/"
            className="font-headline-md text-headline-md font-bold tracking-tight text-primary"
          >
            Brand Partnership Index
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
            <Link
              href="/review"
              className="font-body-md text-body-md bg-primary text-on-primary px-4 py-2 rounded hover:opacity-90 transition-opacity active:scale-[0.98]"
            >
              Review a Brand
            </Link>
            <Link
              href="/signin"
              className="font-body-md text-body-md text-primary hover:opacity-70 transition-opacity"
            >
              Sign In
            </Link>
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
            className="font-headline-md text-headline-md font-bold tracking-tight text-primary"
            onClick={() => setMobileOpen(false)}
          >
            Brand Partnership Index
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
          <Link
            href="/review"
            onClick={() => setMobileOpen(false)}
            className="text-body-lg font-body-lg bg-primary text-on-primary px-4 py-3 rounded text-center hover:opacity-90 transition-opacity"
          >
            Review a Brand
          </Link>
          <Link
            href="/signin"
            onClick={() => setMobileOpen(false)}
            className="text-body-lg font-body-lg py-3 text-primary text-center hover:opacity-70 transition-opacity"
          >
            Sign In
          </Link>
        </div>
      </div>
    </>
  );
}
