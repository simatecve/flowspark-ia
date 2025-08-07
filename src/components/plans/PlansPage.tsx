
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Settings, BarChart3, CreditCard } from 'lucide-react';
import { PlansList } from './PlansList';
import { CreatePlanForm } from './CreatePlanForm';
import { UsageOverview } from './UsageOverview';
import { SubscriptionPlans } from './SubscriptionPlans';

export const PlansPage = () => {
  const [activeTab, setActiveTab] = useState('subscription');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Gestión de Planes</h2>
        <p className="text-muted-foreground">
          Administra tu suscripción y el uso de recursos
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Mi Suscripción
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Uso Actual
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Gestionar Planes
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Crear Plan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscription" className="mt-6">
          <SubscriptionPlans />
        </TabsContent>

        <TabsContent value="overview" className="mt-6">
          <UsageOverview />
        </TabsContent>

        <TabsContent value="plans" className="mt-6">
          <PlansList />
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <div className="max-w-2xl">
            <CreatePlanForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
