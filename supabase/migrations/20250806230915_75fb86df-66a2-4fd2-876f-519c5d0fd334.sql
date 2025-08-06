
-- Actualizar la función handle_new_message para manejar mejor la lógica
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER AS $$
DECLARE
  conversation_uuid UUID;
BEGIN
  -- Buscar si ya existe una conversación para este usuario y número de WhatsApp
  SELECT id INTO conversation_uuid
  FROM public.conversations 
  WHERE user_id = NEW.user_id AND whatsapp_number = NEW.whatsapp_number;
  
  -- Si no existe conversación, crearla
  IF conversation_uuid IS NULL THEN
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
    RETURNING id INTO conversation_uuid;
  ELSE
    -- Si existe, actualizar la conversación
    UPDATE public.conversations 
    SET 
      pushname = COALESCE(NEW.pushname, pushname),
      last_message = NEW.message,
      last_message_at = NEW.created_at,
      unread_count = CASE 
        WHEN NEW.direction = 'incoming' THEN unread_count + 1 
        ELSE unread_count 
      END,
      updated_at = now()
    WHERE id = conversation_uuid;
  END IF;
  
  -- Asignar el conversation_id al nuevo mensaje
  NEW.conversation_id = conversation_uuid;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hacer que conversation_id sea nullable ya que se asignará automáticamente
ALTER TABLE public.messages ALTER COLUMN conversation_id DROP NOT NULL;
