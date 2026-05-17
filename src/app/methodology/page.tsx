import Link from "next/link";
import { DIMENSIONS, DIMENSION_SUBS } from "@/lib/constants";

const DIM_WHATS: Record<string, string> = {
  website:
    "How brand.com presents and behaves on its own digital surface.",
  pricing:
    "MAP enforcement and pricing discipline across the channel beyond brand.com.",
  local:
    "Brand actively routing customers to the retailers carrying it.",
  floor:
    "Brand investment in the people and the partnership that drive in-store sell-through.",
  pro:
    "Discipline on internal discount programs that affect retail customer flow.",
};

export default function MethodologyPage() {
  return (
    <div className="max-w-[1280px] mx-auto w-full px-margin-mobile md:px-margin-desktop py-12">
      {/* Hero / About */}
      <section className="max-w-3xl mb-section-gap scroll-mt-24">
        <span className="font-label-caps text-label-caps text-text-caption uppercase">
          Methodology
        </span>
        <h1 className="font-display-lg text-display-lg text-text-main mt-2 mb-6">
          How we measure brand–retailer partnerships.
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-6">
          The Brand Partnership Index scores how well brands support the
          specialty retailers who carry them. Every score is built from verified
          reviews submitted by independent retailers — the people who actually
          live with each brand&apos;s wholesale program.
        </p>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          We score five Brand Partnership Standards, each on a 0–20 scale. Each
          standard has four sub-components that retailers rate with 1–5 stars.
          The standard&apos;s score is the sum of its four sub-component ratings.
          The five standard scores sum to an overall 0–100 score for the brand,
          updated continuously as new reviews come in.
        </p>
      </section>

      {/* About the Index */}
      <section id="about" className="mb-section-gap scroll-mt-24">
        <h2 className="font-headline-md text-headline-md text-primary mb-6">
          About the Brand Partnership Index
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: "verified",
              title: "Independent and impartial",
              body: "The Brand Partnership Index is not owned by any brand. Scores are built entirely from anonymous retailer reviews. No brand can pay to influence its ranking.",
            },
            {
              icon: "visibility_off",
              title: "Anonymous and aggregated",
              body: "Every review is anonymous. Individual responses are never shared with brands. Scores are aggregated across multiple retailers so no single review can skew a result.",
            },
            {
              icon: "handshake",
              title: "Sponsors support, not influence",
              body: "Sponsors help fund the platform's operations. They have zero influence on scores, methodology, or which brands appear. Sponsorship and ratings are completely separate.",
            },
            {
              icon: "storefront",
              title: "Built for specialty retail",
              body: "Only verified specialty retailers can submit reviews. This ensures scores reflect the real wholesale experience, not consumer sentiment or social media buzz.",
            },
          ].map((item) => (
            <div
              key={item.icon}
              className="bg-surface-card border border-border-hairline rounded-lg p-6 flex gap-4"
            >
              <span
                className="material-symbols-outlined text-accent text-[28px] shrink-0 mt-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {item.icon}
              </span>
              <div>
                <h3 className="font-body-md font-semibold text-primary mb-2">
                  {item.title}
                </h3>
                <p className="font-body-md text-on-surface-variant">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mb-section-gap">
        <h2 className="font-headline-md text-headline-md text-primary mb-6">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              num: "1",
              title: "Verify & Review",
              body: "Specialty retailers verify their identity, then review brand partners across five partnership standards using a simple star-rating system.",
            },
            {
              num: "2",
              title: "Scores Update",
              body: "Each brand's score updates on the public leaderboard as new reviews come in. Scores are weighted toward recent submissions to stay current.",
            },
            {
              num: "3",
              title: "Brands Respond",
              body: "Brands claim their brand, see detailed feedback from retailers, and track their progress over time. Better partnerships start with better data.",
            },
          ].map((step) => (
            <div
              key={step.num}
              className="bg-surface-container-low p-6 rounded"
            >
              <div className="text-2xl font-bold text-primary mb-2">
                {step.num}
              </div>
              <h3 className="font-body-lg text-body-lg font-semibold mb-2">
                {step.title}
              </h3>
              <p className="text-on-surface-variant">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TOC + Content */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-section-gap">
        <aside className="lg:col-span-3 lg:sticky lg:top-24 self-start">
          <div className="border border-border-hairline rounded p-4 bg-surface-card">
            <span className="font-label-caps text-label-caps text-text-caption uppercase block mb-3">
              Contents
            </span>
            <ul className="flex flex-col gap-2 font-body-md text-body-md">
              {[
                { href: "#about", label: "About the Index" },
                { href: "#dimensions", label: "The five dimensions" },
                { href: "#calculation", label: "How scores are calculated" },
                { href: "#tiers", label: "Score tiers" },
                { href: "#reviewers", label: "Who can review" },
                { href: "#claims", label: "Claimed vs unclaimed brands" },
                { href: "#updates", label: "Update cadence" },
              ].map((item) => (
                <li key={item.href}>
                  <a
                    className="text-on-surface-variant hover:text-primary transition-colors"
                    href={item.href}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <article className="lg:col-span-9 flex flex-col gap-section-gap">
          {/* Dimensions */}
          <div id="dimensions" className="scroll-mt-24">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-2">
              The five dimensions
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-8">
              Each standard has four sub-components. Retailers rate each one on a
              1–5 star scale. Those four ratings add up to a score out of 20 for
              that standard. A brand&apos;s score is based on all verified
              retailer reviews, with more recent reviews counting a bit more.
            </p>
            <div className="flex flex-col gap-6">
              {DIMENSIONS.map((d) => {
                const subs = DIMENSION_SUBS[d.key] || [];
                return (
                  <div
                    key={d.key}
                    id={`dim-${d.key}`}
                    className="border border-border-hairline rounded bg-surface-card p-card-padding scroll-mt-24"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="font-headline-md text-headline-md text-primary m-0">
                        {d.name}
                      </h3>
                      <span className="font-label-caps text-label-caps bg-surface-container text-on-surface-variant px-2 py-1 rounded-full whitespace-nowrap">
                        0 – 20
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                      <strong>What it measures.</strong> {DIM_WHATS[d.key]}
                    </p>
                    <p className="font-label-caps text-label-caps text-text-caption uppercase mb-2">
                      Sub-components (each rated 1–5 stars)
                    </p>
                    <ul className="font-body-md text-body-md text-on-surface-variant list-disc pl-6 flex flex-col gap-1">
                      {subs.map((s) => (
                        <li key={s.key}>{s.label}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calculation */}
          <div id="calculation" className="scroll-mt-24">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
              How scores are calculated
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">
              Each retailer review rates four sub-components per standard on a
              1–5 star scale. Those four ratings add up to give a score out of
              20. A brand&apos;s score for each standard is the average across
              all verified reviews, with newer reviews weighted a bit more
              heavily.
            </p>
            <div className="bg-surface-card border border-border-hairline rounded p-card-padding mb-4">
              <p className="font-data-tabular text-data-tabular text-text-main mb-2">
                overall = website + pricing + local + floor + pro
              </p>
              <p className="font-caption text-caption text-text-caption">
                Where each standard is scored 0–20 (sum of four 1–5 star
                sub-component ratings). The five standards are equally weighted
                and sum directly to a 0–100 overall.
              </p>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Brands need a minimum of 6 verified reviews to receive an overall
              score. Below that threshold, standard scores display individually
              but no aggregate is published.
            </p>
          </div>

          {/* Tiers */}
          <div id="tiers" className="scroll-mt-24">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
              Score tiers
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">
              Color tiers help retailers and brands quickly read where a score
              sits. They apply to both individual standard scores (0–20) and the
              overall score (0–100).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              {[
                {
                  bg: "bg-[#3F7556]",
                  txt: "text-white",
                  label: "High",
                  range: "16–20 / 80–100",
                  desc: "Best-in-class. Brand consistently exceeds retailer expectations on this standard.",
                },
                {
                  bg: "bg-[#E8C547]",
                  txt: "text-gray-900",
                  label: "Mid–high",
                  range: "13–15 / 65–79",
                  desc: "Reliable partner. Strong fundamentals with room to improve in specific areas.",
                },
                {
                  bg: "bg-[#D97A35]",
                  txt: "text-white",
                  label: "Mid",
                  range: "10–12 / 50–64",
                  desc: "Inconsistent. Retailers report meaningful gaps in standards or execution.",
                },
                {
                  bg: "bg-[#B23B33]",
                  txt: "text-white",
                  label: "Low",
                  range: "0–9 / 0–49",
                  desc: "Significant concerns. Retailers consistently flag issues that hurt their business.",
                },
              ].map((tier) => (
                <div
                  key={tier.label}
                  className="border border-border-hairline rounded p-5 bg-surface-card flex items-start gap-4"
                >
                  <span
                    className={`${tier.bg} ${tier.txt} font-data-tabular text-data-tabular px-3 py-1 rounded shrink-0`}
                  >
                    {tier.label}
                  </span>
                  <div>
                    <p className="font-body-md text-body-md text-text-main">
                      <strong>{tier.range}</strong>
                    </p>
                    <p className="font-caption text-caption text-text-caption">
                      {tier.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Public Commitments */}
          <section className="mb-section-gap">
            <h2 className="font-headline-md text-headline-md text-primary mb-4">
              Public Commitments
            </h2>
            <p className="text-on-surface-variant mb-6">
              Brands that claim their profile can add public commitments —
              voluntary statements about how they intend to support their retail
              partners. Commitments are visible on brand profiles and help
              retailers understand what a brand is actively working on.
            </p>
            <p className="text-on-surface-variant mb-6">
              Commitments are fully editable by the brand. Common examples
              include:
            </p>
            <div className="space-y-4">
              {[
                {
                  title: "MAP Defense",
                  body: "Actively enforcing minimum advertised pricing across all channels, including third-party marketplaces.",
                },
                {
                  title: "Retail Investment Parity",
                  body: "Investing in retail partner support (training, reps, merchandising) at a level proportional to DTC investment.",
                },
                {
                  title: "Seasonal Calendar Sharing",
                  body: "Sharing seasonal launch calendars and promotional plans with retail partners ahead of time.",
                },
                {
                  title: "DTC Firewall",
                  body: "Maintaining clear separation between DTC and wholesale pricing, promotions, and inventory allocation.",
                },
              ].map((c) => (
                <div
                  key={c.title}
                  className="bg-surface-container-low p-4 rounded"
                >
                  <h3 className="font-body-lg font-semibold text-primary mb-1">
                    {c.title}
                  </h3>
                  <p className="text-on-surface-variant text-sm">{c.body}</p>
                </div>
              ))}
            </div>
            <p className="text-on-surface-variant mt-4 text-sm">
              Brands can also add their own custom commitments beyond these
              examples. Commitments are self-declared and do not directly affect
              index scores, but retailer reviews may reflect whether a brand
              follows through on what it has committed to.
            </p>
          </section>

          {/* Reviewers */}
          <div id="reviewers" className="scroll-mt-24">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
              Who can review
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">
              Only verified specialty retailers can submit reviews. Verification
              requires:
            </p>
            <ul className="font-body-md text-body-md text-on-surface-variant list-disc pl-6 flex flex-col gap-2 mb-4">
              <li>
                An active wholesale account with the brand being reviewed
                (verified via the brand&apos;s B2B portal or invoice).
              </li>
              <li>
                A staff member with purchasing or floor-level visibility (buyer,
                manager, owner, or rep).
              </li>
              <li>
                A confirmed retailer business email matching a registered
                specialty retail location.
              </li>
            </ul>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Reviews are anonymized at the individual level — only the retailer
              business name and city are shown. Personal identities are never
              published.
            </p>
          </div>

          {/* Claims */}
          <div id="claims" className="scroll-mt-24">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
              Claimed vs unclaimed brands
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">
              Every brand in the index has a profile, claimed or not. A{" "}
              <strong>claimed brand</strong> means a verified representative from
              the brand has accepted access to manage their public statements,
              respond to reviews, and track public commitments.
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Claiming a brand does not affect the brand&apos;s scores. Scores
              are always derived from retailer reviews and are never editable by
              the brand. What claiming changes is what the brand can{" "}
              <em>say back</em> — their dimension statements, public
              commitments, and review responses.
            </p>
          </div>

          {/* Updates */}
          <div id="updates" className="scroll-mt-24">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
              Update cadence
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">
              Standard scores recompute daily as new verified reviews come in.
              Overall scores update weekly, every Monday. The &ldquo;Change&rdquo;
              column on the leaderboard shows how a brand&apos;s score compares
              to the same week last year.
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Reviews older than 24 months drop out of the active dataset. That
              way, a brand&apos;s score reflects how it&apos;s operating today —
              not what it did two years ago.
            </p>
          </div>
        </article>
      </section>

      {/* CTA strip */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-16">
        <div className="bg-surface-card border border-border-hairline rounded-lg p-6 md:p-8 flex flex-col justify-between">
          <div>
            <span className="font-label-caps text-label-caps text-accent uppercase mb-3 block">
              For Retailers
            </span>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-2">
              Give your partners honest feedback
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">
              Rate 5 dimensions in under 2 minutes. Anonymous, verified, and it
              drives real change.
            </p>
          </div>
          <Link
            href="/review"
            className="bg-primary text-on-primary font-semibold px-6 py-3 rounded hover:opacity-90 transition-opacity text-center active:scale-[0.98]"
          >
            Review a Brand
          </Link>
        </div>
        <div className="bg-surface-card border border-border-hairline rounded-lg p-6 md:p-8 flex flex-col justify-between">
          <div>
            <span className="font-label-caps text-label-caps text-accent uppercase mb-3 block">
              For Brands
            </span>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-2">
              See how retailers rate your support
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">
              Claim your brand to access detailed scores, benchmark against
              competitors, and respond to feedback.
            </p>
          </div>
          <Link
            href="/signin"
            className="bg-primary text-on-primary font-semibold px-6 py-3 rounded hover:opacity-90 transition-opacity text-center active:scale-[0.98]"
          >
            Claim Your Brand
          </Link>
        </div>
      </section>
    </div>
  );
}
