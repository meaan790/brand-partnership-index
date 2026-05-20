-- Add structured location fields to profiles and reviews.
-- Profiles get full location from Google Places at onboarding.
-- Reviews get country + city frozen at submission time.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS store_city text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS store_region text;   -- state / province
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country text;        -- ISO 3166-1 alpha-2
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS place_id text;       -- Google Places ID

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS store_city text;
