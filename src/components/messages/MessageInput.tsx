
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { FileUploadButton } from './FileUploadButton';
import { QuickRepliesManager } from './QuickRepliesManager';
import { ScheduleMessageModal } from './ScheduleMessageModal';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onFileUploaded: (url: string) => void;
  instanceName: string;
  whatsappNumber: string;
  pushname?: string;
  disabled?: boolean;
}

export const MessageInput = ({
  value,
  onChange,
  onSend,
  onFileUploaded,
  instanceName,
  whatsappNumber,
  pushname,
  disabled = false
}: MessageInputProps) => {
  const [inputValue, setInputValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !disabled) {
        handleSendMessage();
      }
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onChange(inputValue);
      onSend();
      setInputValue('');
    }
  };

  const handleQuickReplySelect = (selectedMessage: string) => {
    setInputValue(selectedMessage);
    // Focus the textarea after selecting a quick reply
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleFileUploaded = (url: string) => {
    onFileUploaded(url);
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
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="min-h-[60px] max-h-32 resize-none pr-12"
            disabled={disabled}
          />
          
          {/* File upload button */}
          <div className="absolute bottom-2 right-2">
            <FileUploadButton 
              onFileUploaded={handleFileUploaded}
              disabled={disabled}
            />
          </div>
        </div>
        
        {/* Send button */}
        <Button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || disabled}
          size="icon"
          className="h-[60px] w-12"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
