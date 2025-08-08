-- Configure security settings for authentication
-- Note: These are configuration changes that should be applied via the Supabase dashboard

-- The following settings should be configured in the Supabase dashboard:
-- 1. Authentication > Settings > Password Protection
--    - Enable "Leaked Password Protection"
-- 2. Authentication > Settings > Advanced
--    - Set "OTP Expiry" to 3600 seconds (1 hour) instead of default 86400 (24 hours)
-- 3. Authentication > Rate Limits
--    - Set appropriate rate limits for authentication endpoints

-- Create a security_log table to track security events
CREATE TABLE IF NOT EXISTS public.security_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.security_log ENABLE ROW LEVEL SECURITY;

-- Create policies for security log access (only admins can view)
CREATE POLICY "Security logs are not accessible to regular users"
ON public.security_log
FOR ALL
USING (false);

-- Create function to log security events
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
$$ LANGUAGE plpgsql SECURITY DEFINER;