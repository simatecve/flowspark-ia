
-- Crear tabla para los planes de uso
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_whatsapp_connections INTEGER NOT NULL DEFAULT 1,
  max_contacts INTEGER NOT NULL DEFAULT 100,
  max_monthly_campaigns INTEGER NOT NULL DEFAULT 1,
  max_bot_responses INTEGER NOT NULL DEFAULT 100,
  max_storage_mb INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en subscription_plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para subscription_plans
CREATE POLICY "Anyone can view active plans" 
  ON public.subscription_plans 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Only admins can manage plans" 
  ON public.subscription_plans 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Agregar columna plan_id a la tabla profiles
ALTER TABLE public.profiles 
ADD COLUMN plan_id UUID REFERENCES public.subscription_plans(id) DEFAULT NULL,
DROP COLUMN IF EXISTS plan_type;

-- Crear tabla para controlar el uso de recursos por usuario
CREATE TABLE public.user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id) NOT NULL,
  whatsapp_connections_used INTEGER NOT NULL DEFAULT 0,
  contacts_used INTEGER NOT NULL DEFAULT 0,
  campaigns_this_month INTEGER NOT NULL DEFAULT 0,
  bot_responses_this_month INTEGER NOT NULL DEFAULT 0,
  storage_used_mb INTEGER NOT NULL DEFAULT 0,
  usage_month DATE NOT NULL DEFAULT DATE_TRUNC('month', now()),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, usage_month)
);

-- Habilitar RLS en user_usage
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para user_usage
CREATE POLICY "Users can view their own usage" 
  ON public.user_usage 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" 
  ON public.user_usage 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" 
  ON public.user_usage 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Crear tabla user_roles si no existe
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Habilitar RLS en user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Insertar planes de ejemplo
INSERT INTO public.subscription_plans (name, description, price, max_whatsapp_connections, max_contacts, max_monthly_campaigns, max_bot_responses, max_storage_mb) VALUES
('Plan Básico', 'Ideal para pequeños negocios', 29.99, 2, 500, 3, 1000, 500),
('Plan Pro', 'Para empresas en crecimiento', 79.99, 5, 2000, 10, 5000, 2000);

-- Función para obtener o crear el user_id del demo user
CREATE OR REPLACE FUNCTION get_demo_user_id() 
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
DECLARE
  demo_user_id UUID;
BEGIN
  SELECT id INTO demo_user_id 
  FROM auth.users 
  WHERE email = 'demo@demo.com' 
  LIMIT 1;
  
  RETURN demo_user_id;
END;
$$;

-- Asignar Plan Pro al usuario demo@demo.com
UPDATE public.profiles 
SET plan_id = (SELECT id FROM public.subscription_plans WHERE name = 'Plan Pro' LIMIT 1)
WHERE id = get_demo_user_id();

-- Crear registro de usage inicial para el usuario demo
INSERT INTO public.user_usage (user_id, plan_id, usage_month)
SELECT 
  get_demo_user_id(),
  (SELECT id FROM public.subscription_plans WHERE name = 'Plan Pro' LIMIT 1),
  DATE_TRUNC('month', now())
WHERE get_demo_user_id() IS NOT NULL
ON CONFLICT (user_id, usage_month) DO NOTHING;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para subscription_plans
CREATE TRIGGER update_subscription_plans_updated_at 
  BEFORE UPDATE ON public.subscription_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para user_usage
CREATE TRIGGER update_user_usage_updated_at 
  BEFORE UPDATE ON public.user_usage 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Eliminar función temporal
DROP FUNCTION get_demo_user_id();
