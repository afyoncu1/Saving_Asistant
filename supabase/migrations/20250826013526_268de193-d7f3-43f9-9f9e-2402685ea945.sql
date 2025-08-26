-- Create purchase_decisions table
CREATE TABLE public.purchase_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('bought', 'saved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.purchase_decisions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own purchase decisions" 
ON public.purchase_decisions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchase decisions" 
ON public.purchase_decisions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_purchase_decisions_user_id ON public.purchase_decisions(user_id);
CREATE INDEX idx_purchase_decisions_created_at ON public.purchase_decisions(created_at DESC);