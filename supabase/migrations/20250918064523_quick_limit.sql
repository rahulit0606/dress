/*
  # Create analytics tables

  1. New Tables
    - `analytics_events`
      - `id` (uuid, primary key)
      - `showroom_id` (uuid, references showroom_profiles)
      - `event_type` (text, not null)
      - `event_data` (jsonb)
      - `customer_id` (uuid, references customers)
      - `dress_id` (uuid, references dresses)
      - `session_id` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `analytics_events` table
    - Add policies for showroom owners to view their analytics
*/

CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  showroom_id uuid NOT NULL REFERENCES showroom_profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('try_on', 'wishlist_add', 'wishlist_remove', 'dress_view', 'customer_signup', 'session_start', 'session_end')),
  event_data jsonb DEFAULT '{}',
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  dress_id uuid REFERENCES dresses(id) ON DELETE SET NULL,
  session_id text,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Showroom owners can view their analytics"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (showroom_id = auth.uid());

CREATE POLICY "System can insert analytics events"
  ON analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (showroom_id = auth.uid());

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS analytics_events_showroom_id_idx ON analytics_events(showroom_id);
CREATE INDEX IF NOT EXISTS analytics_events_type_idx ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_customer_id_idx ON analytics_events(customer_id);
CREATE INDEX IF NOT EXISTS analytics_events_dress_id_idx ON analytics_events(dress_id);
CREATE INDEX IF NOT EXISTS analytics_events_session_id_idx ON analytics_events(session_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS analytics_events_showroom_type_date_idx ON analytics_events(showroom_id, event_type, created_at DESC);