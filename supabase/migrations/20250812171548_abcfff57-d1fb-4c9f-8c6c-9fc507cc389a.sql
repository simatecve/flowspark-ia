
-- Crear tabla para respuestas rápidas
CREATE TABLE public.quick_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  shortcut TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agregar RLS para respuestas rápidas
ALTER TABLE public.quick_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quick replies" 
  ON public.quick_replies 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quick replies" 
  ON public.quick_replies 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quick replies" 
  ON public.quick_replies 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quick replies" 
  ON public.quick_replies 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Crear tabla para mensajes programados
CREATE TABLE public.scheduled_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  instance_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  pushname TEXT,
  message TEXT NOT NULL,
  attachment_url TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT scheduled_messages_status_check CHECK (status IN ('pending', 'sent', 'failed', 'cancelled'))
);

-- Agregar RLS para mensajes programados
ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scheduled messages" 
  ON public.scheduled_messages 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scheduled messages" 
  ON public.scheduled_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled messages" 
  ON public.scheduled_messages 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled messages" 
  ON public.scheduled_messages 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_quick_replies_user_id ON public.quick_replies(user_id);
CREATE INDEX idx_scheduled_messages_user_id ON public.scheduled_messages(user_id);
CREATE INDEX idx_scheduled_messages_scheduled_for ON public.scheduled_messages(scheduled_for);
CREATE INDEX idx_scheduled_messages_status ON public.scheduled_messages(status);
