/*
  # Create dresses table

  1. New Tables
    - `dresses`
      - `id` (uuid, primary key)
      - `showroom_id` (uuid, references showroom_profiles)
      - `name` (text, not null)
      - `description` (text)
      - `category` (text, not null)
      - `price` (decimal)
      - `sizes` (text array)
      - `colors` (text array)
      - `image_urls` (text array)
      - `model_3d_url` (text)
      - `status` (text, default 'active')
      - `tags` (text array)
      - `metadata` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `dresses` table
    - Add policies for showroom owners to manage their dresses
*/

CREATE TABLE IF NOT EXISTS dresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  showroom_id uuid NOT NULL REFERENCES showroom_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  price decimal(10,2),
  sizes text[] DEFAULT '{}',
  colors text[] DEFAULT '{}',
  image_urls text[] DEFAULT '{}',
  model_3d_url text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  try_on_count integer DEFAULT 0,
  wishlist_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE dresses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Showroom owners can manage their dresses"
  ON dresses
  FOR ALL
  TO authenticated
  USING (showroom_id = auth.uid());

-- Public read access for mobile app (with API key validation)
CREATE POLICY "Public can read active dresses"
  ON dresses
  FOR SELECT
  TO anon
  USING (status = 'active');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS dresses_showroom_id_idx ON dresses(showroom_id);
CREATE INDEX IF NOT EXISTS dresses_category_idx ON dresses(category);
CREATE INDEX IF NOT EXISTS dresses_status_idx ON dresses(status);
CREATE INDEX IF NOT EXISTS dresses_created_at_idx ON dresses(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER dresses_updated_at
  BEFORE UPDATE ON dresses
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();