CREATE TABLE IF NOT EXISTS brand_commitments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id    uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  text        text NOT NULL,
  active      boolean NOT NULL DEFAULT true,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brand_commitments_brand ON brand_commitments(brand_id);

ALTER TABLE brand_commitments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Commitments are publicly readable"
  ON brand_commitments FOR SELECT USING (true);

CREATE POLICY "Brand owner can manage commitments"
  ON brand_commitments FOR ALL USING (
    EXISTS (
      SELECT 1 FROM brands
      WHERE brands.id = brand_commitments.brand_id
        AND brands.claimed_by = auth.uid()
    )
  );
