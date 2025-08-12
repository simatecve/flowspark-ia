
-- Actualizar constraint check para message_type agregando 'conversation'
ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_message_type_check;

ALTER TABLE public.messages 
ADD CONSTRAINT messages_message_type_check 
CHECK (message_type IN ('text', 'image', 'video', 'audio', 'document', 'imageMessage', 'audioMessage', 'conversation'));
