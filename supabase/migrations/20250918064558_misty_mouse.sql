/*
  # Insert sample data for testing

  1. Sample Data
    - Sample showroom profile
    - Sample dresses
    - Sample customers
    - Sample try-ons and wishlists
    - Sample analytics events

  Note: This is for development/testing purposes only
*/

-- Insert sample showroom (this will be created automatically when a user registers)
-- The actual user registration will handle this through the application

-- Sample dresses data (will be inserted after showroom registration)
-- This is just a reference for the structure

-- Sample categories and tags for reference
INSERT INTO analytics_events (showroom_id, event_type, event_data, created_at)
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid,
  'session_start',
  '{"sample": true}'::jsonb,
  now() - interval '1 day'
WHERE NOT EXISTS (SELECT 1 FROM analytics_events WHERE event_data->>'sample' = 'true');

-- Note: Actual sample data will be inserted through the application
-- after user registration to maintain proper relationships and RLS policies