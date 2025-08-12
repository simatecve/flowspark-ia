
-- Agregar columna instance_name a la tabla conversations
ALTER TABLE public.conversations 
ADD COLUMN instance_name text;

-- Actualizar conversaciones existentes con el instance_name del primer mensaje
UPDATE public.conversations 
SET instance_name = (
  SELECT m.instance_name 
  FROM public.messages m 
  WHERE m.conversation_id = conversations.id 
  ORDER BY m.created_at ASC 
  LIMIT 1
)
WHERE instance_name IS NULL;

-- Actualizar el trigger para incluir instance_name al crear conversaciones
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  conversation_uuid UUID;
BEGIN
  -- Buscar si ya existe una conversación para este número de WhatsApp e instancia
  -- Si hay user_id, buscar por user_id + whatsapp_number + instance_name
  -- Si no hay user_id, buscar solo por whatsapp_number + instance_name donde user_id es NULL
  IF NEW.user_id IS NOT NULL THEN
    SELECT id INTO conversation_uuid
    FROM public.conversations 
    WHERE user_id = NEW.user_id 
      AND whatsapp_number = NEW.whatsapp_number 
      AND instance_name = NEW.instance_name;
  ELSE
    SELECT id INTO conversation_uuid
    FROM public.conversations 
    WHERE user_id IS NULL 
      AND whatsapp_number = NEW.whatsapp_number 
      AND instance_name = NEW.instance_name;
  END IF;
  
  -- Si no existe conversación, crearla
  IF conversation_uuid IS NULL THEN
    INSERT INTO public.conversations (
      user_id, 
      whatsapp_number,
      instance_name,
      pushname, 
      last_message, 
      last_message_at,
      unread_count
    )
    VALUES (
      NEW.user_id,
      NEW.whatsapp_number,
      NEW.instance_name,
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
$function$;
