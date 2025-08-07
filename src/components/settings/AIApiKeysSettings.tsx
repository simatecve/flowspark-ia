
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Key, Eye, EyeOff, Edit, Trash2 } from 'lucide-react';
import { useAIApiKeys, AIApiKey } from '@/hooks/useAIApiKeys';
import { CreateAIApiKeyModal } from './CreateAIApiKeyModal';
import { EditAIApiKeyModal } from './EditAIApiKeyModal';

const AIApiKeysSettings = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<AIApiKey | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const { apiKeys, isLoadingKeys, deleteKey, isDeletingKey } = useAIApiKeys();

  const getProviderLabel = (provider: string) => {
    const labels: Record<string, string> = {
      openai: 'OpenAI',
      gemini: 'Google Gemini',
      groq: 'Groq',
      anthropic: 'Anthropic',
    };
    return labels[provider] || provider;
  };

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      openai: 'bg-green-100 text-green-800',
      gemini: 'bg-blue-100 text-blue-800',
      groq: 'bg-orange-100 text-orange-800',
      anthropic: 'bg-purple-100 text-purple-800',
    };
    return colors[provider] || 'bg-gray-100 text-gray-800';
  };

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
    if (key.length <= 8) return '****';
    return key.substring(0, 4) + '****' + key.substring(key.length - 4);
  };

  const handleEdit = (key: AIApiKey) => {
    setSelectedKey(key);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (key: AIApiKey) => {
    setSelectedKey(key);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedKey) {
      deleteKey(selectedKey.id);
      setDeleteModalOpen(false);
      setSelectedKey(null);
    }
  };

  if (isLoadingKeys) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys de IA
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Gestiona las claves de API para los proveedores de IA
            </p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar API Key
          </Button>
        </CardHeader>
        <CardContent>
          {!apiKeys || apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No tienes API Keys</h3>
              <p className="text-muted-foreground mb-4">
                Agrega tu primera API key para comenzar a usar los bots de IA
              </p>
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar API Key
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getProviderColor(key.provider)}>
                          {getProviderLabel(key.provider)}
                        </Badge>
                        <Badge variant={key.is_active ? 'default' : 'secondary'}>
                          {key.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
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
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(key)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(key)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateAIApiKeyModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      {selectedKey && (
        <EditAIApiKeyModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          apiKey={selectedKey}
        />
      )}

      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La API key será eliminada permanentemente
              y ya no podrá ser utilizada en tus bots.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeletingKey}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingKey ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AIApiKeysSettings;
