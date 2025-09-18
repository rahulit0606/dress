/*
  # Create try-ons table

  1. New Tables
    - `try_ons`
      - `id` (uuid, primary key)
      - `showroom_id` (uuid, references showroom_profiles)
      - `customer_id` (uuid, references customers)
      - `dress_id` (uuid, references dresses)
      - `customer_image_url` (text)
      - `result_image_url` (text)
      - `session_id` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `try_ons` table
    - Add policies for showroom owners to view their try-ons
*/

CREATE TABLE IF NOT EXISTS try_ons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  showroom_id uuid NOT NULL REFERENCES showroom_profiles(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  dress_id uuid NOT NULL REFERENCES dresses(id) ON DELETE CASCADE,
  customer_image_url text NOT NULL,
  result_image_url text,
  session_id text,
  processing_status text DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE try_ons ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Showroom owners can view their try-ons"
  ON try_ons
  FOR SELECT
  TO authenticated
  USING (showroom_id = auth.uid());

CREATE POLICY "System can insert try-ons"
  ON try_ons
  FOR INSERT
  TO authenticated
  WITH CHECK (showroom_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS try_ons_showroom_id_idx ON try_ons(showroom_id);
CREATE INDEX IF NOT EXISTS try_ons_customer_id_idx ON try_ons(customer_id);
CREATE INDEX IF NOT EXISTS try_ons_dress_id_idx ON try_ons(dress_id);
CREATE INDEX IF NOT EXISTS try_ons_created_at_idx ON try_ons(created_at DESC);
CREATE INDEX IF NOT EXISTS try_ons_session_id_idx ON try_ons(session_id);