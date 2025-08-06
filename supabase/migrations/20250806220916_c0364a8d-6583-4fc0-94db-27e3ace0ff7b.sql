
-- Create table for mass campaigns
CREATE TABLE public.mass_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  name TEXT NOT NULL,
  description TEXT,
  whatsapp_connection_name TEXT NOT NULL,
  campaign_message TEXT NOT NULL,
  edit_with_ai BOOLEAN NOT NULL DEFAULT false,
  min_delay INTEGER NOT NULL DEFAULT 1000,
  max_delay INTEGER NOT NULL DEFAULT 5000,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.mass_campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies for mass campaigns
CREATE POLICY "Users can view their own campaigns" 
  ON public.mass_campaigns 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns" 
  ON public.mass_campaigns 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" 
  ON public.mass_campaigns 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" 
  ON public.mass_campaigns 
  FOR DELETE 
  USING (auth.uid() = user_id);
