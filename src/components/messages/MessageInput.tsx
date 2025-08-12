
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip } from 'lucide-react';
import { FileUploadButton } from './FileUploadButton';
import { QuickRepliesManager } from './QuickRepliesManager';
import { ScheduleMessageModal } from './ScheduleMessageModal';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onFileUpload: (url: string, fileName: string) => void;
  instanceName: string;
  whatsappNumber: string;
  pushname?: string;
  disabled?: boolean;
}

export const MessageInput = ({
  value,
  onChange,
  onSend,
  onFileUpload,
  instanceName,
  whatsappNumber,
  pushname,
  disabled = false
}: MessageInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }
  };

  const handleQuickReplySelect = (message: string) => {
    onChange(message);
    // Focus the textarea after selecting a quick reply
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  return (
    <div className="border-t bg-background p-4">
      {/* Quick replies and schedule message buttons */}
      <div className="mb-3 flex gap-2">
        <QuickRepliesManager onSelectReply={handleQuickReplySelect} />
        <ScheduleMessageModal 
          instanceName={instanceName}
          whatsappNumber={whatsappNumber}
          pushname={pushname}
        />
      </div>

      {/* Message input area */}
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="min-h-[60px] max-h-32 resize-none pr-12"
            disabled={disabled}
          />
          
          {/* File upload button */}
          <div className="absolute bottom-2 right-2">
            <FileUploadButton 
              onFileUpload={onFileUpload}
              disabled={disabled}
            />
          </div>
        </div>
        
        {/* Send button */}
        <Button
          onClick={onSend}
          disabled={!value.trim() || disabled}
          size="icon"
          className="h-[60px] w-12"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
