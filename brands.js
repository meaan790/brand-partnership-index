// Shared data + helpers for the Brand Partnership Index concept.
// Loaded as a plain script (no modules) so both static HTML pages can use it.

window.DIMENSIONS = [
  { key: "website", name: "Website Standards",   short: "Website",  blurb: "brand.com behavior" },
  { key: "pricing", name: "Pricing Standards",   short: "Pricing",  blurb: "MAP enforcement" },
  { key: "local",   name: "Shop Local Support",  short: "Local",    blurb: "demand routing" },
  { key: "floor",   name: "Shop Floor Support",  short: "Floor",    blurb: "investment in staff" },
  { key: "pro",     name: "Pro Deal Standards",  short: "Pro",      blurb: "discount channel discipline" }
];

window.DIMENSION_SUBS = {
  website: [
    { key: "sale_outlet",    label: "Sale & Outlet Sections",
      desc: "Whether brand.com keeps its surface free of permanent sale tabs, outlet links, or markdown grids that compete with retailer pricing.",
      anchor5: "Clean .com — no permanent sale sections",
      anchor1: "Aggressive permanent sale real estate",
      prompt: "e.g., Brand runs a permanent 40% outlet section that undercuts our floor price\u2026" },
    { key: "visitor_popups", label: "Visitor Discount Popups",
      desc: "Whether brand.com avoids aggressive sign-up popups and cart-abandonment discounts targeting individual visitors.",
      anchor5: "No discount popups for visitors",
      anchor1: "Aggressive sign-up and cart-abandonment popups",
      prompt: "e.g., 15% sign-up popup for every new visitor, plus 20% abandoned-cart emails\u2026" },
    { key: "flash_cadence",  label: "Flash Sale Cadence",
      desc: "How often brand.com runs short, time-limited promotional pricing that undercuts retailer windows.",
      anchor5: "Rare or no flash sales",
      anchor1: "Constant flash sales",
      prompt: "e.g., Weekly flash sales every Friday that drive customers away from stores\u2026" },
    { key: "dtc_cashback",   label: "DTC Cashback Promotions",
      desc: "Whether brand.com runs cashback offers redeemable only at its own checkout, capturing demand that could have routed to retail.",
      anchor5: "No DTC-only cashback offers",
      anchor1: "Aggressive .com-only cashback promotions",
      prompt: "e.g., Brand offers permanent 10% Rakuten cashback, making their DTC price always lower than our shelf price\u2026" }
  ],
  pricing: [
    { key: "unauthorized_policing", label: "Unauthorized Reseller Policing",
      desc: "Active MAP enforcement on Amazon, marketplaces, and gray-market sellers.",
      anchor5: "Vigilant policing across all channels",
      anchor1: "MAP violations go unenforced",
      prompt: "e.g., Amazon listings consistently 15% below MAP and gray-market sellers go unchecked\u2026" },
    { key: "reseller_comp",         label: "Authorized Reseller Compliance",
      desc: "Pricing consistency maintained across approved retail partners.",
      anchor5: "Consistent pricing across the network",
      anchor1: "Pricing chaos across resellers",
      prompt: "e.g., Online-only retailers undercut brick-and-mortar by 10\u201320%\u2026" },
    { key: "map_response",          label: "MAP Violation Response",
      desc: "Speed at which the brand acts on flagged price violations.",
      anchor5: "Response within days",
      anchor1: "No response, or takes weeks",
      prompt: "e.g., We reported a violation in March and it\u2019s still live in June\u2026" },
    { key: "price_stable",          label: "Wholesale Price Stability",
      desc: "Pricing predictability without mid-season changes, MSRP shifts, or surprises.",
      anchor5: "Stable, predictable pricing",
      anchor1: "Constant mid-season price changes",
      prompt: "e.g., Wholesale cost went up mid-season with no advance notice\u2026" }
  ],
  local: [
    { key: "local_stock",       label: "Local Stock on Product Pages",
      desc: "Real-time retailer inventory shown on each product page, with a buy-from-this-store option.",
      anchor5: "Live retailer stock on every product page",
      anchor1: "No retailer stock or store links shown",
      prompt: "e.g., Brand.com shows no retailer stock or \u2018find in store\u2019 link on product pages\u2026" },
    { key: "finder_visibility", label: "Store Finder Visibility",
      desc: "\u201cFind a retailer\u201d presence in primary navigation, footer, and contextual placements throughout brand.com.",
      anchor5: "Prominent across the site",
      anchor1: "Buried or completely absent",
      prompt: "e.g., Dealer locator is buried three clicks deep in the footer\u2026" },
    { key: "dealer_accuracy",   label: "Dealer Database Accuracy",
      desc: "Quality of the underlying retailer database \u2014 searchable, filterable, current, and accurate to actual stocking partners.",
      anchor5: "Clean, current, and accurate",
      anchor1: "Stale data with wrong locations",
      prompt: "e.g., Store finder shows closed locations and wrong phone numbers\u2026" },
    { key: "cashback_routing",  label: "Cashback Routing to Retail",
      desc: "Brand-funded cashback campaigns that drive consumer demand to retail doors with verified redemption.",
      anchor5: "Active retail cashback programs",
      anchor1: "No retail cashback \u2014 DTC only",
      prompt: "e.g., Brand runs 15% Rakuten cashback on DTC but offers zero equivalent incentive for buying in-store\u2026" }
  ],
  floor: [
    { key: "coop_marketing",    label: "Co-op Marketing Programs",
      desc: "Brand-funded marketing dollars made available to retailers, with clear allocation and accountability.",
      anchor5: "Generous, easy-to-claim co-op funds",
      anchor1: "No co-op or impossible to claim",
      prompt: "e.g., Brand offers 3% co-op but the claim process is so complex nobody uses it\u2026" },
    { key: "mobile_incentives", label: "Mobile Incentives & Education",
      desc: "Sales rewards and product education delivered to associates on their phones, accessible on the shop floor.",
      anchor5: "Active mobile-first training and SPIFs",
      anchor1: "No mobile programs for associates",
      prompt: "e.g., Great app-based training with SPIFs, but only works on iOS\u2026" },
    { key: "clinics_events",    label: "In-Store Clinics & Events",
      desc: "Physical brand-led product education and consumer events delivered at retail locations.",
      anchor5: "Regular, well-attended clinics",
      anchor1: "No in-store presence",
      prompt: "e.g., Brand hasn\u2019t run a clinic or demo in our store for over a year\u2026" },
    { key: "rep_merch",         label: "Rep & Merchandising Support",
      desc: "Brand sales rep visits, POS displays, signage, and in-store visual materials.",
      anchor5: "Active rep cadence with strong materials",
      anchor1: "No rep visits or merchandising support",
      prompt: "e.g., Rep visits quarterly with new samples and always refreshes our endcap\u2026" }
  ],
  pro: [
    { key: "eligibility",      label: "Pro Deal Eligibility",
      desc: "Tightness of who qualifies for industry and professional discounts.",
      anchor5: "Strict gating \u2014 verified industry only",
      anchor1: "Open to anyone with an email address",
      prompt: "e.g., Anyone with a social media account seems to get pro pricing\u2026" },
    { key: "purchase_caps",    label: "Annual Purchase Caps",
      desc: "Limits on how much a single pro deal account can purchase at discount each year.",
      anchor5: "Strict per-user caps enforced",
      anchor1: "No purchase limits",
      prompt: "e.g., No visible cap \u2014 pro athletes buy dozens of units at 50% off\u2026" },
    { key: "insider_controls", label: "Insider Discount Controls",
      desc: "Caps and enforcement on friends-and-family and employee discount channels.",
      anchor5: "Controlled and actively enforced",
      anchor1: "Unpoliced \u2014 codes shared freely",
      prompt: "e.g., F&F codes get shared on Reddit and employee store is wide open\u2026" },
    { key: "discount_depth",   label: "Pro Deal Discount Depth",
      desc: "Whether pro deal pricing stays at or above the retailer\u2019s wholesale cost.",
      anchor5: "Pro price at or above wholesale",
      anchor1: "Pro price undercuts retailer\u2019s cost",
      prompt: "e.g., Pro deal users buying at 50% off MSRP while our wholesale is 55% of MSRP\u2026" }
  ]
};

window.DIMENSION_ICONS = {
  website: "language",
  pricing: "payments",
  local:   "storefront",
  floor:   "support_agent",
  pro:     "badge"
};

window.BRANDS = [
  {
    name: "Brooks", domain: "brooksrunning.com", categories: ["Running"],
    description: "A leading manufacturer of high-performance running footwear, apparel, and accessories, known for its strong commitment to specialty retail partners.",
    score: 88, dims: [18, 18, 17, 18, 17], change: "+12", spark: [18, 10, 14, 4],
    reviews: 142, claimed: true,
    summary: "Brooks consistently demonstrates excellence in inventory flow and floor support, achieving an industry-leading score in <strong class='text-secondary'>Shop Floor Support</strong>. Retailers highlight their reliable <strong class='text-secondary'>Pricing Standards</strong> enforcement and transparent promotional calendar as key drivers of margin stability."
  },
  { name: "Hoka",              domain: "hoka.com",                    categories: ["Running", "Outdoor"],         description: "A premium running and outdoor footwear brand recognized for maximum cushioning and rapid product innovation.",                       score: 78, dims: [17, 14, 18, 15, 14], change: "+18", spark: [20, 16, 12, 6],  reviews: 38 },
  { name: "Patagonia",         domain: "patagonia.com",               categories: ["Outdoor", "Surf", "Ski"],     description: "An outdoor apparel and gear company known for environmental stewardship and lifetime repair commitments.",                            score: 76, dims: [16, 14, 16, 16, 14], change: "+9",  spark: [20, 18, 16, 10], reviews: 31 },
  { name: "Nemo",              domain: "nemoequipment.com",           categories: ["Outdoor"],                    description: "Designer of innovative outdoor sleeping bags, tents, and camping gear, born from a New Hampshire engineering studio.",               score: 75, dims: [15, 15, 16, 15, 14], change: "-3",  spark: [10, 12, 15, 16], reviews: 12 },
  { name: "Big Agnes",         domain: "bigagnes.com",                categories: ["Outdoor"],                    description: "A Steamboat Springs–based maker of lightweight tents, sleeping bags, and pads built for backcountry trips.",                          score: 73, dims: [15, 14, 15, 15, 14], change: "-1",  spark: [10, 12, 14, 15], reviews: 14 },
  { name: "YETI",              domain: "yeti.com",                    categories: ["Outdoor"],                    description: "Premium coolers, drinkware, and outdoor lifestyle products engineered for durability and performance.",                              score: 71, dims: [13, 16, 14, 14, 14], change: "+2",  spark: [12, 10, 14, 11], reviews: 22 },
  { name: "Black Diamond",     domain: "blackdiamondequipment.com",   categories: ["Outdoor", "Ski"],             description: "Climbing, skiing, and mountain sports equipment, designed by climbers in Salt Lake City.",                                            score: 70, dims: [14, 14, 14, 15, 13], change: "+1",  spark: [14, 13, 13, 12], reviews: 18 },
  { name: "Salomon",           domain: "salomon.com",                 categories: ["Running", "Outdoor", "Ski"],  description: "French maker of trail running, hiking, and ski equipment with a strong heritage in alpine sport.",                                   score: 67, dims: [13, 13, 14, 14, 13], change: "0",   spark: [13, 14, 12, 13], reviews: 16 },
  { name: "On",                domain: "on.com",                      categories: ["Running"],                    description: "Swiss running brand known for CloudTec sole technology and rapid growth in performance and lifestyle categories.",                   score: 65, dims: [14, 12, 14, 13, 12], change: "+6",  spark: [18, 15, 12, 10], reviews: 11 },
  { name: "Cotopaxi",          domain: "cotopaxi.com",                categories: ["Outdoor"],                    description: "Outdoor apparel and gear maker with a benefit corporation model and a focus on humanitarian impact.",                                score: 62, dims: [12, 13, 12, 13, 12], change: "+4",  spark: [16, 14, 11, 8],  reviews: 9  },
  { name: "Smartwool",         domain: "smartwool.com",               categories: ["Outdoor", "Running"],         description: "Performance merino wool socks and apparel, designed in Steamboat Springs, Colorado.",                                                 score: 60, dims: [12, 12, 12, 12, 12], change: "-2",  spark: [12, 14, 13, 15], reviews: 10 },
  { name: "Arc'teryx",         domain: "arcteryx.com",                categories: ["Outdoor", "Ski"],             description: "Vancouver-based technical apparel and equipment company known for premium alpine outerwear.",                                        score: 58, dims: [12, 12, 11, 13, 10], change: "-5",  spark: [8, 12, 16, 20],  reviews: 13 },
  { name: "KEEN",              domain: "keenfootwear.com",            categories: ["Outdoor"],                    description: "American footwear company best known for hybrid sandal-shoes and an emphasis on toe protection.",                                    score: 56, dims: [11, 11, 12, 12, 10], change: "+14", spark: [20, 16, 14, 8],  reviews: 8  },
  { name: "Osprey",            domain: "osprey.com",                  categories: ["Outdoor"],                    description: "Backpack and travel pack specialist, designed in Cortez, Colorado, with a guaranteed-for-life warranty.",                            score: 55, dims: [11, 11, 11, 12, 10], change: "-1",  spark: [14, 13, 15, 16], reviews: 11 },
  { name: "Kelty",             domain: "kelty.com",                   categories: ["Outdoor"],                    description: "American outdoor brand offering accessible camping gear, packs, and family-friendly outdoor equipment.",                             score: 52, dims: [10, 11, 10, 11, 10], change: "+1",  spark: [14, 15, 13, 14], reviews: 7  },
  { name: "The North Face",    domain: "thenorthface.com",            categories: ["Outdoor", "Ski"],             description: "Global outdoor brand offering technical apparel, footwear, and equipment across alpine, run, and lifestyle categories.",            score: 48, dims: [7, 11, 9, 12, 9], change: "-4",  spark: [10, 12, 15, 18], reviews: 17 },
  { name: "Kuhl",              domain: "kuhl.com",                    categories: ["Outdoor"],                    description: "Salt Lake City–based outdoor apparel brand known for durable mountain pants and casual mountain style.",                             score: 45, dims: [8, 10, 8, 10, 9], change: "+2",  spark: [18, 16, 15, 14], reviews: 6  },
  { name: "Columbia",          domain: "columbia.com",                categories: ["Outdoor"],                    description: "Mass-market outdoor apparel company with a wide range of value-oriented technical clothing and footwear.",                           score: 42, dims: [7, 10, 7, 10, 8], change: "-6",  spark: [10, 14, 18, 20], reviews: 15 },
  { name: "Mountain Hardwear", domain: "mountainhardwear.com",        categories: ["Outdoor"],                    description: "Technical alpine and climbing apparel and equipment brand, originally spun out of Sierra Designs.",                                  score: 40, dims: [7, 9, 7, 10, 7], change: "0",   spark: [16, 15, 16, 16], reviews: 7  },
  { name: "prAna",             domain: "prana.com",                   categories: ["Outdoor"],                    description: "Yoga, climbing, and travel apparel brand emphasizing sustainable materials and natural fibers.",                                     score: 38, dims: [6, 8, 7, 9, 8], change: "-3",  spark: [12, 15, 14, 16], reviews: 7  }
];

// Generic statements written in "We" voice so they read naturally for any claimed brand.
window.STATEMENT_TEMPLATES = {
  "Website Standards": "We hold the line on brand.com behavior. No flash sales, no liquidation banners, and our DTC PDPs link to local stockists when in-stock inventory exists within 50 miles of the shopper.",
  "Pricing Standards":  "We hold MAP across all wholesale partners and police violations within 48 hours. Our dedicated team monitors online pricing daily to ensure a level playing field for our specialty accounts.",
  "Shop Local Support": "Every retailer locator search routes traffic to specialty accounts before our own DTC checkout. We measure routed sessions weekly and share the dashboard with our top accounts quarterly.",
  "Shop Floor Support": "Tech reps visit every Tier 1 and Tier 2 account at least twice a season. We fund staff training, sample programs, and clinic stipends for any shop running an in-store event.",
  "Pro Deal Standards": "Pro deals are limited to verified industry professionals at 40% off, capped at 4 units per category per year. We do not stack additional discounts through any third-party employee perk platform."
};

// Reusable retailer-review templates. Generic enough to read naturally for any brand.
// Per-dimension scores are individual-level: 0-20 (sum of 4 sub-component star ratings).
window.REVIEW_TEMPLATES = [
  {
    retailer: "Runners Roost", location: "Austin, TX", ago: "2 weeks ago",
    dimScores: [17, 18, 19, 20, 16],
    quote: "Best in class for shop floor support. Their tech reps are always available, and the training materials they provide make a noticeable difference in sell-through.",
    response: { author: "Brand Representative", ago: "1 week ago",
      body: "Thank you. We invest heavily in our tech reps because we know the shop floor is where the magic happens." }
  },
  {
    retailer: "Fleet Feet", location: "Chicago, IL", ago: "1 month ago",
    dimScores: [15, 16, 14, 18, 13],
    quote: "MAP discipline is solid, but we've seen some inventory routing prioritize their own DTC channel during the holiday rush. Still one of our strongest partners overall."
  },
  {
    retailer: "Mountain Sports Shop", location: "Boulder, CO", ago: "6 weeks ago",
    dimScores: [18, 17, 19, 19, 15],
    quote: "Their seasonal calendar is shared months ahead. Knowing exactly when promo windows hit lets us plan our open-to-buy with confidence — that's rare in this industry."
  }
];

window.PLEDGES = [
  "MAP Defense Pledge",
  "Investment Parity Pledge",
  "Calendar Sharing Pledge",
  "DTC Firewall Pledge"
];

// Helpers ------------------------------------------------------------------

window.tierBg = function (score) {
  if (score >= 15) return "bg-score-high text-white";
  if (score >= 10) return "bg-score-mid text-gray-900";
  return "bg-score-low text-white";
};
window.tierBg100 = function (score) {
  if (score >= 75) return "bg-score-high text-white";
  if (score >= 50) return "bg-score-mid text-gray-900";
  return "bg-score-low text-white";
};
window.tierBar = function (score) {
  if (score >= 15) return "bg-score-high";
  if (score >= 10) return "bg-score-mid";
  return "bg-score-low";
};
window.tierText = function (score) {
  if (score >= 15) return "text-score-high";
  if (score >= 10) return "text-score-mid";
  return "text-score-low";
};
window.strokeColor = function (score) {
  if (score >= 75) return "#3F7556";
  if (score >= 50) return "#C8A53D";
  return "#A24E3C";
};
window.changeClass = function (change) {
  if (change.startsWith("+") && change !== "+0") return "text-score-high";
  if (change.startsWith("-")) return "text-score-low";
  return "text-text-caption";
};
window.getBrandByName = function (name) {
  if (!name) return null;
  return window.BRANDS.find(b => b.name.toLowerCase() === name.toLowerCase()) || null;
};

// Generate a plausible 5-bucket score distribution centered at the brand's score.
// Buckets: 0:1-4, 1:5-8, 2:9-12, 3:13-16, 4:17-20
window.genDist = function (score, total) {
  const mode = Math.min(4, Math.max(0, Math.floor(score / 4)));
  const weights = [0, 1, 2, 3, 4].map(b => Math.exp(-Math.pow(b - mode, 2) / 1.5));
  const sum = weights.reduce((a, b) => a + b, 0);
  const counts = weights.map(w => Math.round((w / sum) * total));
  const diff = total - counts.reduce((a, b) => a + b, 0);
  counts[mode] += diff;
  return counts;
};

window.topDim = function (dims) {
  let i = 0;
  for (let j = 1; j < dims.length; j++) if (dims[j] > dims[i]) i = j;
  return { name: window.DIMENSIONS[i].name, score: dims[i] };
};
window.bottomDim = function (dims) {
  let i = 0;
  for (let j = 1; j < dims.length; j++) if (dims[j] < dims[i]) i = j;
  return { name: window.DIMENSIONS[i].name, score: dims[i] };
};
window.autoSummary = function (b) {
  if (b.summary) return b.summary;
  const top = window.topDim(b.dims);
  const bot = window.bottomDim(b.dims);
  return `Strongest performance in <strong class='text-secondary'>${top.name}</strong> (${top.score}/20). Lowest scoring dimension is <strong class='text-secondary'>${bot.name}</strong> (${bot.score}/20) — flagged by retailers as the primary opportunity for improvement.`;
};

// Brandfetch Brand Search API.
// Used by the Submit a Review brand picker (and any future "add a brand" flow)
// to autocomplete brand names and capture the canonical domain at submit time.
// Free Developer-tier client ID is exposed in the URL by design.
window.BRANDFETCH_CLIENT_ID = "1idHCc0gXMFVaiisN8L";

const _bfSearchCache = new Map();
window.searchBrandfetch = async function (query) {
  const trimmed = (query || "").trim();
  if (trimmed.length < 2) return [];
  const key = trimmed.toLowerCase();
  if (_bfSearchCache.has(key)) return _bfSearchCache.get(key);
  try {
    const url = new URL("https://api.brandfetch.io/v2/search/" + encodeURIComponent(trimmed));
    url.searchParams.set("c", window.BRANDFETCH_CLIENT_ID);
    const res = await fetch(url.toString(), { method: "GET" });
    if (!res.ok) {
      _bfSearchCache.set(key, []);
      return [];
    }
    const data = await res.json();
    const results = Array.isArray(data) ? data : [];
    _bfSearchCache.set(key, results);
    return results;
  } catch (err) {
    console.warn("Brandfetch search failed:", err);
    _bfSearchCache.set(key, []);
    return [];
  }
};

// Reusable typeahead for any input that should look up a brand or retailer via
// Brandfetch. Pass in your input + dropdown DOM nodes and an onSelect callback.
// Optionally pass `indexBrands` (an array of in-index brand objects) to merge
// in-index matches into the top of the result list with an "INDEX" badge.
window.setupBrandfetchTypeahead = function ({ input, dropdown, status, indexBrands, onSelect }) {
  let debounceTimer = null;
  let currentResults = [];
  let lastQuery = "";

  function renderDropdown(results) {
    currentResults = results;
    if (!results.length) {
      dropdown.classList.add("hidden");
      dropdown.innerHTML = "";
      return;
    }
    dropdown.innerHTML = results.map((r, i) => {
      const iconHtml = r.icon
        ? `<img src="${r.icon}" alt="" class="w-8 h-8 object-contain rounded border border-border-hairline bg-white p-0.5" onerror="this.style.visibility='hidden'">`
        : `<span class="w-8 h-8 rounded border border-border-hairline bg-surface-variant flex items-center justify-center font-bold text-text-caption text-xs">${(r.name || "?").charAt(0)}</span>`;
      const badge = r.inIndex
        ? `<span class="text-[10px] bg-score-high text-white px-2 py-1 rounded font-bold shrink-0">INDEX</span>`
        : "";
      return `
        <button type="button" data-idx="${i}" class="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-surface-container-low border-b border-border-hairline last:border-b-0">
          ${iconHtml}
          <div class="flex-1 min-w-0">
            <p class="font-body-md text-body-md text-text-main truncate">${r.name}</p>
            <p class="font-caption text-caption text-text-caption truncate">${r.domain || "—"}</p>
          </div>
          ${badge}
        </button>
      `;
    }).join("");
    dropdown.classList.remove("hidden");

    dropdown.querySelectorAll("button[data-idx]").forEach(btn => {
      btn.addEventListener("click", () => {
        const r = currentResults[Number(btn.dataset.idx)];
        input.value = r.name;
        dropdown.classList.add("hidden");
        if (onSelect) onSelect(r);
      });
    });
  }

  async function runSearch(q) {
    let inIndexMatches = [];
    if (indexBrands && indexBrands.length) {
      const lower = q.toLowerCase();
      inIndexMatches = indexBrands
        .filter(b => b.name.toLowerCase().includes(lower))
        .slice(0, 4)
        .map(b => ({
          name: b.name, domain: b.domain,
          icon: "https://logo.clearbit.com/" + b.domain,
          inIndex: true
        }));
    }
    if (status) status.classList.remove("hidden");
    const remote = await searchBrandfetch(q);
    if (q !== lastQuery) return;
    if (status) status.classList.add("hidden");
    const indexDomains = new Set(inIndexMatches.map(r => r.domain));
    const remoteFiltered = remote
      .filter(r => r && r.domain && !indexDomains.has(r.domain))
      .slice(0, 6)
      .map(r => ({ name: r.name, domain: r.domain, icon: r.icon, inIndex: false }));
    renderDropdown([...inIndexMatches, ...remoteFiltered]);
  }

  input.addEventListener("input", (e) => {
    const q = e.target.value.trim();
    lastQuery = q;
    if (debounceTimer) clearTimeout(debounceTimer);
    if (q.length < 2) {
      dropdown.classList.add("hidden");
      if (status) status.classList.add("hidden");
      return;
    }
    debounceTimer = setTimeout(() => runSearch(q), 250);
  });

  input.addEventListener("focus", () => {
    const q = input.value.trim();
    if (q.length >= 2) runSearch(q);
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && e.target !== input) {
      dropdown.classList.add("hidden");
    }
  });
};

// Common consumer/personal email providers we reject for review submissions.
// Reviewers must use a company/work address so we can verify their role.
window.PERSONAL_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com",
  "yahoo.com", "yahoo.co.uk", "yahoo.ca", "yahoo.com.au", "ymail.com", "rocketmail.com",
  "hotmail.com", "hotmail.co.uk", "hotmail.fr", "hotmail.it",
  "outlook.com", "outlook.fr", "outlook.de", "live.com", "live.co.uk", "msn.com", "passport.com",
  "aol.com", "aim.com",
  "icloud.com", "me.com", "mac.com",
  "proton.me", "protonmail.com", "pm.me",
  "gmx.com", "gmx.net", "gmx.de",
  "mail.com", "email.com",
  "yandex.com", "yandex.ru",
  "fastmail.com", "fastmail.fm",
  "tutanota.com", "tutanota.de", "tuta.io",
  "zoho.com",
  "qq.com", "163.com", "126.com", "sina.com", "sina.cn"
]);

window.validateWorkEmail = function (email, requiredDomain) {
  const value = (email || "").trim();
  if (!value) return { ok: false, reason: "Please enter your work email." };
  const m = value.match(/^[^\s@]+@([^\s@]+)$/);
  if (!m) return { ok: false, reason: "Please enter a valid email address." };
  const domain = m[1].toLowerCase();
  if (!domain.includes(".")) return { ok: false, reason: "Please enter a valid email address." };
  if (PERSONAL_EMAIL_DOMAINS.has(domain)) {
    return { ok: false, reason: "Use your work email — personal addresses (Gmail, Yahoo, etc.) aren't accepted." };
  }
  if (requiredDomain) {
    const req = requiredDomain.toLowerCase().replace(/^www\./, "");
    if (domain !== req && !domain.endsWith("." + req)) {
      return { ok: false, reason: "Use an email at " + req + " so we can verify your role at the retailer." };
    }
  }
  return { ok: true };
};

// Render a brand logo with a graceful fallback chain:
//   1. Clearbit (full wordmark/logo when available)
//   2. Google Favicon API (always returns something for any registered domain)
//   3. Letter avatar (final fallback, never errors)
//
// To swap Clearbit for Brandfetch later, change the `src` URL in brandLogoHtml
// to `https://cdn.brandfetch.io/${domain}/w/256/h/256?c=YOUR_CLIENT_ID` and
// the rest of the chain still works.
//
// `size` is a Tailwind size class set, e.g. "w-10 h-10" or "w-32 h-32".
// `letterClass` is the type style for the fallback letter, e.g. "text-base" or "text-[64px]".
window.handleLogoError = function (img, domain) {
  const step = img.dataset.step || "clearbit";
  if (step === "clearbit") {
    img.dataset.step = "google";
    img.src = "https://www.google.com/s2/favicons?domain=" + domain + "&sz=128";
  } else {
    img.style.display = "none";
    if (img.nextElementSibling) img.nextElementSibling.style.display = "flex";
  }
};

window.brandLogoHtml = function (brand, size, letterClass) {
  size = size || "w-10 h-10";
  letterClass = letterClass || "text-base";
  return `
    <div class="${size} bg-white rounded border border-border-hairline flex items-center justify-center shrink-0 relative overflow-hidden p-1">
      <img alt="${brand.name} logo"
           class="max-w-full max-h-full object-contain"
           src="https://logo.clearbit.com/${brand.domain}"
           data-step="clearbit"
           onerror="handleLogoError(this, '${brand.domain}')">
      <div class="absolute inset-0 hidden items-center justify-center bg-surface-variant">
        <span class="font-bold text-text-caption ${letterClass}">${brand.name.charAt(0)}</span>
      </div>
    </div>
  `;
};
