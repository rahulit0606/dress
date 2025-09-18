/*
  # Create subscriptions table

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `showroom_id` (uuid, references showroom_profiles)
      - `plan_name` (text, not null)
      - `status` (text, not null)
      - `current_period_start` (timestamp)
      - `current_period_end` (timestamp)
      - `cancel_at_period_end` (boolean)
      - `payment_provider` (text)
      - `provider_subscription_id` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `subscriptions` table
    - Add policies for showroom owners to view their subscription
*/

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  showroom_id uuid NOT NULL REFERENCES showroom_profiles(id) ON DELETE CASCADE,
  plan_name text NOT NULL CHECK (plan_name IN ('basic', 'pro', 'premium')),
  status text NOT NULL CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due', 'trialing')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  payment_provider text CHECK (payment_provider IN ('stripe', 'razorpay')),
  provider_subscription_id text,
  trial_end timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(showroom_id)
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Showroom owners can view their subscription"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (showroom_id = auth.uid());

CREATE POLICY "System can manage subscriptions"
  ON subscriptions
  FOR ALL
  TO service_role;

-- Indexes
CREATE INDEX IF NOT EXISTS subscriptions_showroom_id_idx ON subscriptions(showroom_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);
CREATE INDEX IF NOT EXISTS subscriptions_provider_id_idx ON subscriptions(provider_subscription_id);

-- Trigger for updated_at
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();