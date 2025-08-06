
-- Crear un trigger que ejecute automáticamente la función cuando se inserte un nuevo usuario
CREATE TRIGGER create_default_lead_column_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_lead_column();

-- También crear columnas por defecto para usuarios existentes que no la tengan
INSERT INTO public.lead_columns (user_id, name, color, position, is_default)
SELECT 
  p.id,
  'Nuevos',
  '#10b981',
  0,
  true
FROM public.profiles p
LEFT JOIN public.lead_columns lc ON (p.id = lc.user_id AND lc.is_default = true)
WHERE lc.id IS NULL
ON CONFLICT (user_id, name) DO NOTHING;
