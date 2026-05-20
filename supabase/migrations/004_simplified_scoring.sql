-- Simplified scoring: 1 star (1-5) per dimension, scaled to /20.
-- Total across 5 dimensions = max 100.

-- Dimension-level: average the single "overall" score per review,
-- then scale ×4 so each dimension is out of 20.
create or replace view brand_dim_scores_v as
select
  b.id as brand_id,
  b.name as brand_name,
  b.slug as brand_slug,
  rs.dimension_key,
  round(
    (avg(rs.score) * 4)::numeric, 1
  ) as dim_score,
  count(distinct rs.review_id) as review_count
from brands b
join reviews r on r.brand_id = b.id and r.status in ('submitted', 'published')
join review_scores rs on rs.review_id = r.id
group by b.id, b.name, b.slug, rs.dimension_key;

-- Overall brand scores for the leaderboard.
create or replace view brand_scores_v as
select
  bds.brand_id    as id,
  bds.brand_name  as name,
  bds.brand_slug  as slug,
  b.domain,
  b.logo_url,
  b.categories,
  b.claimed_by,
  b.description,
  b.created_at,
  round(sum(bds.dim_score)::numeric, 0)::int as score,
  array_agg(bds.dim_score order by bds.dimension_key) as dims,
  max(bds.review_count)::int as review_count,
  '0' as change,
  array[0,0,0,0,0]::int[] as spark
from brand_dim_scores_v bds
join brands b on b.id = bds.brand_id
group by bds.brand_id, bds.brand_name, bds.brand_slug,
         b.domain, b.logo_url, b.categories, b.claimed_by,
         b.description, b.created_at;
