
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Users, Phone, Megaphone, Bot, HardDrive, Monitor } from 'lucide-react';
import { useSubscriptionPlans, useDeletePlan } from '@/hooks/useSubscriptionPlans';
import { EditPlanModal } from './EditPlanModal';
import { SubscriptionPlan } from '@/types/plans';

export const PlansList = () => {
  const { data: plans, isLoading } = useSubscriptionPlans();
  const deletePlan = useDeletePlan();
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const handleDeletePlan = (planId: string) => {
    if (confirm('¿Estás seguro de que quieres desactivar este plan?')) {
      deletePlan.mutate(planId);
    }
  };

  if (isLoading) {
    return <div>Cargando planes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans?.map((plan) => (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <Badge variant="secondary">${plan.price}/mes</Badge>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-emerald-600" />
                  <span>{plan.max_whatsapp_connections} conexiones WhatsApp</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>{plan.max_contacts.toLocaleString()} contactos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Megaphone className="h-4 w-4 text-orange-600" />
                  <span>{plan.max_monthly_campaigns} campañas mensuales</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Bot className="h-4 w-4 text-green-600" />
                  <span>{plan.max_bot_responses.toLocaleString()} respuestas bot</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <HardDrive className="h-4 w-4 text-purple-600" />
                  <span>{plan.max_storage_mb}MB almacenamiento</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Monitor className="h-4 w-4 text-indigo-600" />
                  <span>{plan.max_device_sessions} sesión{plan.max_device_sessions > 1 ? 'es' : ''} de dispositivo</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setEditingPlan(plan)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeletePlan(plan.id)}
                  disabled={deletePlan.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingPlan && (
        <EditPlanModal
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
        />
      )}
    </div>
  );
};
