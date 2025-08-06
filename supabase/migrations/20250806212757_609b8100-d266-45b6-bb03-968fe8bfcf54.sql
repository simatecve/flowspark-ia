
-- Actualizar el estado predeterminado de las conexiones de WhatsApp
ALTER TABLE whatsapp_connections 
ALTER COLUMN status SET DEFAULT 'desconectado';

-- Actualizar conexiones existentes que tengan status 'pending' o 'active' a 'desconectado'
UPDATE whatsapp_connections 
SET status = 'desconectado' 
WHERE status IN ('pending', 'active');
