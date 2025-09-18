/*
  # Create wishlists table

  1. New Tables
    - `wishlists`
      - `id` (uuid, primary key)
      - `showroom_id` (uuid, references showroom_profiles)
      - `customer_id` (uuid, references customers)
      - `dress_id` (uuid, references dresses)
      - `notes` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `wishlists` table
    - Add policies for showroom owners to view their wishlists
*/

CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  showroom_id uuid NOT NULL REFERENCES showroom_profiles(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  dress_id uuid NOT NULL REFERENCES dresses(id) ON DELETE CASCADE,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(customer_id, dress_id)
);

-- Enable RLS
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Showroom owners can view their wishlists"
  ON wishlists
  FOR SELECT
  TO authenticated
  USING (showroom_id = auth.uid());

CREATE POLICY "System can manage wishlists"
  ON wishlists
  FOR ALL
  TO authenticated
  USING (showroom_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS wishlists_showroom_id_idx ON wishlists(showroom_id);
CREATE INDEX IF NOT EXISTS wishlists_customer_id_idx ON wishlists(customer_id);
CREATE INDEX IF NOT EXISTS wishlists_dress_id_idx ON wishlists(dress_id);
CREATE INDEX IF NOT EXISTS wishlists_created_at_idx ON wishlists(created_at DESC);