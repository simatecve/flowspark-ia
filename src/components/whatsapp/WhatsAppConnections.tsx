
import React from 'react';
import { CreateConnectionForm } from './CreateConnectionForm';
import { ConnectionsList } from './ConnectionsList';

export const WhatsAppConnections = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Conexiones de WhatsApp</h2>
        <p className="text-muted-foreground">
          Gestiona tus conexiones de WhatsApp para automatizar tus comunicaciones
        </p>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <CreateConnectionForm />
        <div>
          <h3 className="text-lg font-semibold mb-4">Conexiones Existentes</h3>
          <ConnectionsList />
        </div>
      </div>
    </div>
  );
};
