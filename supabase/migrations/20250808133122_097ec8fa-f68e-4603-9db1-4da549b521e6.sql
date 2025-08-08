-- Fix the security function to use proper search path
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  user_id UUID DEFAULT NULL,
  ip_address INET DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.security_log (event_type, user_id, ip_address, user_agent, details)
  VALUES (event_type, user_id, ip_address, user_agent, details)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER 
   SET search_path = public;