import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-border-hairline mt-auto">
      <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-body-md font-semibold text-primary mb-3">
              Explore
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link
                  href="/brands"
                  className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  Brands
                </Link>
              </li>
              <li>
                <Link
                  href="/compare"
                  className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  Compare
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-body-md font-semibold text-primary mb-3">
              Participate
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/review"
                  className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  Review a Brand
                </Link>
              </li>
              <li>
                <Link
                  href="/signin"
                  className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-body-md font-semibold text-primary mb-3">
              Learn
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/methodology"
                  className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  About &amp; Methodology
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-body-md font-semibold text-primary mb-3">
              Brand Partnership Index
            </h4>
            <p className="text-sm text-on-surface-variant">
              Transparent, independent ratings of how brands support specialty
              retail.
            </p>
          </div>
        </div>

        {/* Sponsor strip */}
        <div className="border-t border-border-hairline pt-8 pb-6 flex flex-col items-center gap-4">
          <span className="font-label-caps text-label-caps text-text-caption uppercase">
            Sponsored by
          </span>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
            <a
              href="https://endvr.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/endvr-logo.webp"
                alt="ENDVR"
                className="h-14 object-contain"
              />
            </a>
            <a
              href="https://www.outsizeconsulting.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://static1.squarespace.com/static/66968cb18f45862ed4e165f3/t/6696bb4354fe535b592dffca/1721154374463/OC+Logo+Banner.png?format=300w"
                alt="Outsize Consulting"
                className="h-14 object-contain"
              />
            </a>
          </div>
        </div>

        <div className="border-t border-border-hairline pt-4 text-center">
          <p className="text-xs text-on-surface-variant">
            &copy; 2026 Brand Partnership Index. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
