
-- Primero eliminar las políticas RLS existentes que dependen de user_id
DROP POLICY IF EXISTS "Users can create their own webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Users can delete their own webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Users can update their own webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Users can view their own webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Users can view system webhooks" ON public.webhooks;

-- Eliminar la restricción de clave foránea si existe
ALTER TABLE public.webhooks DROP CONSTRAINT IF EXISTS webhooks_user_id_fkey;

-- Eliminar la columna user_id
ALTER TABLE public.webhooks DROP COLUMN IF EXISTS user_id;

-- Crear nuevas políticas RLS que permitan a todos los usuarios autenticados acceder a los webhooks
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

-- Ahora insertar el webhook del sistema
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
) 
ON CONFLICT (name) DO NOTHING;
