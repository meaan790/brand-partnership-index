"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Leaderboard" },
  { href: "/brands", label: "Brands" },
  { href: "/compare", label: "Compare" },
];

export function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-primary text-on-primary shadow-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-serif font-bold text-lg tracking-tight">
            Brand Partnership Index
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === l.href
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/review"
              className="ml-4 px-4 py-2 rounded-full bg-accent text-on-accent text-sm font-semibold hover:bg-accent/90 transition-colors"
            >
              Review a Brand
            </Link>
            <Link
              href="/signin"
              className="ml-2 px-3 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === l.href
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/review"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold text-accent"
            >
              Review a Brand
            </Link>
            <Link
              href="/signin"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-white/70 hover:text-white"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
