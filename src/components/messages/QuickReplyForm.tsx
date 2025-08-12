
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { QuickReply } from '@/types/quickReplies';

interface QuickReplyFormProps {
  editingReply?: QuickReply | null;
  onSubmit: (data: { title: string; message: string; shortcut?: string }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const QuickReplyForm = ({ editingReply, onSubmit, onCancel, isSubmitting }: QuickReplyFormProps) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [shortcut, setShortcut] = useState('');

  useEffect(() => {
    if (editingReply) {
      setTitle(editingReply.title);
      setMessage(editingReply.message);
      setShortcut(editingReply.shortcut || '');
    } else {
      setTitle('');
      setMessage('');
      setShortcut('');
    }
  }, [editingReply]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    onSubmit({
      title: title.trim(),
      message: message.trim(),
      shortcut: shortcut.trim() || undefined,
    });
  };

  const handleCancel = () => {
    setTitle('');
    setMessage('');
    setShortcut('');
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Saludo inicial"
          required
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
          required
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button 
          type="button"
          variant="outline" 
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting || !title.trim() || !message.trim()}
        >
          {editingReply ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
};
