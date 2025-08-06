
import React, { useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface MessageInputProps {
  onSendMessage: (message: string, attachment?: string) => void;
  disabled?: boolean;
}

export const MessageInput = ({ onSendMessage, disabled }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSend = () => {
    if (!message.trim() && !attachmentUrl) return;
    
    onSendMessage(message.trim(), attachmentUrl || undefined);
    setMessage('');
    setAttachmentUrl('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onEmojiSelect = (emoji: any) => {
    setMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  return (
    <div className="border-t bg-background p-4">
      {attachmentUrl && (
        <div className="mb-2 p-2 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Archivo adjunto:</p>
          <p className="text-sm truncate">{attachmentUrl}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAttachmentUrl('')}
            className="mt-1"
          >
            Remover
          </Button>
        </div>
      )}
      
      <div className="flex items-end space-x-2">
        <div className="flex space-x-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" disabled={disabled}>
                <Paperclip className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <p className="text-sm font-medium">Adjuntar archivo</p>
                <Input
                  placeholder="URL del archivo (imagen, video, audio, documento)"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                />
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" disabled={disabled}>
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Picker
                data={data}
                onEmojiSelect={onEmojiSelect}
                locale="es"
                theme="light"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex-1">
          <Textarea
            placeholder="Escribe un mensaje..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="min-h-[40px] max-h-32 resize-none"
          />
        </div>

        <Button 
          onClick={handleSend}
          disabled={disabled || (!message.trim() && !attachmentUrl)}
          size="icon"
          className="bg-whatsapp-500 hover:bg-whatsapp-600"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
