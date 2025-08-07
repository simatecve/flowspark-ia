
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreatePlan } from '@/hooks/useSubscriptionPlans';

const createPlanSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional().default(''),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  max_whatsapp_connections: z.number().min(1, 'Debe permitir al menos 1 conexión'),
  max_contacts: z.number().min(1, 'Debe permitir al menos 1 contacto'),
  max_monthly_campaigns: z.number().min(1, 'Debe permitir al menos 1 campaña'),
  max_bot_responses: z.number().min(1, 'Debe permitir al menos 1 respuesta'),
  max_storage_mb: z.number().min(1, 'Debe permitir al menos 1MB de almacenamiento'),
  max_device_sessions: z.number().min(1, 'Debe permitir al menos 1 sesión de dispositivo'),
  max_conversations: z.number().min(1, 'Debe permitir al menos 1 conversación'),
});

type CreatePlanFormData = z.infer<typeof createPlanSchema>;

export const CreatePlanForm = () => {
  const createPlan = useCreatePlan();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CreatePlanFormData>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      max_whatsapp_connections: 1,
      max_contacts: 100,
      max_monthly_campaigns: 1,
      max_bot_responses: 100,
      max_storage_mb: 100,
      max_device_sessions: 1,
      max_conversations: 50,
    }
  });

  const onSubmit = (data: CreatePlanFormData) => {
    const planData = {
      name: data.name,
      description: data.description || '',
      price: data.price,
      max_whatsapp_connections: data.max_whatsapp_connections,
      max_contacts: data.max_contacts,
      max_monthly_campaigns: data.max_monthly_campaigns,
      max_bot_responses: data.max_bot_responses,
      max_storage_mb: data.max_storage_mb,
      max_device_sessions: data.max_device_sessions,
      max_conversations: data.max_conversations,
    };
    
    createPlan.mutate(planData, {
      onSuccess: () => {
        reset();
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Nuevo Plan</CardTitle>
        <CardDescription>
          Define los límites y características del nuevo plan de suscripción
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Plan</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Ej: Plan Premium"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Precio Mensual ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                placeholder="29.99"
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descripción del plan..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_whatsapp_connections">Máx. Conexiones WhatsApp</Label>
              <Input
                id="max_whatsapp_connections"
                type="number"
                {...register('max_whatsapp_connections', { valueAsNumber: true })}
              />
              {errors.max_whatsapp_connections && (
                <p className="text-sm text-destructive">{errors.max_whatsapp_connections.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_contacts">Máx. Contactos</Label>
              <Input
                id="max_contacts"
                type="number"
                {...register('max_contacts', { valueAsNumber: true })}
              />
              {errors.max_contacts && (
                <p className="text-sm text-destructive">{errors.max_contacts.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_conversations">Máx. Conversaciones</Label>
              <Input
                id="max_conversations"
                type="number"
                {...register('max_conversations', { valueAsNumber: true })}
              />
              {errors.max_conversations && (
                <p className="text-sm text-destructive">{errors.max_conversations.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_monthly_campaigns">Máx. Campañas Mensuales</Label>
              <Input
                id="max_monthly_campaigns"
                type="number"
                {...register('max_monthly_campaigns', { valueAsNumber: true })}
              />
              {errors.max_monthly_campaigns && (
                <p className="text-sm text-destructive">{errors.max_monthly_campaigns.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_bot_responses">Máx. Respuestas Bot</Label>
              <Input
                id="max_bot_responses"
                type="number"
                {...register('max_bot_responses', { valueAsNumber: true })}
              />
              {errors.max_bot_responses && (
                <p className="text-sm text-destructive">{errors.max_bot_responses.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_storage_mb">Máx. Almacenamiento (MB)</Label>
              <Input
                id="max_storage_mb"
                type="number"
                {...register('max_storage_mb', { valueAsNumber: true })}
              />
              {errors.max_storage_mb && (
                <p className="text-sm text-destructive">{errors.max_storage_mb.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_device_sessions">Máx. Sesiones de Dispositivos</Label>
              <Input
                id="max_device_sessions"
                type="number"
                {...register('max_device_sessions', { valueAsNumber: true })}
              />
              {errors.max_device_sessions && (
                <p className="text-sm text-destructive">{errors.max_device_sessions.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" disabled={createPlan.isPending} className="w-full">
            {createPlan.isPending ? 'Creando...' : 'Crear Plan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
