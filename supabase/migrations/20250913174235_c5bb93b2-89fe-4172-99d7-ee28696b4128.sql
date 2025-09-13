-- Fix search path security issue for the function
CREATE OR REPLACE FUNCTION public.update_monthly_summary()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Set month and year from created_at if not provided
  IF NEW.month IS NULL THEN
    NEW.month := EXTRACT(MONTH FROM NEW.created_at);
  END IF;
  
  IF NEW.year IS NULL THEN
    NEW.year := EXTRACT(YEAR FROM NEW.created_at);
  END IF;

  INSERT INTO public.monthly_summaries (user_id, year, month, total_spent, total_saved)
  VALUES (
    NEW.user_id, 
    NEW.year, 
    NEW.month,
    CASE WHEN NEW.decision = 'bought' THEN NEW.product_price ELSE 0 END,
    CASE WHEN NEW.decision = 'saved' THEN NEW.product_price ELSE 0 END
  )
  ON CONFLICT (user_id, year, month) 
  DO UPDATE SET
    total_spent = monthly_summaries.total_spent + CASE WHEN NEW.decision = 'bought' THEN NEW.product_price ELSE 0 END,
    total_saved = monthly_summaries.total_saved + CASE WHEN NEW.decision = 'saved' THEN NEW.product_price ELSE 0 END,
    updated_at = now();
    
  RETURN NEW;
END;
$$;