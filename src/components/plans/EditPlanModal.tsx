
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SubscriptionPlan, UpdatePlanData } from '@/types/plans';
import { useUpdatePlan } from '@/hooks/useSubscriptionPlans';

const editPlanSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  max_whatsapp_connections: z.number().min(1, 'Debe permitir al menos 1 conexión'),
  max_contacts: z.number().min(1, 'Debe permitir al menos 1 contacto'),
  max_monthly_campaigns: z.number().min(1, 'Debe permitir al menos 1 campaña'),
  max_bot_responses: z.number().min(1, 'Debe permitir al menos 1 respuesta'),
  max_storage_mb: z.number().min(1, 'Debe permitir al menos 1MB de almacenamiento'),
  max_device_sessions: z.number().min(1, 'Debe permitir al menos 1 sesión de dispositivo'),
});

type EditPlanFormData = z.infer<typeof editPlanSchema>;

interface EditPlanModalProps {
  plan: SubscriptionPlan;
  onClose: () => void;
}

export const EditPlanModal = ({ plan, onClose }: EditPlanModalProps) => {
  const updatePlan = useUpdatePlan();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditPlanFormData>({
    resolver: zodResolver(editPlanSchema),
    defaultValues: {
      name: plan.name,
      description: plan.description || '',
      price: plan.price,
      max_whatsapp_connections: plan.max_whatsapp_connections,
      max_contacts: plan.max_contacts,
      max_monthly_campaigns: plan.max_monthly_campaigns,
      max_bot_responses: plan.max_bot_responses,
      max_storage_mb: plan.max_storage_mb,
      max_device_sessions: plan.max_device_sessions,
    }
  });

  const onSubmit = (data: EditPlanFormData) => {
    console.log('Update plan:', data);
    
    const updateData: UpdatePlanData = {
      id: plan.id,
      name: data.name,
      description: data.description,
      price: data.price,
      max_whatsapp_connections: data.max_whatsapp_connections,
      max_contacts: data.max_contacts,
      max_monthly_campaigns: data.max_monthly_campaigns,
      max_bot_responses: data.max_bot_responses,
      max_storage_mb: data.max_storage_mb,
      max_device_sessions: data.max_device_sessions,
    };
    
    updatePlan.mutate(updateData, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Plan: {plan.name}</DialogTitle>
          <DialogDescription>
            Modifica los límites y características del plan
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre del Plan</Label>
              <Input
                id="edit-name"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-price">Precio Mensual ($)</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descripción</Label>
            <Textarea
              id="edit-description"
              {...register('description')}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-connections">Máx. Conexiones WhatsApp</Label>
              <Input
                id="edit-connections"
                type="number"
                {...register('max_whatsapp_connections', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-contacts">Máx. Contactos</Label>
              <Input
                id="edit-contacts"
                type="number"
                {...register('max_contacts', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-campaigns">Máx. Campañas Mensuales</Label>
              <Input
                id="edit-campaigns"
                type="number"
                {...register('max_monthly_campaigns', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-responses">Máx. Respuestas Bot</Label>
              <Input
                id="edit-responses"
                type="number"
                {...register('max_bot_responses', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-storage">Máx. Almacenamiento (MB)</Label>
              <Input
                id="edit-storage"
                type="number"
                {...register('max_storage_mb', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-sessions">Máx. Sesiones de Dispositivos</Label>
              <Input
                id="edit-sessions"
                type="number"
                {...register('max_device_sessions', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updatePlan.isPending}>
              {updatePlan.isPending ? 'Actualizando...' : 'Actualizar Plan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
