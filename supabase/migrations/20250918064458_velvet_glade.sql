/*
  # Create customers table

  1. New Tables
    - `customers`
      - `id` (uuid, primary key)
      - `showroom_id` (uuid, references showroom_profiles)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `avatar_url` (text)
      - `tags` (text array)
      - `notes` (text)
      - `preferences` (jsonb)
      - `last_activity_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `customers` table
    - Add policies for showroom owners to manage their customers
*/

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  showroom_id uuid NOT NULL REFERENCES showroom_profiles(id) ON DELETE CASCADE,
  name text,
  email text,
  phone text,
  avatar_url text,
  tags text[] DEFAULT '{}',
  notes text,
  preferences jsonb DEFAULT '{}',
  total_try_ons integer DEFAULT 0,
  total_wishlists integer DEFAULT 0,
  last_activity_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Showroom owners can manage their customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (showroom_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS customers_showroom_id_idx ON customers(showroom_id);
CREATE INDEX IF NOT EXISTS customers_email_idx ON customers(email);
CREATE INDEX IF NOT EXISTS customers_phone_idx ON customers(phone);
CREATE INDEX IF NOT EXISTS customers_last_activity_idx ON customers(last_activity_at DESC);

-- Trigger for updated_at
CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();