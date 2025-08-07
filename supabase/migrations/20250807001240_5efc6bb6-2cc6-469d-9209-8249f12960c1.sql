
-- Crear tabla para almacenar API keys de IA
CREATE TABLE public.ai_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'gemini', 'groq', 'anthropic')),
  api_key TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Garantizar que cada usuario tenga solo una API key por proveedor
  UNIQUE(user_id, provider)
);

-- Habilitar Row Level Security
ALTER TABLE public.ai_api_keys ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para que los usuarios solo puedan ver y modificar sus propias API keys
CREATE POLICY "Users can view their own API keys" 
  ON public.ai_api_keys 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys" 
  ON public.ai_api_keys 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" 
  ON public.ai_api_keys 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" 
  ON public.ai_api_keys 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Función para actualizar el timestamp de updated_at automáticamente
CREATE OR REPLACE FUNCTION update_ai_api_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_ai_api_keys_updated_at
  BEFORE UPDATE ON public.ai_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_api_keys_updated_at();
