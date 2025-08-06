
-- Add a new column to store the WhatsApp connection name instead of ID
ALTER TABLE public.ai_bots 
ADD COLUMN whatsapp_connection_name TEXT;

-- Remove the foreign key constraint and drop the old column
ALTER TABLE public.ai_bots 
DROP COLUMN whatsapp_connection_id;

-- Make the new column NOT NULL after we've added it
ALTER TABLE public.ai_bots 
ALTER COLUMN whatsapp_connection_name SET NOT NULL;
