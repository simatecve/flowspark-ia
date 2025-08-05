
import React from 'react';
import { Construction, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ComingSoonProps {
  title: string;
  description: string;
  features?: string[];
}

const ComingSoon = ({ title, description, features = [] }: ComingSoonProps) => {
  return (
    <div className="flex items-center justify-center min-h-[600px] p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-whatsapp-500 to-saas-500 mb-4">
            <Construction className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <Badge variant="secondary" className="mx-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            Próximamente
          </Badge>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{description}</p>
          
          {features.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Características que incluirá:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center justify-center space-x-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="pt-4">
            <p className="text-xs text-muted-foreground">
              ¡Estamos trabajando duro para traerte esta funcionalidad pronto!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComingSoon;
