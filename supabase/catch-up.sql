-- ============================================================
-- BPI — Catch-up migration
-- Run this in Supabase SQL Editor if you have ALREADY run
-- run-all.sql (base schema + seed).
-- It applies migrations 004 + 005 on top.
-- Safe to run multiple times (uses CREATE OR REPLACE / IF NOT EXISTS).
-- ============================================================


-- ── 004: Simplified scoring views ────────────────────────────
-- Dimension-level: average the single "overall" score per review,
-- then scale ×4 so each dimension is out of 20.
CREATE OR REPLACE VIEW brand_dim_scores_v AS
SELECT
  b.id AS brand_id,
  b.name AS brand_name,
  b.slug AS brand_slug,
  rs.dimension_key,
  round(
    (avg(rs.score) * 4)::numeric, 1
  ) AS dim_score,
  count(DISTINCT rs.review_id) AS review_count
FROM brands b
JOIN reviews r ON r.brand_id = b.id AND r.status IN ('submitted', 'published')
JOIN review_scores rs ON rs.review_id = r.id
GROUP BY b.id, b.name, b.slug, rs.dimension_key;

-- Overall brand scores for the leaderboard.
CREATE OR REPLACE VIEW brand_scores_v AS
SELECT
  bds.brand_id    AS id,
  bds.brand_name  AS name,
  bds.brand_slug  AS slug,
  b.domain,
  b.logo_url,
  b.categories,
  b.claimed_by,
  b.description,
  b.created_at,
  round(sum(bds.dim_score)::numeric, 0)::int AS score,
  array_agg(bds.dim_score ORDER BY bds.dimension_key) AS dims,
  max(bds.review_count)::int AS review_count,
  '0' AS change,
  array[0,0,0,0,0]::int[] AS spark
FROM brand_dim_scores_v bds
JOIN brands b ON b.id = bds.brand_id
GROUP BY bds.brand_id, bds.brand_name, bds.brand_slug,
         b.domain, b.logo_url, b.categories, b.claimed_by,
         b.description, b.created_at;


-- ── 005: Location fields ─────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS store_city text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS store_region text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS place_id text;

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS store_city text;
