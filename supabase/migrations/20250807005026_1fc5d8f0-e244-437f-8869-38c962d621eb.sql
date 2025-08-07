
-- Crear tabla de planes de suscripción
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  max_whatsapp_connections INTEGER NOT NULL,
  max_contacts INTEGER NOT NULL,
  max_monthly_campaigns INTEGER NOT NULL,
  max_bot_responses INTEGER NOT NULL,
  max_storage_mb INTEGER NOT NULL,
  max_device_sessions INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de suscripciones de usuarios
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id) -- Un usuario solo puede tener una suscripción activa
);

-- Crear tabla de uso de recursos por usuario
CREATE TABLE public.user_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  whatsapp_connections_used INTEGER NOT NULL DEFAULT 0,
  contacts_used INTEGER NOT NULL DEFAULT 0,
  campaigns_this_month INTEGER NOT NULL DEFAULT 0,
  bot_responses_this_month INTEGER NOT NULL DEFAULT 0,
  storage_used_mb INTEGER NOT NULL DEFAULT 0,
  device_sessions_used INTEGER NOT NULL DEFAULT 0,
  usage_month DATE NOT NULL DEFAULT date_trunc('month', now())::date,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, usage_month) -- Un registro por usuario por mes
);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para subscription_plans (todos pueden ver los planes activos)
CREATE POLICY "Anyone can view active plans" 
  ON public.subscription_plans 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Only authenticated users can manage plans" 
  ON public.subscription_plans 
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- Políticas RLS para user_subscriptions
CREATE POLICY "Users can view their own subscription" 
  ON public.user_subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscription" 
  ON public.user_subscriptions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" 
  ON public.user_subscriptions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Políticas RLS para user_usage
CREATE POLICY "Users can view their own usage" 
  ON public.user_usage 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own usage" 
  ON public.user_usage 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" 
  ON public.user_usage 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Agregar columna plan_id a la tabla profiles para vincular usuarios con planes
ALTER TABLE public.profiles ADD COLUMN plan_id UUID REFERENCES public.subscription_plans(id);

-- Insertar dos planes de ejemplo
INSERT INTO public.subscription_plans (
  name, 
  description, 
  price, 
  max_whatsapp_connections, 
  max_contacts, 
  max_monthly_campaigns, 
  max_bot_responses, 
  max_storage_mb,
  max_device_sessions
) VALUES 
(
  'Plan Básico',
  'Ideal para pequeños negocios que están empezando',
  29.99,
  2,
  500,
  3,
  1000,
  500,
  1
),
(
  'Plan Pro',
  'Perfecto para empresas en crecimiento',
  79.99,
  5,
  2000,
  10,
  5000,
  2000,
  3
);

-- Función para verificar límites de uso
CREATE OR REPLACE FUNCTION public.check_usage_limit(
  p_user_id uuid, 
  p_resource_type text, 
  p_requested_amount integer DEFAULT 1
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_plan public.subscription_plans;
  current_usage public.user_usage;
  current_month date := date_trunc('month', now())::date;
BEGIN
  -- Obtener el plan del usuario
  SELECT sp.* INTO current_plan
  FROM public.subscription_plans sp
  JOIN public.profiles p ON p.plan_id = sp.id
  WHERE p.id = p_user_id;
  
  IF current_plan IS NULL THEN
    RETURN false; -- Sin plan, sin acceso
  END IF;
  
  -- Obtener el uso actual del mes
  SELECT * INTO current_usage
  FROM public.user_usage
  WHERE user_id = p_user_id AND usage_month = current_month;
  
  -- Si no existe registro de uso, crear uno
  IF current_usage IS NULL THEN
    INSERT INTO public.user_usage (user_id, plan_id, usage_month)
    VALUES (p_user_id, current_plan.id, current_month)
    RETURNING * INTO current_usage;
  END IF;
  
  -- Verificar límites según el tipo de recurso
  CASE p_resource_type
    WHEN 'whatsapp_connections' THEN
      RETURN (current_usage.whatsapp_connections_used + p_requested_amount) <= current_plan.max_whatsapp_connections;
    WHEN 'contacts' THEN
      RETURN (current_usage.contacts_used + p_requested_amount) <= current_plan.max_contacts;
    WHEN 'campaigns' THEN
      RETURN (current_usage.campaigns_this_month + p_requested_amount) <= current_plan.max_monthly_campaigns;
    WHEN 'bot_responses' THEN
      RETURN (current_usage.bot_responses_this_month + p_requested_amount) <= current_plan.max_bot_responses;
    WHEN 'storage' THEN
      RETURN (current_usage.storage_used_mb + p_requested_amount) <= current_plan.max_storage_mb;
    WHEN 'device_sessions' THEN
      RETURN (current_usage.device_sessions_used + p_requested_amount) <= current_plan.max_device_sessions;
    ELSE
      RETURN false;
  END CASE;
END;
$$;

-- Función para incrementar el uso de recursos
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_user_id uuid,
  p_resource_type text,
  p_amount integer DEFAULT 1
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_month date := date_trunc('month', now())::date;
  current_plan_id uuid;
BEGIN
  -- Obtener el plan_id del usuario
  SELECT plan_id INTO current_plan_id
  FROM public.profiles
  WHERE id = p_user_id;
  
  IF current_plan_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Insertar o actualizar el uso
  INSERT INTO public.user_usage (
    user_id, 
    plan_id, 
    usage_month, 
    whatsapp_connections_used, 
    contacts_used, 
    campaigns_this_month, 
    bot_responses_this_month, 
    storage_used_mb,
    device_sessions_used
  )
  VALUES (
    p_user_id, 
    current_plan_id, 
    current_month,
    CASE WHEN p_resource_type = 'whatsapp_connections' THEN p_amount ELSE 0 END,
    CASE WHEN p_resource_type = 'contacts' THEN p_amount ELSE 0 END,
    CASE WHEN p_resource_type = 'campaigns' THEN p_amount ELSE 0 END,
    CASE WHEN p_resource_type = 'bot_responses' THEN p_amount ELSE 0 END,
    CASE WHEN p_resource_type = 'storage' THEN p_amount ELSE 0 END,
    CASE WHEN p_resource_type = 'device_sessions' THEN p_amount ELSE 0 END
  )
  ON CONFLICT (user_id, usage_month) 
  DO UPDATE SET
    whatsapp_connections_used = CASE WHEN p_resource_type = 'whatsapp_connections' 
                                    THEN user_usage.whatsapp_connections_used + p_amount 
                                    ELSE user_usage.whatsapp_connections_used END,
    contacts_used = CASE WHEN p_resource_type = 'contacts' 
                         THEN user_usage.contacts_used + p_amount 
                         ELSE user_usage.contacts_used END,
    campaigns_this_month = CASE WHEN p_resource_type = 'campaigns' 
                                THEN user_usage.campaigns_this_month + p_amount 
                                ELSE user_usage.campaigns_this_month END,
    bot_responses_this_month = CASE WHEN p_resource_type = 'bot_responses' 
                                    THEN user_usage.bot_responses_this_month + p_amount 
                                    ELSE user_usage.bot_responses_this_month END,
    storage_used_mb = CASE WHEN p_resource_type = 'storage' 
                           THEN user_usage.storage_used_mb + p_amount 
                           ELSE user_usage.storage_used_mb END,
    device_sessions_used = CASE WHEN p_resource_type = 'device_sessions' 
                               THEN user_usage.device_sessions_used + p_amount 
                               ELSE user_usage.device_sessions_used END,
    updated_at = now();
    
  RETURN true;
END;
$$;
