/*
  # Fix sample data migration

  1. Changes
    - Remove the problematic sample analytics event that references non-existent showroom
    - The sample data will be created properly when users register through the application

  Note: This migration removes the problematic sample data insertion
*/

-- Remove any existing sample data that might cause foreign key violations
DELETE FROM analytics_events WHERE event_data->>'sample' = 'true';

-- Note: Sample data will be created automatically when:
-- 1. Users register through the application (creates showroom_profiles)
-- 2. Users add dresses (creates dresses table entries)
-- 3. Customers use the mobile app (creates customers and try_ons)
-- 4. Analytics events are generated through normal app usage

-- This ensures all foreign key relationships are maintained properly