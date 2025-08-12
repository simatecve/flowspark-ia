
import React, { useState } from 'react';
import { Send, Smile, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileUploadButton } from './FileUploadButton';

// Dynamic import for emoji picker to avoid build issues
const EmojiPicker = React.lazy(() => 
  import('@emoji-mart/react').then(module => ({ default: module.default }))
);

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

  const handleFileUploaded = (url: string) => {
    setAttachmentUrl(url);
  };

  const removeAttachment = () => {
    setAttachmentUrl('');
  };

  return (
    <div className="sticky bottom-0 border-t bg-background p-4 z-10">
      {attachmentUrl && (
        <div className="mb-2 p-2 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Archivo adjunto:</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeAttachment}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-sm truncate">{attachmentUrl.split('/').pop()}</p>
        </div>
      )}
      
      <div className="flex items-end space-x-2">
        <div className="flex space-x-1">
          <FileUploadButton
            onFileUploaded={handleFileUploaded}
            disabled={disabled}
          />

          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" disabled={disabled}>
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <React.Suspense fallback={<div className="p-4">Cargando emojis...</div>}>
                <EmojiPicker
                  onEmojiSelect={onEmojiSelect}
                  locale="es"
                  theme="light"
                />
              </React.Suspense>
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
