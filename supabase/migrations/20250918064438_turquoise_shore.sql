/*
  # Create showroom profiles table

  1. New Tables
    - `showroom_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `showroom_name` (text, not null)
      - `email` (text, unique)
      - `phone` (text)
      - `address` (text)
      - `logo_url` (text)
      - `subscription_plan` (text, default 'basic')
      - `subscription_status` (text, default 'active')
      - `api_key` (text, unique)
      - `settings` (jsonb, default '{}')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `showroom_profiles` table
    - Add policy for users to read/update their own profile
*/

CREATE TABLE IF NOT EXISTS showroom_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  showroom_name text NOT NULL,
  email text UNIQUE,
  phone text,
  address text,
  logo_url text,
  subscription_plan text DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'pro', 'premium')),
  subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
  api_key text UNIQUE DEFAULT gen_random_uuid()::text,
  settings jsonb DEFAULT '{}',
  role text DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'agent')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE showroom_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own profile"
  ON showroom_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON showroom_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON showroom_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER showroom_profiles_updated_at
  BEFORE UPDATE ON showroom_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();