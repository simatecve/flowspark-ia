
-- Agregar columna para límite de sesiones de dispositivos en planes
ALTER TABLE public.subscription_plans 
ADD COLUMN max_device_sessions INTEGER NOT NULL DEFAULT 1;

-- Agregar columna para trackear sesiones usadas
ALTER TABLE public.user_usage 
ADD COLUMN device_sessions_used INTEGER NOT NULL DEFAULT 0;

-- Actualizar los planes existentes con límites de sesiones
UPDATE public.subscription_plans 
SET max_device_sessions = CASE 
  WHEN name = 'Plan Básico' THEN 1
  WHEN name = 'Plan Pro' THEN 3
  ELSE 1
END;

-- Actualizar la función de verificación de límites para incluir sesiones
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

-- Actualizar la función de incremento de uso para incluir sesiones
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

-- Actualizar la función de crear plan para incluir sesiones de dispositivos
CREATE OR REPLACE FUNCTION public.create_subscription_plan(plan_data jsonb)
RETURNS public.subscription_plans
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_plan public.subscription_plans;
BEGIN
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
  ) VALUES (
    (plan_data->>'name')::text,
    (plan_data->>'description')::text,
    (plan_data->>'price')::decimal,
    (plan_data->>'max_whatsapp_connections')::integer,
    (plan_data->>'max_contacts')::integer,
    (plan_data->>'max_monthly_campaigns')::integer,
    (plan_data->>'max_bot_responses')::integer,
    (plan_data->>'max_storage_mb')::integer,
    (plan_data->>'max_device_sessions')::integer
  ) RETURNING * INTO new_plan;
  
  RETURN new_plan;
END;
$$;

-- Actualizar la función de actualizar plan para incluir sesiones de dispositivos
CREATE OR REPLACE FUNCTION public.update_subscription_plan(plan_id uuid, plan_data jsonb)
RETURNS public.subscription_plans
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_plan public.subscription_plans;
BEGIN
  UPDATE public.subscription_plans SET
    name = COALESCE((plan_data->>'name')::text, name),
    description = COALESCE((plan_data->>'description')::text, description),
    price = COALESCE((plan_data->>'price')::decimal, price),
    max_whatsapp_connections = COALESCE((plan_data->>'max_whatsapp_connections')::integer, max_whatsapp_connections),
    max_contacts = COALESCE((plan_data->>'max_contacts')::integer, max_contacts),
    max_monthly_campaigns = COALESCE((plan_data->>'max_monthly_campaigns')::integer, max_monthly_campaigns),
    max_bot_responses = COALESCE((plan_data->>'max_bot_responses')::integer, max_bot_responses),
    max_storage_mb = COALESCE((plan_data->>'max_storage_mb')::integer, max_storage_mb),
    max_device_sessions = COALESCE((plan_data->>'max_device_sessions')::integer, max_device_sessions),
    updated_at = now()
  WHERE id = plan_id
  RETURNING * INTO updated_plan;
  
  RETURN updated_plan;
END;
$$;
