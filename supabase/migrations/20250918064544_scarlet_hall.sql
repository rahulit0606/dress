/*
  # Create database functions and triggers

  1. Functions
    - Update dress try-on counts
    - Update customer activity
    - Generate analytics summaries

  2. Triggers
    - Auto-update counters when try-ons are created
    - Update customer last activity
    - Create analytics events
*/

-- Function to update dress try-on count
CREATE OR REPLACE FUNCTION update_dress_try_on_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE dresses 
    SET try_on_count = try_on_count + 1 
    WHERE id = NEW.dress_id;
    
    UPDATE customers 
    SET total_try_ons = total_try_ons + 1,
        last_activity_at = now()
    WHERE id = NEW.customer_id;
    
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update wishlist count
CREATE OR REPLACE FUNCTION update_wishlist_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE dresses 
    SET wishlist_count = wishlist_count + 1 
    WHERE id = NEW.dress_id;
    
    UPDATE customers 
    SET total_wishlists = total_wishlists + 1,
        last_activity_at = now()
    WHERE id = NEW.customer_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE dresses 
    SET wishlist_count = wishlist_count - 1 
    WHERE id = OLD.dress_id;
    
    UPDATE customers 
    SET total_wishlists = total_wishlists - 1,
        last_activity_at = now()
    WHERE id = OLD.customer_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to create analytics events
CREATE OR REPLACE FUNCTION create_analytics_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'try_ons' THEN
      INSERT INTO analytics_events (showroom_id, event_type, customer_id, dress_id, session_id)
      VALUES (NEW.showroom_id, 'try_on', NEW.customer_id, NEW.dress_id, NEW.session_id);
    ELSIF TG_TABLE_NAME = 'wishlists' THEN
      INSERT INTO analytics_events (showroom_id, event_type, customer_id, dress_id)
      VALUES (NEW.showroom_id, 'wishlist_add', NEW.customer_id, NEW.dress_id);
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND TG_TABLE_NAME = 'wishlists' THEN
    INSERT INTO analytics_events (showroom_id, event_type, customer_id, dress_id)
    VALUES (OLD.showroom_id, 'wishlist_remove', OLD.customer_id, OLD.dress_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER try_ons_update_counts
  AFTER INSERT ON try_ons
  FOR EACH ROW
  EXECUTE FUNCTION update_dress_try_on_count();

CREATE TRIGGER wishlists_update_counts
  AFTER INSERT OR DELETE ON wishlists
  FOR EACH ROW
  EXECUTE FUNCTION update_wishlist_count();

CREATE TRIGGER try_ons_analytics
  AFTER INSERT ON try_ons
  FOR EACH ROW
  EXECUTE FUNCTION create_analytics_event();

CREATE TRIGGER wishlists_analytics
  AFTER INSERT OR DELETE ON wishlists
  FOR EACH ROW
  EXECUTE FUNCTION create_analytics_event();