
-- Create a table for AI bots
CREATE TABLE public.ai_bots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  whatsapp_connection_id UUID REFERENCES whatsapp_connections(id) ON DELETE CASCADE NOT NULL,
  instructions TEXT NOT NULL,
  message_delay INTEGER NOT NULL DEFAULT 1000,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own bots
ALTER TABLE public.ai_bots ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own bots
CREATE POLICY "Users can view their own AI bots" 
  ON public.ai_bots 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own bots
CREATE POLICY "Users can create their own AI bots" 
  ON public.ai_bots 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own bots
CREATE POLICY "Users can update their own AI bots" 
  ON public.ai_bots 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own bots
CREATE POLICY "Users can delete their own AI bots" 
  ON public.ai_bots 
  FOR DELETE 
  USING (auth.uid() = user_id);
