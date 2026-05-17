import { DIMENSIONS, DIMENSION_SUBS, DIMENSION_ICONS } from "@/lib/constants";

export default function MethodologyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-2">
        Methodology
      </h1>
      <p className="text-lg text-on-surface-variant mb-10 leading-relaxed">
        How the Brand Partnership Index measures and scores wholesale brand
        partnerships. Every score is driven by real retailer feedback — no
        algorithms, no editorializing.
      </p>

      {/* Scoring overview */}
      <section className="mb-12">
        <h2 className="font-serif text-2xl font-semibold text-primary mb-4">
          Scoring Framework
        </h2>
        <div className="bg-surface-card border border-border-hairline rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <p className="text-3xl font-bold text-accent mb-1">1–5</p>
              <p className="text-sm text-on-surface-variant">
                Stars per sub-component
              </p>
            </div>
            <div className="text-center p-4">
              <p className="text-3xl font-bold text-accent mb-1">/20</p>
              <p className="text-sm text-on-surface-variant">
                Per dimension (sum of 4 sub-components)
              </p>
            </div>
            <div className="text-center p-4">
              <p className="text-3xl font-bold text-accent mb-1">/100</p>
              <p className="text-sm text-on-surface-variant">
                Overall (sum of 5 dimensions)
              </p>
            </div>
          </div>
          <div className="border-t border-border-hairline pt-4">
            <h3 className="font-semibold text-sm text-text-main mb-2">
              Score Tiers
            </h3>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-score-high text-white rounded-full text-xs font-bold">
                15–20 High
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-score-mid text-gray-900 rounded-full text-xs font-bold">
                10–14 Mid
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-score-low text-white rounded-full text-xs font-bold">
                1–9 Low
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Dimensions */}
      <section className="mb-12">
        <h2 className="font-serif text-2xl font-semibold text-primary mb-6">
          The Five Partnership Standards
        </h2>
        <div className="space-y-6">
          {DIMENSIONS.map((dim) => {
            const subs = DIMENSION_SUBS[dim.key] || [];
            const icon = DIMENSION_ICONS[dim.key];
            return (
              <div
                key={dim.key}
                className="bg-surface-card border border-border-hairline rounded-xl overflow-hidden"
              >
                <div className="bg-primary px-6 py-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-primary text-2xl">
                    {icon}
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-on-primary">
                      {dim.name}
                    </h3>
                    <p className="text-sm text-white/60">{dim.blurb}</p>
                  </div>
                </div>
                <div className="divide-y divide-border-hairline">
                  {subs.map((sub, i) => (
                    <div key={sub.key} className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-accent text-on-accent text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-medium text-text-main">
                            {sub.label}
                          </p>
                          <p className="text-sm text-on-surface-variant mt-0.5">
                            {sub.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Who can review */}
      <section className="mb-12">
        <h2 className="font-serif text-2xl font-semibold text-primary mb-4">
          Who Can Review?
        </h2>
        <div className="bg-surface-card border border-border-hairline rounded-xl p-6 space-y-3">
          <p className="text-on-surface-variant leading-relaxed">
            Reviews are submitted by verified specialty retailers — store owners,
            buyers, and managers who work with these brands daily. Every reviewer
            must sign in with a work email address to confirm their professional
            role.
          </p>
          <p className="text-on-surface-variant leading-relaxed">
            Reviewers can choose to display their store name or remain
            anonymous. Either way, only verified professionals can submit
            ratings, ensuring the data reflects real wholesale relationships.
          </p>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center">
        <a
          href="/review"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-on-accent rounded-full font-semibold hover:bg-accent/90 transition-colors"
        >
          Review a Brand
          <span className="material-symbols-outlined text-lg">
            arrow_forward
          </span>
        </a>
      </div>
    </div>
  );
}
