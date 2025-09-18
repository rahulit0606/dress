/*
  # Create campaigns table

  1. New Tables
    - `campaigns`
      - `id` (uuid, primary key)
      - `showroom_id` (uuid, references showroom_profiles)
      - `name` (text, not null)
      - `type` (text, not null)
      - `message` (text, not null)
      - `target_customers` (uuid array)
      - `status` (text, default 'draft')
      - `scheduled_at` (timestamp)
      - `sent_at` (timestamp)
      - `metadata` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `campaigns` table
    - Add policies for showroom owners to manage their campaigns
*/

CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  showroom_id uuid NOT NULL REFERENCES showroom_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('whatsapp', 'email', 'sms')),
  message text NOT NULL,
  target_customers uuid[] DEFAULT '{}',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  total_recipients integer DEFAULT 0,
  successful_sends integer DEFAULT 0,
  failed_sends integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Showroom owners can manage their campaigns"
  ON campaigns
  FOR ALL
  TO authenticated
  USING (showroom_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS campaigns_showroom_id_idx ON campaigns(showroom_id);
CREATE INDEX IF NOT EXISTS campaigns_status_idx ON campaigns(status);
CREATE INDEX IF NOT EXISTS campaigns_scheduled_at_idx ON campaigns(scheduled_at);
CREATE INDEX IF NOT EXISTS campaigns_created_at_idx ON campaigns(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();