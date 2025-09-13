-- Add month and year columns to purchase_decisions for better monthly tracking
ALTER TABLE public.purchase_decisions 
ADD COLUMN month INTEGER,
ADD COLUMN year INTEGER;

-- Update existing records with month and year values
UPDATE public.purchase_decisions 
SET 
  month = EXTRACT(MONTH FROM created_at),
  year = EXTRACT(YEAR FROM created_at);

-- Make columns NOT NULL after updating existing data
ALTER TABLE public.purchase_decisions 
ALTER COLUMN month SET NOT NULL,
ALTER COLUMN year SET NOT NULL;

-- Create index for efficient monthly queries
CREATE INDEX idx_purchase_decisions_user_month_year ON public.purchase_decisions(user_id, year, month);

-- Create monthly_summaries table to store aggregated monthly data
CREATE TABLE public.monthly_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  total_spent NUMERIC NOT NULL DEFAULT 0,
  total_saved NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, year, month)
);

-- Enable RLS on monthly_summaries
ALTER TABLE public.monthly_summaries ENABLE ROW LEVEL SECURITY;

-- Create policies for monthly_summaries
CREATE POLICY "Users can view their own monthly summaries" 
ON public.monthly_summaries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own monthly summaries" 
ON public.monthly_summaries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly summaries" 
ON public.monthly_summaries 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on monthly_summaries
CREATE TRIGGER update_monthly_summaries_updated_at
BEFORE UPDATE ON public.monthly_summaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update monthly summaries when purchase decisions are made
CREATE OR REPLACE FUNCTION public.update_monthly_summary()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update monthly summaries and set month/year
CREATE TRIGGER update_monthly_summary_on_purchase
BEFORE INSERT ON public.purchase_decisions
FOR EACH ROW
EXECUTE FUNCTION public.update_monthly_summary();