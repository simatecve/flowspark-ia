
-- Make user_id nullable in conversations table to allow global/public conversations
ALTER TABLE public.conversations 
ALTER COLUMN user_id DROP NOT NULL;

-- Update the handle_new_message function to properly handle NULL user_id
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  conversation_uuid UUID;
BEGIN
  -- Buscar si ya existe una conversación para este número de WhatsApp
  -- Si hay user_id, buscar por user_id + whatsapp_number
  -- Si no hay user_id, buscar solo por whatsapp_number donde user_id es NULL
  IF NEW.user_id IS NOT NULL THEN
    SELECT id INTO conversation_uuid
    FROM public.conversations 
    WHERE user_id = NEW.user_id AND whatsapp_number = NEW.whatsapp_number;
  ELSE
    SELECT id INTO conversation_uuid
    FROM public.conversations 
    WHERE user_id IS NULL AND whatsapp_number = NEW.whatsapp_number;
  END IF;
  
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
$function$;

-- Update RLS policies to allow access to conversations without user_id
-- This allows reading public/global conversations
CREATE POLICY "Allow access to public conversations" 
ON public.conversations 
FOR SELECT 
USING (user_id IS NULL);

-- Allow creating public conversations
CREATE POLICY "Allow creating public conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (user_id IS NULL);

-- Allow updating public conversations
CREATE POLICY "Allow updating public conversations" 
ON public.conversations 
FOR UPDATE 
USING (user_id IS NULL);

-- Update messages policies to allow access to messages without user_id
CREATE POLICY "Allow access to public messages" 
ON public.messages 
FOR SELECT 
USING (user_id IS NULL);

-- Allow creating messages without user_id
CREATE POLICY "Allow creating public messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (user_id IS NULL);

-- Allow updating public messages
CREATE POLICY "Allow updating public messages" 
ON public.messages 
FOR UPDATE 
USING (user_id IS NULL);
