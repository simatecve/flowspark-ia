
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { useAIApiKeys } from '@/hooks/useAIApiKeys';
import { useState } from 'react';

export const ApiKeysList = () => {
  const { apiKeys, isLoadingApiKeys, deleteApiKey, updateApiKey, isDeletingApiKey } = useAIApiKeys();
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const toggleKeyVisibility = (keyId: string) => {
    const newVisibleKeys = new Set(visibleKeys);
    if (newVisibleKeys.has(keyId)) {
      newVisibleKeys.delete(keyId);
    } else {
      newVisibleKeys.add(keyId);
    }
    setVisibleKeys(newVisibleKeys);
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '*'.repeat(key.length);
    return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  const getProviderName = (provider: string) => {
    const providerNames: { [key: string]: string } = {
      openai: 'OpenAI',
      gemini: 'Gemini',
      groq: 'Groq',
    };
    return providerNames[provider] || provider;
  };

  const toggleApiKeyStatus = (id: string, currentStatus: boolean) => {
    updateApiKey({
      id,
      updates: { is_active: !currentStatus }
    });
  };

  if (isLoadingApiKeys) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Keys Guardadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Cargando API keys...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys Guardadas</CardTitle>
      </CardHeader>
      <CardContent>
        {!apiKeys || apiKeys.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No tienes API keys guardadas aún.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="font-medium">
                    {getProviderName(apiKey.provider)}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {visibleKeys.has(apiKey.id) ? apiKey.api_key : maskApiKey(apiKey.api_key)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={apiKey.is_active ? "default" : "secondary"}>
                      {apiKey.is_active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(apiKey.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                      >
                        {visibleKeys.has(apiKey.id) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleApiKeyStatus(apiKey.id, apiKey.is_active)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteApiKey(apiKey.id)}
                        disabled={isDeletingApiKey}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
