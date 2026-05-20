-- ============================================================
-- Brand Partnership Index — Complete Setup
-- Run this entire file in the Supabase SQL Editor in one go.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. User Profiles (extends Supabase auth.users)
-- ────────────────────────────────────────────────────────────

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

-- ────────────────────────────────────────────────────────────
-- 2. Brands
-- ────────────────────────────────────────────────────────────

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

-- ────────────────────────────────────────────────────────────
-- 3. Reviews
-- ────────────────────────────────────────────────────────────

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

-- ────────────────────────────────────────────────────────────
-- 4. Review Scores (per sub-component)
-- ────────────────────────────────────────────────────────────

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

-- ────────────────────────────────────────────────────────────
-- 5. Review Comments (per dimension)
-- ────────────────────────────────────────────────────────────

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

-- ────────────────────────────────────────────────────────────
-- 6. Views — Aggregated scores
-- ────────────────────────────────────────────────────────────

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

-- ────────────────────────────────────────────────────────────
-- 7. Auto-update updated_at
-- ────────────────────────────────────────────────────────────

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

-- ────────────────────────────────────────────────────────────
-- 8. Auto-create profile on signup
-- ────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, role, company_name)
  values (
    new.id,
    new.email,
    coalesce(
      (new.raw_user_meta_data->>'role')::public.user_role,
      'retailer'
    ),
    coalesce(new.raw_user_meta_data->>'company_name', '')
  );
  return new;
end;
$$ language plpgsql;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- 9. Seed brands
-- ────────────────────────────────────────────────────────────

insert into brands (name, slug, domain, categories, description) values
  ('Brooks',            'brooks',            'brooksrunning.com',         '{"Running"}',                             'A leading manufacturer of high-performance running footwear, apparel, and accessories, known for its strong commitment to specialty retail partners.'),
  ('Hoka',              'hoka',              'hoka.com',                  '{"Running","Outdoor"}',                   'A premium running and outdoor footwear brand recognized for maximum cushioning and rapid product innovation.'),
  ('Patagonia',         'patagonia',         'patagonia.com',             '{"Outdoor","Surf","Ski"}',                'An outdoor apparel and gear company known for environmental stewardship and lifetime repair commitments.'),
  ('Nemo',              'nemo',              'nemoequipment.com',         '{"Outdoor"}',                             'Designer of innovative outdoor sleeping bags, tents, and camping gear, born from a New Hampshire engineering studio.'),
  ('Big Agnes',         'big-agnes',         'bigagnes.com',              '{"Outdoor"}',                             'A Steamboat Springs-based maker of lightweight tents, sleeping bags, and pads built for backcountry trips.'),
  ('YETI',              'yeti',              'yeti.com',                  '{"Outdoor"}',                             'Premium coolers, drinkware, and outdoor lifestyle products engineered for durability and performance.'),
  ('Black Diamond',     'black-diamond',     'blackdiamondequipment.com', '{"Outdoor","Ski"}',                       'Climbing, skiing, and mountain sports equipment, designed by climbers in Salt Lake City.'),
  ('Salomon',           'salomon',           'salomon.com',               '{"Running","Outdoor","Ski"}',             'French maker of trail running, hiking, and ski equipment with a strong heritage in alpine sport.'),
  ('On',                'on',                'on.com',                    '{"Running"}',                             'Swiss running brand known for CloudTec sole technology and rapid growth in performance and lifestyle categories.'),
  ('Cotopaxi',          'cotopaxi',          'cotopaxi.com',              '{"Outdoor"}',                             'Outdoor apparel and gear maker with a benefit corporation model and a focus on humanitarian impact.'),
  ('Smartwool',         'smartwool',         'smartwool.com',             '{"Outdoor","Running"}',                   'Performance merino wool socks and apparel, designed in Steamboat Springs, Colorado.'),
  ('Arc''teryx',        'arcteryx',          'arcteryx.com',              '{"Outdoor","Ski"}',                       'Vancouver-based technical apparel and equipment company known for premium alpine outerwear.'),
  ('KEEN',              'keen',              'keenfootwear.com',          '{"Outdoor"}',                             'American footwear company best known for hybrid sandal-shoes and an emphasis on toe protection.'),
  ('Osprey',            'osprey',            'osprey.com',                '{"Outdoor"}',                             'Backpack and travel pack specialist, designed in Cortez, Colorado, with a guaranteed-for-life warranty.'),
  ('Kelty',             'kelty',             'kelty.com',                 '{"Outdoor"}',                             'American outdoor brand offering accessible camping gear, packs, and family-friendly outdoor equipment.'),
  ('The North Face',    'the-north-face',    'thenorthface.com',          '{"Outdoor","Ski"}',                       'Global outdoor brand offering technical apparel, footwear, and equipment across alpine, run, and lifestyle categories.'),
  ('Kuhl',              'kuhl',              'kuhl.com',                  '{"Outdoor"}',                             'Salt Lake City-based outdoor apparel brand known for durable mountain pants and casual mountain style.'),
  ('Columbia',          'columbia',          'columbia.com',              '{"Outdoor"}',                             'Mass-market outdoor apparel company with a wide range of value-oriented technical clothing and footwear.'),
  ('Mountain Hardwear', 'mountain-hardwear', 'mountainhardwear.com',     '{"Outdoor"}',                             'Technical alpine and climbing apparel and equipment brand, originally spun out of Sierra Designs.'),
  ('prAna',             'prana',             'prana.com',                 '{"Outdoor"}',                             'Yoga, climbing, and travel apparel brand emphasizing sustainable materials and natural fibers.');
