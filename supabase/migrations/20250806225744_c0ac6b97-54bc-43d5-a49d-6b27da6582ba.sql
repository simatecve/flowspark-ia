
-- Crear tabla para conversaciones
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  whatsapp_number TEXT NOT NULL,
  pushname TEXT,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, whatsapp_number)
);

-- Crear tabla para mensajes
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  instance_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  pushname TEXT,
  message TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  is_bot BOOLEAN DEFAULT false,
  attachment_url TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio', 'document')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Políticas para conversations
CREATE POLICY "Users can view their own conversations" 
  ON public.conversations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" 
  ON public.conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
  ON public.conversations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
  ON public.conversations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Habilitar RLS para messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Políticas para messages
CREATE POLICY "Users can view their own messages" 
  ON public.messages 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messages" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = messages.conversation_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own messages" 
  ON public.messages 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" 
  ON public.messages 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Crear función para manejar la creación automática de conversaciones
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Crear o actualizar conversación
  INSERT INTO public.conversations (
    user_id, 
    whatsapp_number, 
    pushname, 
    last_message, 
    last_message_at,
    unread_count
  )
  VALUES (
    NEW.user_id,
    NEW.whatsapp_number,
    NEW.pushname,
    NEW.message,
    NEW.created_at,
    CASE WHEN NEW.direction = 'incoming' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, whatsapp_number) 
  DO UPDATE SET
    pushname = COALESCE(NEW.pushname, conversations.pushname),
    last_message = NEW.message,
    last_message_at = NEW.created_at,
    unread_count = CASE 
      WHEN NEW.direction = 'incoming' THEN conversations.unread_count + 1 
      ELSE conversations.unread_count 
    END,
    updated_at = now()
  RETURNING id INTO NEW.conversation_id;
  
  -- Si no se pudo obtener el ID de la inserción, lo buscamos
  IF NEW.conversation_id IS NULL THEN
    SELECT id INTO NEW.conversation_id 
    FROM public.conversations 
    WHERE user_id = NEW.user_id AND whatsapp_number = NEW.whatsapp_number;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para manejar nuevos mensajes
CREATE TRIGGER handle_new_message_trigger
  BEFORE INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_message();

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_conversations_user_last_message ON public.conversations(user_id, last_message_at DESC);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_user_whatsapp ON public.messages(user_id, whatsapp_number, created_at DESC);

-- Habilitar realtime para las tablas
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
