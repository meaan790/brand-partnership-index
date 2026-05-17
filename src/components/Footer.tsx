import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-primary text-on-primary mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-serif font-bold text-lg mb-3">
              Brand Partnership Index
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              The independent benchmark for how brands support their wholesale
              retail partners.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-3 text-white/40">
              Navigate
            </h4>
            <div className="space-y-2">
              <Link href="/" className="block text-sm text-white/60 hover:text-white transition-colors">
                Leaderboard
              </Link>
              <Link href="/brands" className="block text-sm text-white/60 hover:text-white transition-colors">
                Brands
              </Link>
              <Link href="/compare" className="block text-sm text-white/60 hover:text-white transition-colors">
                Compare
              </Link>
              <Link href="/methodology" className="block text-sm text-white/60 hover:text-white transition-colors">
                Methodology
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-3 text-white/40">
              Sponsored by
            </h4>
            <div className="flex flex-wrap items-center gap-6">
              <a href="https://endvr.io" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-white/60 hover:text-white transition-colors">
                ENDVR
              </a>
              <a href="https://www.outsizeconsulting.com" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-white/60 hover:text-white transition-colors">
                Outsize
              </a>
              <a href="https://www.lightspeedhq.com" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-white/60 hover:text-white transition-colors">
                Lightspeed
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Brand Partnership Index. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
