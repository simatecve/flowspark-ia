
-- Crear tabla para webhooks si no existe
CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para webhooks
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

-- Política para que todos los usuarios autenticados puedan leer webhooks
CREATE POLICY "Authenticated users can read webhooks" 
  ON public.webhooks 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Insertar el webhook para enviar mensajes si no existe
INSERT INTO public.webhooks (name, url, is_active) 
VALUES ('Enviar Mensaje CRM', 'https://n8nargentina.nocodeveloper.com/webhook/enviar_mensaje_crm', true)
ON CONFLICT (name) DO UPDATE SET 
  url = EXCLUDED.url,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Crear bucket para adjuntos de mensajes si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-attachments',
  'message-attachments',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'video/mp4', 'audio/mpeg', 'audio/wav', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Crear políticas RLS para el bucket de adjuntos de mensajes
CREATE POLICY "Authenticated users can upload message attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'message-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public can view message attachments"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'message-attachments');

CREATE POLICY "Users can update their own message attachments"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'message-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own message attachments"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'message-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
