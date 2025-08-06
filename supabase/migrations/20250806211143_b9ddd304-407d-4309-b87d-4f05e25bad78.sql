
-- Insertar el webhook para eliminar instancia WhatsApp
INSERT INTO public.webhooks (
  name,
  url,
  function_description,
  is_active
) VALUES (
  'Eliminar Instancia WhatsApp',
  'https://n8nargentina.nocodeveloper.com/webhook/eliminar_instancia',
  'Webhook para eliminar instancias de WhatsApp en el sistema externo',
  true
);
