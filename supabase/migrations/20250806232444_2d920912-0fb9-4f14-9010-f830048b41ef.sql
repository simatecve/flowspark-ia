
-- Crear una nueva columna llamada "Nuevo" para el usuario demo@demo.com
INSERT INTO public.lead_columns (user_id, name, color, position, is_default)
SELECT 
  au.id,
  'Nuevo',
  '#3b82f6',
  COALESCE((SELECT MAX(position) + 1 FROM lead_columns WHERE user_id = au.id), 1),
  false
FROM auth.users au
WHERE au.email = 'demo@demo.com'
AND NOT EXISTS (
  SELECT 1 FROM lead_columns lc 
  WHERE lc.user_id = au.id AND lc.name = 'Nuevo'
);
