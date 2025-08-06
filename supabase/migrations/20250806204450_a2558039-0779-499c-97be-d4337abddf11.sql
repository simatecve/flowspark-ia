
-- Insertar el webhook para crear instancias de WhatsApp
INSERT INTO public.webhooks (
  user_id,
  name,
  url,
  function_description,
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid, -- UUID especial para webhooks públicos del sistema
  'Crear Instancia WhatsApp',
  'https://n8nargentina.nocodeveloper.com/webhook/crear_instancia',
  'Webhook para crear nuevas instancias de WhatsApp en el sistema externo',
  true
) 
ON CONFLICT DO NOTHING;

-- Crear una política RLS que permita a todos los usuarios autenticados ver los webhooks del sistema
CREATE POLICY "Users can view system webhooks" 
  ON public.webhooks 
  FOR SELECT 
  USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid OR auth.uid() = user_id);
