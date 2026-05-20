/* ── Domain types for the Brand Partnership Index ── */

export type UserRole = "retailer" | "brand";

export type ReviewStatus = "draft" | "submitted" | "published";

export interface Dimension {
  key: string;
  name: string;
  short: string;
  blurb: string;
}

export interface SubComponent {
  key: string;
  label: string;
  desc: string;
  anchor5: string;
  anchor1: string;
  prompt: string;
}

export type DimensionSubs = Record<string, SubComponent[]>;

export interface Brand {
  id: string;
  name: string;
  slug: string;
  domain: string;
  logo_url: string | null;
  categories: string[];
  claimed_by: string | null;
  description: string | null;
  created_at: string;
}

export interface BrandWithScores extends Brand {
  score: number;
  dims: number[];
  review_count: number;
  change: string;
  spark: number[];
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  company_name: string;
  store_location: string | null;
  store_city: string | null;
  store_region: string | null;
  country: string | null;
  place_id: string | null;
  anonymous_display_name: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  reviewer_id: string;
  brand_id: string;
  status: ReviewStatus;
  country: string | null;
  store_city: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewScore {
  id: string;
  review_id: string;
  dimension_key: string;
  sub_component_key: string;
  score: number; // 1-5 stars
  comment: string | null;
}

export interface ReviewComment {
  id: string;
  review_id: string;
  dimension_key: string;
  comment_text: string;
}

export interface ReviewWithScores extends Review {
  scores: ReviewScore[];
  comments: ReviewComment[];
  reviewer?: {
    company_name: string;
    store_location: string | null;
    anonymous_display_name: string | null;
  };
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  slug: string;
  domain: string;
  categories: string[];
  score: number;
  dims: number[];
  review_count: number;
  change: string;
}
