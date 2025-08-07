
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit2, Plus, Key, Eye, EyeOff } from 'lucide-react';
import { useAIApiKeys } from '@/hooks/useAIApiKeys';
import { CreateAIApiKeyModal } from './CreateAIApiKeyModal';
import { EditAIApiKeyModal } from './EditAIApiKeyModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const AIApiKeysSettings = () => {
  const { apiKeys, isLoadingKeys, deleteKey } = useAIApiKeys();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingKey, setEditingKey] = useState<any>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const providerNames = {
    openai: 'OpenAI',
    gemini: 'Google Gemini',
    groq: 'Groq',
    anthropic: 'Anthropic',
  };

  const providerColors = {
    openai: 'bg-green-100 text-green-800',
    gemini: 'bg-blue-100 text-blue-800', 
    groq: 'bg-purple-100 text-purple-800',
    anthropic: 'bg-orange-100 text-orange-800',
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '***';
    return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  if (isLoadingKeys) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys de IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Keys de IA
        </CardTitle>
        <CardDescription>
          Gestiona las API keys de los proveedores de IA para usar en tus bots
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar API Key
          </Button>
        </div>

        {apiKeys && apiKeys.length > 0 ? (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-card"
              >
                <div className="flex items-center gap-3">
                  <Badge className={providerColors[key.provider] || 'bg-gray-100 text-gray-800'}>
                    {providerNames[key.provider] || key.provider}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                      {visibleKeys.has(key.id) ? key.api_key : maskApiKey(key.api_key)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleKeyVisibility(key.id)}
                    >
                      {visibleKeys.has(key.id) ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {key.is_active ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Activa
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      Inactiva
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingKey(key)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar API Key?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminará permanentemente la API key de {providerNames[key.provider]}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteKey(key.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No hay API keys configuradas</p>
            <p>Agrega una API key para comenzar a usar bots de IA</p>
          </div>
        )}
      </CardContent>

      <CreateAIApiKeyModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />

      {editingKey && (
        <EditAIApiKeyModal
          apiKey={editingKey}
          open={!!editingKey}
          onOpenChange={() => setEditingKey(null)}
        />
      )}
    </Card>
  );
};

export default AIApiKeysSettings;
