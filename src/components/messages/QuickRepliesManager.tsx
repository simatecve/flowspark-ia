
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, Edit2, Trash2, ChevronDown } from 'lucide-react';
import { useQuickReplies } from '@/hooks/useQuickReplies';
import type { QuickReply } from '@/types/quickReplies';

interface QuickRepliesManagerProps {
  onSelectReply: (message: string) => void;
}

export const QuickRepliesManager = ({ onSelectReply }: QuickRepliesManagerProps) => {
  const { quickReplies, createQuickReply, updateQuickReply, deleteQuickReply, isLoading } = useQuickReplies();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [editingReply, setEditingReply] = useState<QuickReply | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [shortcut, setShortcut] = useState('');

  const handleCreate = () => {
    if (!title.trim() || !message.trim()) return;

    createQuickReply({
      title: title.trim(),
      message: message.trim(),
      shortcut: shortcut.trim() || undefined,
    });

    setTitle('');
    setMessage('');
    setShortcut('');
    setIsCreateOpen(false);
  };

  const handleEdit = (reply: QuickReply) => {
    setEditingReply(reply);
    setTitle(reply.title);
    setMessage(reply.message);
    setShortcut(reply.shortcut || '');
  };

  const handleUpdate = () => {
    if (!editingReply || !title.trim() || !message.trim()) return;

    updateQuickReply({
      id: editingReply.id,
      title: title.trim(),
      message: message.trim(),
      shortcut: shortcut.trim() || undefined,
    });

    setEditingReply(null);
    setTitle('');
    setMessage('');
    setShortcut('');
  };

  const handleDelete = (id: string) => {
    deleteQuickReply(id);
  };

  const ReplyForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Saludo inicial"
        />
      </div>
      <div>
        <Label htmlFor="shortcut">Atajo (opcional)</Label>
        <Input
          id="shortcut"
          value={shortcut}
          onChange={(e) => setShortcut(e.target.value)}
          placeholder="Ej: /saludo"
        />
      </div>
      <div>
        <Label htmlFor="message">Mensaje</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe tu mensaje aquí..."
          rows={4}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button 
          variant="outline" 
          onClick={() => {
            setEditingReply(null);
            setTitle('');
            setMessage('');
            setShortcut('');
            setIsCreateOpen(false);
          }}
        >
          Cancelar
        </Button>
        <Button onClick={editingReply ? handleUpdate : handleCreate}>
          {editingReply ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex gap-2">
      {/* Selector de respuestas rápidas */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Respuestas rápidas
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Cargando respuestas...
            </div>
          ) : quickReplies.length > 0 ? (
            quickReplies.map((reply) => (
              <DropdownMenuItem
                key={reply.id}
                onClick={() => onSelectReply(reply.message)}
                className="flex flex-col items-start p-3 cursor-pointer hover:bg-accent"
              >
                <div className="flex items-center gap-2 w-full">
                  <span className="font-medium text-sm">{reply.title}</span>
                  {reply.shortcut && (
                    <Badge variant="secondary" className="text-xs">
                      {reply.shortcut}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {reply.message}
                </span>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No hay respuestas rápidas
            </div>
          )}
          <div className="border-t">
            <DropdownMenuItem onClick={() => setIsManageOpen(true)} className="p-3">
              <Edit2 className="h-4 w-4 mr-2" />
              Gestionar respuestas
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal para crear nueva respuesta */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva respuesta rápida</DialogTitle>
          </DialogHeader>
          <ReplyForm />
        </DialogContent>
      </Dialog>

      {/* Modal para gestionar respuestas */}
      <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestionar respuestas rápidas</DialogTitle>
          </DialogHeader>
          
          {editingReply ? (
            <div>
              <h3 className="text-lg font-medium mb-4">Editar respuesta</h3>
              <ReplyForm />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4">
                {quickReplies.map((reply) => (
                  <Card key={reply.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {reply.title}
                          {reply.shortcut && (
                            <Badge variant="secondary" className="text-xs">
                              {reply.shortcut}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(reply)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(reply.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{reply.message}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {quickReplies.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tienes respuestas rápidas configuradas</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
