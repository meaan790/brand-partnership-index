-- Align brand_scores_v with the BrandWithScores TypeScript type.
-- Joins the brands table to include domain, categories, etc.
-- Uses column names the frontend expects: id, name, slug, score, dims.

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
  array[0,0,0,0]::int[] as spark
from brand_dim_scores_v bds
join brands b on b.id = bds.brand_id
group by bds.brand_id, bds.brand_name, bds.brand_slug,
         b.domain, b.logo_url, b.categories, b.claimed_by,
         b.description, b.created_at;
