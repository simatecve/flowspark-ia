
-- Eliminar la tabla existente si existe
DROP TABLE IF EXISTS public.webhooks CASCADE;

-- Crear la tabla webhooks sin user_id
CREATE TABLE public.webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  function_description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en la tabla
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para usuarios autenticados
CREATE POLICY "Authenticated users can view webhooks" 
  ON public.webhooks 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create webhooks" 
  ON public.webhooks 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update webhooks" 
  ON public.webhooks 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete webhooks" 
  ON public.webhooks 
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Insertar el webhook del sistema
INSERT INTO public.webhooks (
  name,
  url,
  function_description,
  is_active
) VALUES (
  'Crear Instancia WhatsApp',
  'https://n8nargentina.nocodeveloper.com/webhook/crear_instancia',
  'Webhook para crear nuevas instancias de WhatsApp en el sistema externo',
  true
);
