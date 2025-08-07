
-- Agregar columna para límite de conversaciones en los planes
ALTER TABLE subscription_plans 
ADD COLUMN max_conversations integer NOT NULL DEFAULT 100;

-- Actualizar los planes existentes con valores por defecto
UPDATE subscription_plans 
SET max_conversations = CASE 
  WHEN name ILIKE '%básico%' OR name ILIKE '%basic%' THEN 50
  WHEN name ILIKE '%premium%' OR name ILIKE '%pro%' THEN 200
  WHEN name ILIKE '%enterprise%' OR name ILIKE '%empresarial%' THEN 500
  ELSE 100
END;

-- Agregar columna para conversaciones utilizadas en user_usage
ALTER TABLE user_usage 
ADD COLUMN conversations_used integer NOT NULL DEFAULT 0;
