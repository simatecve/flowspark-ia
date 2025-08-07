
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Phone, Users, Megaphone, Bot, HardDrive, Monitor, MessageCircle } from 'lucide-react';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { useUserPlan } from '@/hooks/useUserUsage';
import { useUpdateUserPlan } from '@/hooks/useUpdateUserPlan';
import { SubscriptionPlan } from '@/types/plans';
import { toast } from 'sonner';

export const SubscriptionPlans = () => {
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { data: currentPlan, isLoading: currentPlanLoading } = useUserPlan();
  const updatePlan = useUpdateUserPlan();

  const handlePlanChange = (plan: SubscriptionPlan) => {
    if (currentPlan?.id === plan.id) {
      toast.info('Ya tienes este plan activo');
      return;
    }

    updatePlan.mutate(plan.id, {
      onSuccess: () => {
        toast.success('Plan actualizado exitosamente');
      },
      onError: () => {
        toast.error('Error al actualizar el plan');
      }
    });
  };

  if (plansLoading || currentPlanLoading) {
    return <div>Cargando planes...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Planes Disponibles</h3>
        <p className="text-muted-foreground">
          Elige el plan que mejor se adapte a tus necesidades
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans?.map((plan) => {
          const isCurrentPlan = currentPlan?.id === plan.id;
          
          return (
            <Card key={plan.id} className={`relative ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <Badge variant={isCurrentPlan ? "default" : "secondary"}>
                    ${plan.price || 0}/mes
                  </Badge>
                </div>
                {isCurrentPlan && (
                  <Badge variant="default" className="w-fit">
                    <Check className="h-3 w-3 mr-1" />
                    Plan Actual
                  </Badge>
                )}
                <CardDescription>{plan.description || 'Sin descripción'}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-emerald-600" />
                    <span>{plan.max_whatsapp_connections || 0} conexiones WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                    <span>{(plan.max_conversations || 100).toLocaleString()} conversaciones</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>{(plan.max_contacts || 0).toLocaleString()} contactos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Megaphone className="h-4 w-4 text-orange-600" />
                    <span>{plan.max_monthly_campaigns || 0} campañas mensuales</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Bot className="h-4 w-4 text-green-600" />
                    <span>{(plan.max_bot_responses || 0).toLocaleString()} respuestas bot</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <HardDrive className="h-4 w-4 text-purple-600" />
                    <span>{plan.max_storage_mb || 0}MB almacenamiento</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Monitor className="h-4 w-4 text-indigo-600" />
                    <span>{plan.max_device_sessions || 1} sesión{(plan.max_device_sessions || 1) > 1 ? 'es' : ''} de dispositivo</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={() => handlePlanChange(plan)}
                    disabled={isCurrentPlan || updatePlan.isPending}
                    className="w-full"
                    variant={isCurrentPlan ? "secondary" : "default"}
                  >
                    {isCurrentPlan ? 'Plan Actual' : 
                     updatePlan.isPending ? 'Cambiando...' : 'Cambiar Plan'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
