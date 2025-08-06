
-- Crear tabla para las columnas de leads (pipelines)
CREATE TABLE public.lead_columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  position INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Crear tabla para los leads
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  column_id UUID NOT NULL REFERENCES public.lead_columns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  value DECIMAL(10,2),
  notes TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para lead_columns
ALTER TABLE public.lead_columns ENABLE ROW LEVEL SECURITY;

-- Políticas para lead_columns
CREATE POLICY "Users can view their own lead columns" 
  ON public.lead_columns 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lead columns" 
  ON public.lead_columns 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lead columns" 
  ON public.lead_columns 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lead columns" 
  ON public.lead_columns 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Habilitar RLS para leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Políticas para leads
CREATE POLICY "Users can view their own leads" 
  ON public.leads 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own leads" 
  ON public.leads 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.lead_columns 
    WHERE id = leads.column_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own leads" 
  ON public.leads 
  FOR UPDATE 
  USING (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.lead_columns 
    WHERE id = leads.column_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own leads" 
  ON public.leads 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Crear función para inicializar columna por defecto
CREATE OR REPLACE FUNCTION public.create_default_lead_column()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.lead_columns (user_id, name, color, position, is_default)
  VALUES (NEW.id, 'Nuevos', '#10b981', 0, true)
  ON CONFLICT (user_id, name) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para crear columna por defecto cuando se registra un usuario
CREATE TRIGGER create_default_lead_column_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_lead_column();
