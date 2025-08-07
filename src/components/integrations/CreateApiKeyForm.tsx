
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAIApiKeys } from '@/hooks/useAIApiKeys';

const providers = [
  { name: 'OpenAI', value: 'openai', placeholder: 'sk-...' },
  { name: 'Gemini', value: 'gemini', placeholder: 'AIza...' },
  { name: 'Groq', value: 'groq', placeholder: 'gsk_...' },
];

export const CreateApiKeyForm = () => {
  const [selectedProvider, setSelectedProvider] = useState('');
  const [apiKey, setApiKey] = useState('');

  const { createApiKey, isCreatingApiKey } = useAIApiKeys();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProvider || !apiKey.trim()) {
      return;
    }

    createApiKey({
      provider: selectedProvider,
      api_key: apiKey.trim(),
    });

    // Limpiar formulario
    setSelectedProvider('');
    setApiKey('');
  };

  const selectedProviderData = providers.find(p => p.value === selectedProvider);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agregar Nueva API Key</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="provider">Proveedor de IA</Label>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un proveedor" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.value} value={provider.value}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={selectedProviderData?.placeholder || 'Ingresa tu API key'}
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={isCreatingApiKey || !selectedProvider || !apiKey.trim()}
            className="w-full"
          >
            {isCreatingApiKey ? 'Guardando...' : 'Guardar API Key'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
