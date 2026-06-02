#!/usr/bin/env python3
"""
Transform ENDVR survey CSV into BPI import files.

Usage:
    python3 process_survey.py <csv_path>

Outputs:
    ../supabase/import.sql
    ../src/lib/seed-data.ts
    ../src/lib/seed-reviews.ts
"""

import csv
import json
import re
import sys
import uuid
from collections import defaultdict
from pathlib import Path
from typing import Optional, Dict, List

SCRIPT_DIR = Path(__file__).parent
APP_DIR = SCRIPT_DIR.parent

SURVEY_PROFILE_ID = "00000000-0000-0000-0000-b01500400001"
DIM_KEYS = ["website", "pricing", "local", "floor", "pro"]

# ── Column name shortcuts ─────────────────────────────────────

COL_BRAND = "Which Brand Are You Reviewing Choose Any Brand You Carry In Store"
COL_PROS = "What Does This Brand Do That Makes It Easier To Sell Their Products In Your Store E G Rep Visits Staff Training Strong Map Enforcement Great Pro Program"
COL_CONS = "What Makes This Brand Harder To Sell Or Support In Your Store E G Weak Retail Support Dtc Competes With Your Pricing No Rep Visits Pro Deals Are Out Of Control"
COL_ROLE = "What Is Your Role At This Store"
SCORE_COLS = [
    "Does Their Own Website Compete Against Your Store Or Does It Protect Retail Pricing Think About Do You Ever Lose A Sale Because A Customer Found A Better Price Directly On The Brands Site Do They Run Frequent Flash Sales Or Discount Popups That Make It Hard To Sell At Full Price",
    "How Well Do They Protect Pricing So All Retailers Are Competing On A Level Playing Field Think About Do You See Other Online Retailers Amazon Third Party Sites Regularly Undercutting The Price When Map Is Broken Does The Brand Actually Do Something About It",
    "Does The Brand Actively Send Customers To Stores Like Yours Think About Is Your Store Listed Correctly On Their Dealer Store Finder Does Their Website Point Customers Toward Local Retailers",
    "Does The Brand Invest In Your Sales Floor And Your Teams Ability To Sell Their Product Think About Does Their Rep Visit And Actually Train Your Staff Do They Run Product Clinics Provide Sell Through Tools Or Support Your Team Through Programs Like Endvr",
    "Is The Brands Pro Deal Program Well Managed Or Does It Undermine Your Ability To Sell At Full Price Think About Does It Feel Like Everyone And Their Cousin Has Pro Pricing On This Brand Or Is The Program Controlled Fair And Actually A Tool For Building Genuine Floor Advocates",
]

# ── Brand normalization map ───────────────────────────────────

BRAND_NORMALIZE = {
    "adidas": "Adidas",
    "aloha": "Aloha Collection",
    "aloha collection": "Aloha Collection",
    "altra": "Altra",
    "anon": "Anon",
    "arc teryx": "Arc'teryx",
    "arcteryx": "Arc'teryx",
    "arc'teryx": "Arc'teryx",
    "asics": "ASICS",
    "bajio": "Bajio",
    "bauer": "Bauer",
    "benchmade": "Benchmade",
    "birkenstock": "Birkenstock",
    "blenders": "Blenders",
    "boss": "Boss",
    "brooks": "Brooks",
    "brooks ghost 18": "Brooks",
    "safilo is killing it": "Safilo",
    "keen is the best for me.": "KEEN",
    "burton": "Burton",
    "capita": "Capita",
    "carolina herrera": "Carolina Herrera",
    "carrera": "Carrera",
    "ccm": "CCM",
    "chanel": "Chanel",
    "chaussures fillion": "Chaussures Fillion",
    "chloe": "Chloe",
    "coach": "Coach",
    "colombia": "Columbia",
    "columbia": "Columbia",
    "columnia": "Columbia",
    "costa": "Costa",
    "cotopaxi": "Cotopaxi",
    "david beckham": "David Beckham",
    "dc": "DC",
    "dragon": "Dragon",
    "ecco": "ECCO",
    "electric": "Electric",
    "fendi": "Fendi",
    "fjallraven": "Fjallraven",
    "flylow": "Flylow",
    "garmin": "Garmin",
    "gucci": "Gucci",
    "helle": "Helle",
    "hoka": "Hoka",
    "hol\u00e0": "Hoka",
    "howies": "Howies",
    "hugo": "Hugo",
    "jrz": "JRZ",
    "juicy": "Juicy Couture",
    "juicy couture": "Juicy Couture",
    "kate spade": "Kate Spade",
    "keen": "KEEN",
    "keen utility": "KEEN",
    "konixx": "Konixx",
    "lindber": "Lindberg",
    "marc jacob": "Marc Jacobs",
    "marc jacobs": "Marc Jacobs",
    "marc jacob's": "Marc Jacobs",
    "marchon": "Marchon",
    "marmot": "Marmot",
    "marsblade": "Marsblade",
    "maui jim": "Maui Jim",
    "mons royale": "Mons Royale",
    "mountain hardware": "Mountain Hardwear",
    "mountain hardwear": "Mountain Hardwear",
    "nemo": "Nemo",
    "new balance": "New Balance",
    "nike": "Nike",
    "north face": "The North Face",
    "the north face": "The North Face",
    "oakley": "Oakley",
    "oklay": "Oakley",
    "okley": "Oakley",
    "oliver peoples": "Oliver Peoples",
    "on": "On",
    "on cloud": "On",
    "on running": "On",
    "osprey": "Osprey",
    "osprey backpacks": "Osprey",
    "otivm": "Otivm",
    "ovvo": "Ovvo",
    "patagonia": "Patagonia",
    "peak design": "Peak Design",
    "peak performance": "Peak Performance",
    "platypus": "Platypus",
    "prana": "prAna",
    "rab": "Rab",
    "raen": "RAEN",
    "ralph": "Ralph Lauren",
    "ray ban": "Ray-Ban",
    "ray bans": "Ray-Ban",
    "ray-ban": "Ray-Ban",
    "rayban": "Ray-Ban",
    "reebok": "Reebok",
    "remonte": "Remonte",
    "revo": "Revo",
    "ripzone": "Ripzone",
    "rumpl": "Rumpl",
    "safilo": "Safilo",
    "salomon": "Salomon",
    "saucony": "Saucony",
    "savior equipment": "Savior Equipment",
    "sea to summit": "Sea to Summit",
    "smith": "Smith",
    "stance": "Stance",
    "teva": "Teva",
    "thirtytwo": "Thirtytwo",
    "thread wallet": "Thread Wallets",
    "thulle": "Thule",
    "tommy hilfiger": "Tommy Hilfiger",
    "tommy hilfigure": "Tommy Hilfiger",
    "trekko": "Trekko",
    "true": "True",
    "under armour": "Under Armour",
    "volcom": "Volcom",
    "vouri": "Vuori",
    "vuori": "Vuori",
    "woods": "Woods",
    "yeti": "YETI",
}

SKIP_ENTRIES = {"yes", "mens sneaker", "like", "dislike"}

# ── Brand domains ─────────────────────────────────────────────

BRAND_DOMAINS = {
    "Adidas": "adidas.com",
    "Aloha Collection": "alohacollection.com",
    "Altra": "altrarunning.com",
    "Anon": "anonoptics.com",
    "Arc'teryx": "arcteryx.com",
    "ASICS": "asics.com",
    "Bajio": "bajiosunglasses.com",
    "Bauer": "bauer.com",
    "Benchmade": "benchmade.com",
    "Birkenstock": "birkenstock.com",
    "Blenders": "blenderseyewear.com",
    "Boss": "hugoboss.com",
    "Brooks": "brooksrunning.com",
    "Burton": "burton.com",
    "Capita": "capitasnowboarding.com",
    "Carolina Herrera": "carolinaherrera.com",
    "Carrera": "carrera-world.com",
    "CCM": "ccmhockey.com",
    "Chanel": "chanel.com",
    "Chloe": "chloe.com",
    "Coach": "coach.com",
    "Columbia": "columbia.com",
    "Costa": "costadelmar.com",
    "Cotopaxi": "cotopaxi.com",
    "David Beckham": "davidbeckhameyewear.com",
    "DC": "dcshoes.com",
    "Dragon": "dragonalliance.com",
    "ECCO": "ecco.com",
    "Electric": "electriccalifornia.com",
    "Fendi": "fendi.com",
    "Fjallraven": "fjallraven.com",
    "Flylow": "flylowgear.com",
    "Garmin": "garmin.com",
    "Gucci": "gucci.com",
    "Helle": "helle.com",
    "Hoka": "hoka.com",
    "Howies": "howies.co.uk",
    "Hugo": "hugoboss.com",
    "JRZ": "jrzsuspension.com",
    "Juicy Couture": "juicycouture.com",
    "Kate Spade": "katespade.com",
    "KEEN": "keenfootwear.com",
    "Konixx": "konixx.com",
    "Lindberg": "lindberg.com",
    "Marc Jacobs": "marcjacobs.com",
    "Marchon": "marchon.com",
    "Marmot": "marmot.com",
    "Marsblade": "marsblade.com",
    "Maui Jim": "mauijim.com",
    "Mons Royale": "monsroyale.com",
    "Mountain Hardwear": "mountainhardwear.com",
    "Nemo": "nemoequipment.com",
    "New Balance": "newbalance.com",
    "Nike": "nike.com",
    "The North Face": "thenorthface.com",
    "Oakley": "oakley.com",
    "Oliver Peoples": "oliverpeoples.com",
    "On": "on.com",
    "Osprey": "osprey.com",
    "Otivm": "otivm.it",
    "Ovvo": "ovvo.com",
    "Patagonia": "patagonia.com",
    "Peak Design": "peakdesign.com",
    "Peak Performance": "peakperformance.com",
    "Platypus": "platypus.com.au",
    "prAna": "prana.com",
    "Rab": "rab.equipment",
    "RAEN": "raen.com",
    "Ralph Lauren": "ralphlauren.com",
    "Ray-Ban": "ray-ban.com",
    "Reebok": "reebok.com",
    "Remonte": "remonte.com",
    "Revo": "revosunglasses.com",
    "Ripzone": "ripzone.com",
    "Rumpl": "rumpl.com",
    "Safilo": "safilo.com",
    "Salomon": "salomon.com",
    "Saucony": "saucony.com",
    "Savior Equipment": "saviorequipment.com",
    "Sea to Summit": "seatosummit.com",
    "Smith": "smithoptics.com",
    "Stance": "stance.com",
    "Teva": "teva.com",
    "Thirtytwo": "thirtytwo.com",
    "Thread Wallets": "threadwallets.com",
    "Thule": "thule.com",
    "Tommy Hilfiger": "usa.tommy.com",
    "Trekko": "trekko.com",
    "True": "true-hockey.com",
    "Under Armour": "underarmour.com",
    "Volcom": "volcom.com",
    "Vuori": "vuoriclothing.com",
    "Woods": "woods.ca",
    "YETI": "yeti.com",
}

# ── Brand categories ──────────────────────────────────────────

BRAND_CATEGORIES = {
    "Adidas": ["Footwear", "Sport"],
    "Aloha Collection": ["Accessories"],
    "Altra": ["Running"],
    "Anon": ["Snow"],
    "Arc'teryx": ["Outdoor", "Ski"],
    "ASICS": ["Running", "Footwear"],
    "Bajio": ["Eyewear"],
    "Bauer": ["Hockey"],
    "Benchmade": ["Outdoor"],
    "Birkenstock": ["Footwear"],
    "Blenders": ["Eyewear"],
    "Boss": ["Eyewear"],
    "Brooks": ["Running"],
    "Burton": ["Snow"],
    "Capita": ["Snow"],
    "Carolina Herrera": ["Eyewear"],
    "Carrera": ["Eyewear"],
    "CCM": ["Hockey"],
    "Chanel": ["Eyewear"],
    "Chaussures Fillion": ["Footwear"],
    "Chloe": ["Eyewear"],
    "Coach": ["Eyewear"],
    "Columbia": ["Outdoor"],
    "Costa": ["Eyewear"],
    "Cotopaxi": ["Outdoor"],
    "David Beckham": ["Eyewear"],
    "DC": ["Snow", "Footwear"],
    "Dragon": ["Eyewear"],
    "ECCO": ["Footwear"],
    "Electric": ["Eyewear"],
    "Fendi": ["Eyewear"],
    "Fjallraven": ["Outdoor"],
    "Flylow": ["Ski"],
    "Garmin": ["Electronics"],
    "Gucci": ["Eyewear"],
    "Helle": ["Outdoor"],
    "Hoka": ["Running"],
    "Howies": ["Outdoor"],
    "Hugo": ["Eyewear"],
    "JRZ": ["Hockey"],
    "Juicy Couture": ["Eyewear"],
    "Kate Spade": ["Eyewear"],
    "KEEN": ["Outdoor", "Footwear"],
    "Konixx": ["Hockey"],
    "Lindberg": ["Eyewear"],
    "Marc Jacobs": ["Eyewear"],
    "Marchon": ["Eyewear"],
    "Marmot": ["Outdoor"],
    "Marsblade": ["Hockey"],
    "Maui Jim": ["Eyewear"],
    "Mons Royale": ["Outdoor"],
    "Mountain Hardwear": ["Outdoor"],
    "Nemo": ["Outdoor"],
    "New Balance": ["Running", "Footwear"],
    "Nike": ["Sport", "Footwear"],
    "The North Face": ["Outdoor", "Ski"],
    "Oakley": ["Eyewear", "Sport"],
    "Oliver Peoples": ["Eyewear"],
    "On": ["Running"],
    "Osprey": ["Outdoor"],
    "Otivm": ["Eyewear"],
    "Ovvo": ["Eyewear"],
    "Patagonia": ["Outdoor"],
    "Peak Design": ["Electronics"],
    "Peak Performance": ["Outdoor", "Ski"],
    "Platypus": ["Outdoor"],
    "prAna": ["Outdoor"],
    "Rab": ["Outdoor"],
    "RAEN": ["Eyewear"],
    "Ralph Lauren": ["Eyewear"],
    "Ray-Ban": ["Eyewear"],
    "Reebok": ["Sport", "Footwear"],
    "Remonte": ["Footwear"],
    "Revo": ["Eyewear"],
    "Ripzone": ["Snow"],
    "Rumpl": ["Outdoor"],
    "Safilo": ["Eyewear"],
    "Salomon": ["Running", "Outdoor", "Ski"],
    "Saucony": ["Running"],
    "Savior Equipment": ["Firearms"],
    "Sea to Summit": ["Outdoor"],
    "Smith": ["Eyewear", "Ski"],
    "Stance": ["Accessories"],
    "Teva": ["Outdoor", "Footwear"],
    "Thirtytwo": ["Snow"],
    "Thread Wallets": ["Accessories"],
    "Thule": ["Outdoor"],
    "Tommy Hilfiger": ["Eyewear"],
    "Trekko": ["Eyewear"],
    "True": ["Hockey"],
    "Under Armour": ["Sport", "Footwear"],
    "Volcom": ["Surf", "Snow"],
    "Vuori": ["Outdoor"],
    "Woods": ["Outdoor"],
    "YETI": ["Outdoor"],
}

# ── Brand descriptions ────────────────────────────────────────

BRAND_DESCRIPTIONS = {
    "Adidas": "Global sportswear brand offering footwear, apparel, and accessories across performance and lifestyle categories.",
    "Altra": "Zero-drop running footwear brand known for foot-shaped toe boxes and natural running form.",
    "Arc'teryx": "Vancouver-based technical apparel and equipment company known for premium alpine outerwear.",
    "ASICS": "Japanese athletic brand specializing in performance running footwear and sport apparel.",
    "Bauer": "Leading hockey equipment manufacturer producing sticks, skates, helmets, and protective gear.",
    "Birkenstock": "German footwear brand renowned for contoured cork footbed sandals and comfort shoes.",
    "Brooks": "High-performance running footwear and apparel, known for strong commitment to specialty retail.",
    "Burton": "Pioneering snowboard brand offering boards, bindings, boots, and outerwear.",
    "CCM": "Major hockey equipment brand producing sticks, skates, goalie gear, and protective equipment.",
    "Columbia": "Outdoor apparel company with a wide range of value-oriented technical clothing and footwear.",
    "Costa": "Premium polarized sunglasses designed for fishing and water sports.",
    "Cotopaxi": "Outdoor gear maker with a benefit corporation model and focus on humanitarian impact.",
    "DC": "Action sports footwear and apparel brand rooted in skateboarding and snowboarding culture.",
    "ECCO": "Danish footwear brand combining comfort technology with contemporary design.",
    "Fjallraven": "Swedish outdoor brand known for durable expedition gear and the iconic Kanken backpack.",
    "Garmin": "GPS technology company producing fitness wearables, smartwatches, and outdoor navigation devices.",
    "Hoka": "Premium running brand recognized for maximum cushioning and rapid product innovation.",
    "KEEN": "American footwear company known for hybrid sandal-shoes and toe protection technology.",
    "Marc Jacobs": "American fashion house offering eyewear, accessories, and ready-to-wear collections.",
    "Marmot": "Outdoor apparel and gear brand specializing in technical mountain clothing and sleeping bags.",
    "Maui Jim": "Premium polarized sunglasses brand from Hawaii, known for color-enhancing lens technology.",
    "Mountain Hardwear": "Technical alpine and climbing apparel and equipment brand.",
    "Nemo": "Innovative outdoor sleeping bags, tents, and camping gear from New Hampshire.",
    "New Balance": "Athletic footwear brand known for wide sizing options and domestic manufacturing.",
    "Nike": "Global athletic brand offering footwear, apparel, and equipment across all sport categories.",
    "The North Face": "Global outdoor brand offering technical apparel and equipment across alpine, run, and lifestyle.",
    "Oakley": "Performance eyewear and sport optics brand known for innovative lens technology.",
    "Oliver Peoples": "Luxury eyewear brand offering handcrafted optical frames and sunglasses.",
    "On": "Swiss running brand known for CloudTec sole technology and growing lifestyle appeal.",
    "Osprey": "Backpack and travel pack specialist with a guaranteed-for-life warranty.",
    "Patagonia": "Outdoor apparel company known for environmental stewardship and lifetime repair commitments.",
    "prAna": "Yoga, climbing, and travel apparel brand emphasizing sustainable materials.",
    "Rab": "British outdoor brand specializing in insulated jackets and alpine climbing equipment.",
    "Ray-Ban": "Iconic eyewear brand known for Wayfarer and Aviator sunglasses.",
    "Salomon": "French maker of trail running, hiking, and ski equipment with alpine sport heritage.",
    "Saucony": "Performance running footwear brand with over 120 years of heritage.",
    "Sea to Summit": "Australian outdoor brand offering ultralight camping gear and travel accessories.",
    "Smith": "Eyewear and snow goggle brand known for ChromaPop lens technology.",
    "Teva": "Outdoor footwear brand pioneering the sport sandal category since 1984.",
    "Thule": "Swedish brand producing roof racks, cargo carriers, and outdoor transport solutions.",
    "Under Armour": "Performance sportswear brand offering athletic apparel, footwear, and accessories.",
    "Volcom": "Youth-culture brand rooted in skateboarding, surfing, and snowboarding.",
    "Vuori": "Performance apparel brand blending athletic function with coastal California style.",
    "YETI": "Premium coolers, drinkware, and outdoor products engineered for durability.",
}


def slugify(name: str) -> str:
    s = name.lower()
    s = s.replace("'", "")
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return re.sub(r"-+", "-", s)


def _ascii_quotes(s: str) -> str:
    """Normalize unicode quotes/apostrophes to ASCII."""
    return (s
        .replace("\u2018", "'").replace("\u2019", "'")
        .replace("\u201c", '"').replace("\u201d", '"')
        .replace("\u2014", "-").replace("\u2013", "-"))


def normalize_brand(raw: str) -> Optional[str]:
    raw = _ascii_quotes(raw.strip())
    if not raw:
        return None

    lower = raw.lower().strip()

    if lower in SKIP_ENTRIES:
        return None

    if lower in BRAND_NORMALIZE:
        return BRAND_NORMALIZE[lower]

    # Long entries are likely descriptions; try to extract the brand
    if len(raw) > 40:
        # "Brand: description"
        if ":" in raw[:30]:
            candidate = raw.split(":")[0].strip()
            result = normalize_brand(candidate)
            if result:
                return result

        # "Brand - description"
        if " - " in raw[:40]:
            candidate = raw.split(" - ")[0].strip()
            result = normalize_brand(candidate)
            if result:
                return result

        # Try "Brand, long description"
        if "," in raw:
            candidate = raw.split(",")[0].strip()
            result = normalize_brand(candidate)
            if result:
                return result

        # Scan individual words for a known brand name
        words = raw.split()
        for word in words[:8]:
            cleaned = word.strip(".,!?;:'\"()").lower()
            if cleaned in BRAND_NORMALIZE:
                return BRAND_NORMALIZE[cleaned]

        return None

    # Multi-brand entries (commas with multiple short segments)
    if "," in raw:
        parts = [p.strip() for p in raw.split(",")]
        if len(parts) > 2:
            return None
        first_result = normalize_brand(parts[0])
        remaining = ",".join(parts[1:]).strip()
        if first_result and len(remaining) > 20:
            return first_result
        return None

    # Short entries with separators
    for sep in [": ", " - ", ". "]:
        if sep in raw:
            candidate = raw.split(sep)[0].strip()
            result = normalize_brand(candidate)
            if result:
                return result

    # Only title-case very short entries that look like names (no spaces = single word brand)
    if len(raw) < 25 and not any(c in raw for c in ".!?"):
        return raw.strip().title()

    return None


def sql_escape(s: str) -> str:
    if not s:
        return ""
    return s.replace("'", "''")


def ts_escape(s: str) -> str:
    if not s:
        return ""
    return s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ").replace("\r", "")


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 process_survey.py <csv_path>")
        sys.exit(1)

    csv_path = Path(sys.argv[1])
    if not csv_path.exists():
        print(f"File not found: {csv_path}")
        sys.exit(1)

    # ── Parse CSV ──────────────────────────────────────────────

    reviews = []
    skipped = []

    with open(csv_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row_num, row in enumerate(reader, start=2):
            raw_brand = row.get(COL_BRAND, "").strip()
            brand = normalize_brand(raw_brand)

            if not brand:
                skipped.append((row_num, raw_brand))
                continue

            try:
                scores = [int(row.get(col, "0").strip()) for col in SCORE_COLS]
                if not all(1 <= s <= 5 for s in scores):
                    skipped.append((row_num, f"{raw_brand} (invalid scores)"))
                    continue
            except (ValueError, TypeError):
                skipped.append((row_num, f"{raw_brand} (parse error)"))
                continue

            slug = slugify(brand)
            review_id = str(uuid.uuid4())

            reviews.append({
                "id": review_id,
                "brand": brand,
                "brand_slug": slug,
                "store_name": row.get("Store Name", "").strip(),
                "city": row.get("City", "").strip(),
                "state": row.get("State", "").strip(),
                "country": row.get("Country", "").strip(),
                "role": row.get(COL_ROLE, "").strip(),
                "pros": row.get(COL_PROS, "").strip(),
                "cons": row.get(COL_CONS, "").strip(),
                "scores": scores,
                "submitted_at": row.get("Submitted At", "2026-06-01").strip(),
            })

    print(f"Parsed {len(reviews)} valid reviews, skipped {len(skipped)} rows")
    if skipped:
        print("Skipped entries:")
        for row_num, reason in skipped:
            print(f"  Row {row_num}: {reason[:80]}")

    # ── Aggregate brands ──────────────────────────────────────

    brand_data: Dict[str, dict] = {}

    for r in reviews:
        slug = r["brand_slug"]
        if slug not in brand_data:
            name = r["brand"]
            brand_data[slug] = {
                "name": name,
                "slug": slug,
                "domain": BRAND_DOMAINS.get(name, f"{slug}.com"),
                "categories": BRAND_CATEGORIES.get(name, ["General"]),
                "description": BRAND_DESCRIPTIONS.get(name),
                "dim_scores": defaultdict(list),
                "review_count": 0,
            }
        brand_data[slug]["review_count"] += 1
        for i, dk in enumerate(DIM_KEYS):
            brand_data[slug]["dim_scores"][dk].append(r["scores"][i])

    for slug, bd in brand_data.items():
        dims = []
        for dk in DIM_KEYS:
            scores_list = bd["dim_scores"][dk]
            avg = sum(scores_list) / len(scores_list)
            dims.append(round(avg * 4, 1))
        bd["dims"] = dims
        bd["score"] = round(sum(dims))

    # Filter out brands with a perfect score from a single review (not representative)
    brand_data = {
        slug: bd for slug, bd in brand_data.items()
        if not (bd["score"] == 100 and bd["review_count"] == 1)
    }

    sorted_brands = sorted(brand_data.values(), key=lambda b: (-b["score"], b["name"]))

    print(f"Aggregated {len(sorted_brands)} unique brands")

    # Filter reviews to only include brands that made the cut
    valid_slugs = set(bd["slug"] for bd in sorted_brands)
    reviews = [r for r in reviews if r["brand_slug"] in valid_slugs]

    # ── Generate outputs ──────────────────────────────────────

    generate_sql(sorted_brands, reviews)
    generate_seed_data(sorted_brands)
    generate_seed_reviews(reviews)

    print("\nDone! Generated files:")
    print(f"  {APP_DIR / 'supabase' / 'import.sql'}")
    print(f"  {APP_DIR / 'src' / 'lib' / 'seed-data.ts'}")
    print(f"  {APP_DIR / 'src' / 'lib' / 'seed-reviews.ts'}")


def generate_sql(brands: List[dict], reviews: List[dict]):
    lines = []
    lines.append("-- ============================================================")
    lines.append("-- BPI Survey Data Import")
    lines.append("-- Generated by process_survey.py")
    lines.append("-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)")
    lines.append("-- ============================================================")
    lines.append("")
    lines.append("BEGIN;")
    lines.append("")

    # Fix dims ordering in brand_scores_v
    lines.append("-- Fix brand_scores_v to order dims matching app DIMENSIONS constant")
    lines.append("-- (website, pricing, local, floor, pro) instead of alphabetical")
    lines.append("CREATE OR REPLACE VIEW brand_scores_v AS")
    lines.append("SELECT")
    lines.append("  bds.brand_id    AS id,")
    lines.append("  bds.brand_name  AS name,")
    lines.append("  bds.brand_slug  AS slug,")
    lines.append("  b.domain,")
    lines.append("  b.logo_url,")
    lines.append("  b.categories,")
    lines.append("  b.claimed_by,")
    lines.append("  b.description,")
    lines.append("  b.created_at,")
    lines.append("  round(sum(bds.dim_score)::numeric, 0)::int AS score,")
    lines.append("  array_agg(bds.dim_score ORDER BY")
    lines.append("    CASE bds.dimension_key")
    lines.append("      WHEN 'website' THEN 1")
    lines.append("      WHEN 'pricing' THEN 2")
    lines.append("      WHEN 'local'   THEN 3")
    lines.append("      WHEN 'floor'   THEN 4")
    lines.append("      WHEN 'pro'     THEN 5")
    lines.append("    END")
    lines.append("  ) AS dims,")
    lines.append("  max(bds.review_count)::int AS review_count,")
    lines.append("  '0' AS change,")
    lines.append("  array[0,0,0,0,0]::int[] AS spark")
    lines.append("FROM brand_dim_scores_v bds")
    lines.append("JOIN brands b ON b.id = bds.brand_id")
    lines.append("GROUP BY bds.brand_id, bds.brand_name, bds.brand_slug,")
    lines.append("         b.domain, b.logo_url, b.categories, b.claimed_by,")
    lines.append("         b.description, b.created_at;")
    lines.append("")

    # System user
    lines.append("-- Create system auth user for survey import")
    lines.append("INSERT INTO auth.users (")
    lines.append("  instance_id, id, aud, role, email, encrypted_password,")
    lines.append("  email_confirmed_at, created_at, updated_at,")
    lines.append("  raw_app_meta_data, raw_user_meta_data")
    lines.append(") VALUES (")
    lines.append("  '00000000-0000-0000-0000-000000000000'::uuid,")
    lines.append(f"  '{SURVEY_PROFILE_ID}'::uuid,")
    lines.append("  'authenticated', 'authenticated',")
    lines.append("  'survey-import@bpi.internal',")
    lines.append("  crypt('not-a-real-password', gen_salt('bf')),")
    lines.append("  now(), now(), now(),")
    lines.append("  '{\"provider\":\"email\",\"providers\":[\"email\"]}'::jsonb,")
    lines.append("  '{\"role\":\"retailer\"}'::jsonb")
    lines.append(") ON CONFLICT (id) DO NOTHING;")
    lines.append("")

    lines.append("INSERT INTO profiles (id, email, role, company_name, created_at, updated_at)")
    lines.append(f"VALUES ('{SURVEY_PROFILE_ID}'::uuid, 'survey-import@bpi.internal', 'retailer', 'ENDVR Survey Import', now(), now())")
    lines.append("ON CONFLICT (id) DO NOTHING;")
    lines.append("")

    # Clean previous import
    lines.append("-- Remove previous survey import data (safe to re-run)")
    lines.append(f"DELETE FROM review_comments WHERE review_id IN (SELECT id FROM reviews WHERE reviewer_id = '{SURVEY_PROFILE_ID}'::uuid);")
    lines.append(f"DELETE FROM review_scores WHERE review_id IN (SELECT id FROM reviews WHERE reviewer_id = '{SURVEY_PROFILE_ID}'::uuid);")
    lines.append(f"DELETE FROM reviews WHERE reviewer_id = '{SURVEY_PROFILE_ID}'::uuid;")
    lines.append("")

    # Upsert brands
    lines.append(f"-- Upsert {len(brands)} brands")
    for bd in brands:
        cats = "{" + ",".join(f'"{c}"' for c in bd["categories"]) + "}"
        desc = sql_escape(bd["description"]) if bd["description"] else ""
        desc_sql = f"'{desc}'" if desc else "NULL"
        lines.append(
            f"INSERT INTO brands (name, slug, domain, categories, description) "
            f"VALUES ('{sql_escape(bd['name'])}', '{bd['slug']}', '{bd['domain']}', "
            f"'{cats}', {desc_sql}) "
            f"ON CONFLICT (slug) DO UPDATE SET "
            f"name = EXCLUDED.name, domain = EXCLUDED.domain, "
            f"categories = EXCLUDED.categories, description = COALESCE(EXCLUDED.description, brands.description);"
        )
    lines.append("")

    # Insert reviews
    lines.append(f"-- Insert {len(reviews)} reviews with scores and comments")
    lines.append("")

    for r in reviews:
        rid = r["id"]
        city_state = ", ".join(filter(None, [r["city"], r["state"]]))
        submitted = r["submitted_at"] or "2026-06-01"

        lines.append(
            f"INSERT INTO reviews (id, reviewer_id, brand_id, status, country, store_city, created_at, updated_at) "
            f"VALUES ('{rid}'::uuid, '{SURVEY_PROFILE_ID}'::uuid, "
            f"(SELECT id FROM brands WHERE slug = '{r['brand_slug']}'), "
            f"'published', "
            f"'{sql_escape(r['country'])}', "
            f"'{sql_escape(city_state)}', "
            f"'{submitted}'::timestamptz, '{submitted}'::timestamptz);"
        )

        score_values = []
        for i, dk in enumerate(DIM_KEYS):
            score_values.append(f"('{rid}'::uuid, '{dk}', 'overall', {r['scores'][i]})")
        lines.append(
            f"INSERT INTO review_scores (review_id, dimension_key, sub_component_key, score) VALUES "
            + ", ".join(score_values) + ";"
        )

        comment_values = []
        if r["pros"]:
            comment_values.append(f"('{rid}'::uuid, '_pros', '{sql_escape(r['pros'])}')")
        if r["cons"]:
            comment_values.append(f"('{rid}'::uuid, '_cons', '{sql_escape(r['cons'])}')")
        if comment_values:
            lines.append(
                f"INSERT INTO review_comments (review_id, dimension_key, comment_text) VALUES "
                + ", ".join(comment_values) + ";"
            )
        lines.append("")

    lines.append("COMMIT;")
    lines.append("")
    lines.append("-- Verify: check brand_scores_v has the imported data")
    lines.append("SELECT name, score, dims, review_count FROM brand_scores_v ORDER BY score DESC LIMIT 20;")

    out_path = APP_DIR / "supabase" / "import.sql"
    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"Generated SQL: {out_path} ({len(lines)} lines)")


def generate_seed_data(brands: List[dict]):
    lines = []
    lines.append('import type { BrandWithScores } from "./types";')
    lines.append("")
    lines.append("/**")
    lines.append(" * Real brand data derived from ENDVR survey responses (June 2026).")
    lines.append(" * Used as fallback when Supabase has fewer than 10 brands with scores.")
    lines.append(" */")
    lines.append("export const SEED_BRANDS: BrandWithScores[] = [")

    for bd in brands:
        name = ts_escape(bd["name"])
        slug = bd["slug"]
        domain = bd["domain"]
        cats_json = json.dumps(bd["categories"])
        desc = ts_escape(bd["description"]) if bd["description"] else ""
        desc_ts = f'"{desc}"' if desc else "null"
        dims = bd["dims"]
        dims_str = "[" + ", ".join(str(d) for d in dims) + "]"

        lines.append(
            f'  {{ id: "survey-{slug}", name: "{name}", slug: "{slug}", '
            f'domain: "{domain}", logo_url: null, categories: {cats_json}, '
            f'claimed_by: null, description: {desc_ts}, '
            f'created_at: "2026-06-01", score: {bd["score"]}, dims: {dims_str}, '
            f'review_count: {bd["review_count"]}, change: "0", spark: [] }},'
        )

    lines.append("];")
    lines.append("")

    out_path = APP_DIR / "src" / "lib" / "seed-data.ts"
    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"Generated seed-data.ts: {out_path} ({len(brands)} brands)")


def generate_seed_reviews(reviews: List[dict]):
    lines = []
    lines.append("/**")
    lines.append(" * Individual review records from ENDVR survey (June 2026).")
    lines.append(" * Used as fallback for brand profile pages and recent reviews.")
    lines.append(" */")
    lines.append("")
    lines.append("export interface SeedReview {")
    lines.append("  brand_slug: string;")
    lines.append("  brand_name: string;")
    lines.append("  store_name: string;")
    lines.append("  city: string;")
    lines.append("  state: string;")
    lines.append("  country: string;")
    lines.append("  role: string;")
    lines.append("  pros: string;")
    lines.append("  cons: string;")
    lines.append("  scores: [number, number, number, number, number];")
    lines.append("  submitted_at: string;")
    lines.append("}")
    lines.append("")
    lines.append("export const SEED_REVIEWS: SeedReview[] = [")

    for r in reviews:
        scores_str = "[" + ", ".join(str(s) for s in r["scores"]) + "]"
        lines.append("  {")
        lines.append(f'    brand_slug: "{r["brand_slug"]}",')
        lines.append(f'    brand_name: "{ts_escape(r["brand"])}",')
        lines.append(f'    store_name: "{ts_escape(r["store_name"])}",')
        lines.append(f'    city: "{ts_escape(r["city"])}",')
        lines.append(f'    state: "{ts_escape(r["state"])}",')
        lines.append(f'    country: "{ts_escape(r["country"])}",')
        lines.append(f'    role: "{ts_escape(r["role"])}",')
        lines.append(f'    pros: "{ts_escape(r["pros"])}",')
        lines.append(f'    cons: "{ts_escape(r["cons"])}",')
        lines.append(f"    scores: {scores_str} as [number, number, number, number, number],")
        lines.append(f'    submitted_at: "{r["submitted_at"]}",')
        lines.append("  },")

    lines.append("];")
    lines.append("")

    out_path = APP_DIR / "src" / "lib" / "seed-reviews.ts"
    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"Generated seed-reviews.ts: {out_path} ({len(reviews)} reviews)")


if __name__ == "__main__":
    main()
