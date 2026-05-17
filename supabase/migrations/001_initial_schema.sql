-- Brand Partnership Index — Initial Schema
-- Designed for Supabase (Postgres) with Row Level Security.

-- ────────────────────────────────────────────────────────────────
-- 1. User Profiles (extends Supabase auth.users)
-- ────────────────────────────────────────────────────────────────

create type user_role as enum ('retailer', 'brand');

create table profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  email                 text not null,
  role                  user_role not null default 'retailer',
  company_name          text not null,
  store_location        text,
  anonymous_display_name text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

-- ────────────────────────────────────────────────────────────────
-- 2. Brands
-- ────────────────────────────────────────────────────────────────

create table brands (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  domain        text not null,
  logo_url      text,
  categories    text[] not null default '{}',
  description   text,
  claimed_by    uuid references profiles(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_brands_slug on brands(slug);

alter table brands enable row level security;

create policy "Brands are publicly readable"
  on brands for select using (true);

create policy "Authenticated users can insert brands"
  on brands for insert with check (auth.role() = 'authenticated');

create policy "Brand owner can update their brand"
  on brands for update using (auth.uid() = claimed_by);

-- ────────────────────────────────────────────────────────────────
-- 3. Reviews
-- ────────────────────────────────────────────────────────────────

create type review_status as enum ('draft', 'submitted', 'published');

create table reviews (
  id            uuid primary key default gen_random_uuid(),
  reviewer_id   uuid not null references profiles(id) on delete cascade,
  brand_id      uuid not null references brands(id) on delete cascade,
  status        review_status not null default 'draft',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_reviews_brand on reviews(brand_id);
create index idx_reviews_reviewer on reviews(reviewer_id);

alter table reviews enable row level security;

create policy "Reviewers can manage their own reviews"
  on reviews for all using (auth.uid() = reviewer_id);

create policy "Published reviews are publicly readable"
  on reviews for select using (status = 'published');

-- ────────────────────────────────────────────────────────────────
-- 4. Review Scores (per sub-component)
-- ────────────────────────────────────────────────────────────────

create table review_scores (
  id                  uuid primary key default gen_random_uuid(),
  review_id           uuid not null references reviews(id) on delete cascade,
  dimension_key       text not null,
  sub_component_key   text not null,
  score               smallint not null check (score >= 1 and score <= 5),
  comment             text,
  created_at          timestamptz not null default now()
);

create index idx_review_scores_review on review_scores(review_id);
create unique index idx_review_scores_unique
  on review_scores(review_id, dimension_key, sub_component_key);

alter table review_scores enable row level security;

create policy "Score owner can manage"
  on review_scores for all
  using (
    exists (
      select 1 from reviews
      where reviews.id = review_scores.review_id
        and reviews.reviewer_id = auth.uid()
    )
  );

create policy "Published scores are publicly readable"
  on review_scores for select
  using (
    exists (
      select 1 from reviews
      where reviews.id = review_scores.review_id
        and reviews.status = 'published'
    )
  );

-- ────────────────────────────────────────────────────────────────
-- 5. Review Comments (per dimension)
-- ────────────────────────────────────────────────────────────────

create table review_comments (
  id              uuid primary key default gen_random_uuid(),
  review_id       uuid not null references reviews(id) on delete cascade,
  dimension_key   text not null,
  comment_text    text not null,
  created_at      timestamptz not null default now()
);

create index idx_review_comments_review on review_comments(review_id);
create unique index idx_review_comments_unique
  on review_comments(review_id, dimension_key);

alter table review_comments enable row level security;

create policy "Comment owner can manage"
  on review_comments for all
  using (
    exists (
      select 1 from reviews
      where reviews.id = review_comments.review_id
        and reviews.reviewer_id = auth.uid()
    )
  );

create policy "Published comments are publicly readable"
  on review_comments for select
  using (
    exists (
      select 1 from reviews
      where reviews.id = review_comments.review_id
        and reviews.status = 'published'
    )
  );

-- ────────────────────────────────────────────────────────────────
-- 6. Views — Aggregated scores
-- ────────────────────────────────────────────────────────────────

-- Dimension-level averages per brand (published reviews only).
-- Each dimension score = sum of its 4 sub-component averages (max 20).
create or replace view brand_dim_scores_v as
select
  b.id as brand_id,
  b.name as brand_name,
  b.slug as brand_slug,
  rs.dimension_key,
  round(sum(rs.score)::numeric / nullif(count(distinct rs.review_id), 0), 1) as dim_score,
  count(distinct rs.review_id) as review_count
from brands b
join reviews r on r.brand_id = b.id and r.status = 'published'
join review_scores rs on rs.review_id = r.id
group by b.id, b.name, b.slug, rs.dimension_key;

-- Overall brand scores for the leaderboard.
-- Overall = sum of 5 dimension scores (each /20) = max 100.
create or replace view brand_scores_v as
select
  brand_id,
  brand_name,
  brand_slug,
  round(sum(dim_score)::numeric, 0)::int as overall_score,
  array_agg(dim_score order by dimension_key) as dim_scores,
  max(review_count) as review_count
from brand_dim_scores_v
group by brand_id, brand_name, brand_slug;

-- ────────────────────────────────────────────────────────────────
-- 7. Auto-update updated_at
-- ────────────────────────────────────────────────────────────────

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles for each row execute function update_updated_at();

create trigger brands_updated_at
  before update on brands for each row execute function update_updated_at();

create trigger reviews_updated_at
  before update on reviews for each row execute function update_updated_at();
