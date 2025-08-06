
-- Create table for WhatsApp connections
CREATE TABLE public.whatsapp_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for webhook configurations
CREATE TABLE public.webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  function_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) for whatsapp_connections
ALTER TABLE public.whatsapp_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own whatsapp connections" 
  ON public.whatsapp_connections 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own whatsapp connections" 
  ON public.whatsapp_connections 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own whatsapp connections" 
  ON public.whatsapp_connections 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own whatsapp connections" 
  ON public.whatsapp_connections 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add Row Level Security (RLS) for webhooks
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own webhooks" 
  ON public.webhooks 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own webhooks" 
  ON public.webhooks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own webhooks" 
  ON public.webhooks 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own webhooks" 
  ON public.webhooks 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Insert the default webhook for creating WhatsApp instances
INSERT INTO public.webhooks (user_id, name, url, function_description)
SELECT 
  auth.uid(),
  'Crear Instancia WhatsApp',
  'https://n8nargentina.nocodeveloper.com/webhook/crear_instancia',
  'Webhook para crear nuevas instancias de WhatsApp'
WHERE auth.uid() IS NOT NULL;
