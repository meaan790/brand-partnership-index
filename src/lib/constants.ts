import type { Dimension, DimensionSubs } from "./types";

export const DIMENSIONS: Dimension[] = [
  { key: "website", name: "DTC Site Standards", short: "DTC Site", blurb: "DTC site behavior" },
  { key: "pricing", name: "Pricing Standards", short: "Pricing", blurb: "MAP enforcement" },
  { key: "local", name: "Shop Local Support", short: "Local", blurb: "demand routing" },
  { key: "floor", name: "Shop Floor Support", short: "Floor", blurb: "investment in staff" },
  { key: "pro", name: "Pro Deal Standards", short: "Pro", blurb: "discount channel discipline" },
];

export const DIMENSION_SUBS: DimensionSubs = {
  website: [
    { key: "sale_outlet", label: "Sale & Outlet Sections", desc: "Whether the brand's DTC site avoids permanent sale tabs, outlet sections, or markdown grids.", anchor5: "No sale sections", anchor1: "Permanent sale sections", prompt: "e.g., Brand runs a permanent 40% outlet section that undercuts our floor price\u2026" },
    { key: "visitor_popups", label: "Visitor Discount Popups", desc: "Whether the brand's DTC site avoids aggressive sign-up popups and cart-abandonment discounts.", anchor5: "No discount popups", anchor1: "Heavy discount popups", prompt: "e.g., 15% sign-up popup for every new visitor, plus 20% abandoned-cart emails\u2026" },
    { key: "flash_cadence", label: "Flash Sale Cadence", desc: "How often the brand's DTC site runs short, time-limited promotional pricing that undercuts retailer windows.", anchor5: "Rare flash sales", anchor1: "Constant flash sales", prompt: "e.g., Weekly flash sales every Friday that drive customers away from stores\u2026" },
    { key: "dtc_cashback", label: "DTC Cashback Promotions", desc: "Whether the brand's DTC site runs cashback offers only at its own checkout, capturing retail demand.", anchor5: "No DTC cashback", anchor1: "DTC-only cashback", prompt: "e.g., Brand offers permanent 10% Rakuten cashback, making their DTC price always lower than our shelf price\u2026" },
  ],
  pricing: [
    { key: "unauthorized_policing", label: "Unauthorized Reseller Policing", desc: "Active MAP enforcement on Amazon, marketplaces, and gray-market sellers.", anchor5: "Strict MAP enforcement", anchor1: "MAP not enforced", prompt: "e.g., Amazon listings consistently 15% below MAP and gray-market sellers go unchecked\u2026" },
    { key: "reseller_comp", label: "Authorized Reseller Compliance", desc: "Pricing consistency maintained across approved retail partners.", anchor5: "Consistent pricing", anchor1: "Pricing chaos", prompt: "e.g., Online-only retailers undercut brick-and-mortar by 10\u201320%\u2026" },
    { key: "map_response", label: "MAP Violation Response", desc: "Speed at which the brand acts on flagged price violations.", anchor5: "Response within days", anchor1: "Slow or none", prompt: "e.g., We reported a violation in March and it\u2019s still live in June\u2026" },
    { key: "price_stable", label: "Wholesale Price Stability", desc: "Pricing predictability without mid-season changes, MSRP shifts, or surprises.", anchor5: "Stable predictable pricing", anchor1: "Constant price changes", prompt: "e.g., Wholesale cost went up mid-season with no advance notice\u2026" },
  ],
  local: [
    { key: "local_stock", label: "Local Stock on Product Pages", desc: "Real-time retailer inventory shown on each product page, with a buy-from-this-store option.", anchor5: "Live retailer stock", anchor1: "No stock shown", prompt: "e.g., DTC site shows no retailer stock or \u2018find in store\u2019 link on product pages\u2026" },
    { key: "finder_visibility", label: "Store Finder Visibility", desc: "\u2018Find a retailer\u2019 link in primary navigation, footer, and contextual placements.", anchor5: "Prominent site-wide", anchor1: "Buried or absent", prompt: "e.g., Dealer locator is buried three clicks deep in the footer\u2026" },
    { key: "dealer_accuracy", label: "Dealer Database Accuracy", desc: "Quality of the retailer database \u2014 searchable, filterable, current, and accurate.", anchor5: "Clean accurate data", anchor1: "Stale wrong data", prompt: "e.g., Store finder shows closed locations and wrong phone numbers\u2026" },
    { key: "cashback_routing", label: "Cashback Routing to Retail", desc: "Brand-funded cashback campaigns that drive consumer demand to retail doors with verified redemption.", anchor5: "Active retail cashback", anchor1: "DTC cashback only", prompt: "e.g., Brand runs 15% Rakuten cashback on DTC but offers zero equivalent incentive for buying in-store\u2026" },
  ],
  floor: [
    { key: "coop_marketing", label: "Co-op Marketing Programs", desc: "Brand-funded marketing dollars made available to retailers, with clear allocation and accountability.", anchor5: "Generous co-op funds", anchor1: "No co-op funds", prompt: "e.g., Brand offers 3% co-op but the claim process is so complex nobody uses it\u2026" },
    { key: "mobile_incentives", label: "Mobile Incentives & Education", desc: "Sales rewards and product education delivered to associates on their phones, accessible on the shop floor.", anchor5: "Active mobile training", anchor1: "No mobile programs", prompt: "e.g., Great app-based training with SPIFs, but only works on iOS\u2026" },
    { key: "clinics_events", label: "In-Store Clinics & Events", desc: "Physical brand-led product education and consumer events delivered at retail locations.", anchor5: "Regular store clinics", anchor1: "No in-store presence", prompt: "e.g., Brand hasn\u2019t run a clinic or demo in our store for over a year\u2026" },
    { key: "rep_merch", label: "Rep & Merchandising Support", desc: "Brand sales rep visits, POS displays, signage, and in-store visual materials.", anchor5: "Active rep cadence", anchor1: "No rep support", prompt: "e.g., Rep visits quarterly with new samples and always refreshes our endcap\u2026" },
  ],
  pro: [
    { key: "eligibility", label: "Pro Deal Eligibility", desc: "Tightness of who qualifies for industry and professional discounts.", anchor5: "Strict verified gating", anchor1: "Open to anyone", prompt: "e.g., Anyone with a social media account seems to get pro pricing\u2026" },
    { key: "purchase_caps", label: "Annual Purchase Caps", desc: "Limits on how much a single pro deal account can purchase at discount each year.", anchor5: "Strict caps enforced", anchor1: "No purchase limits", prompt: "e.g., No visible cap \u2014 pro athletes buy dozens of units at 50% off\u2026" },
    { key: "insider_controls", label: "Insider Discount Controls", desc: "Caps and enforcement on friends-and-family and employee discount channels.", anchor5: "Controlled and enforced", anchor1: "Codes shared freely", prompt: "e.g., F&F codes get shared on Reddit and employee store is wide open\u2026" },
    { key: "discount_depth", label: "Pro Deal Discount Depth", desc: "Whether pro deal pricing stays at or above the retailer\u2019s wholesale cost.", anchor5: "Above wholesale cost", anchor1: "Undercuts retailer cost", prompt: "e.g., Pro deal users buying at 50% off MSRP while our wholesale is 55% of MSRP\u2026" },
  ],
};

export const DIMENSION_ICONS: Record<string, string> = {
  website: "language",
  pricing: "payments",
  local: "storefront",
  floor: "support_agent",
  pro: "badge",
};

export const PERSONAL_EMAIL_DOMAINS = new Set([
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
  "qq.com", "163.com", "126.com", "sina.com", "sina.cn",
]);
