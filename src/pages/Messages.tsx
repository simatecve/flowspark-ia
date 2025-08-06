
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MessagesPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mensajería</h2>
        <p className="text-muted-foreground">
          Gestiona tus conversaciones de WhatsApp
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversaciones Activas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Próximamente: Vista de conversaciones en tiempo real
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagesPage;
