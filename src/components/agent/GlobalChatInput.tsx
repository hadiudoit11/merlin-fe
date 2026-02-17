'use client';

/**
 * GlobalChatInput
 *
 * A full-width chat bar that lets users describe a product and kick off the
 * Lifecycle Agent.  Supports optional file attachment (PDF, docx, txt, image).
 *
 * Usage:
 *   <GlobalChatInput onStart={(message, files) => ...} />
 */

import React, { useRef, useState, KeyboardEvent } from 'react';
import { Paperclip, Send, X, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AttachedFile {
  file: File;
  id: string;
}

interface GlobalChatInputProps {
  /** Called when user submits.  Files array may be empty. */
  onStart: (message: string, files: File[]) => void;
  /** Placeholder text inside the input */
  placeholder?: string;
  /** Additional class names on the outer wrapper */
  className?: string;
  disabled?: boolean;
}

export function GlobalChatInput({
  onStart,
  placeholder = 'Describe what you want to build…',
  className,
  disabled = false,
}: GlobalChatInputProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    onStart(trimmed, files.map((f) => f.file));
    setMessage('');
    setFiles([]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const newAttached: AttachedFile[] = selected.map((f) => ({
      file: f,
      id: `${f.name}-${Date.now()}-${Math.random()}`,
    }));
    setFiles((prev) => [...prev, ...newAttached]);
    // Reset input so the same file can be re-added
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const fileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="w-3 h-3" />;
    return <FileText className="w-3 h-3" />;
  };

  return (
    <div className={cn('w-full', className)}>
      {/* File chips */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {files.map((af) => (
            <Badge
              key={af.id}
              variant="secondary"
              className="flex items-center gap-1 text-xs pr-1"
            >
              {fileIcon(af.file)}
              <span className="max-w-[140px] truncate">{af.file.name}</span>
              <button
                onClick={() => removeFile(af.id)}
                className="ml-1 hover:text-destructive transition-colors"
                aria-label={`Remove ${af.file.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 rounded-xl border border-border bg-card shadow-sm px-3 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 transition-all">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt,.md,image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Attach button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          title="Attach a file"
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        {/* Textarea */}
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            'flex-1 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0',
            'min-h-[36px] max-h-40 overflow-y-auto py-1.5 text-sm leading-relaxed',
          )}
        />

        {/* Send button */}
        <Button
          type="button"
          size="icon"
          className="shrink-0 h-8 w-8"
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          title="Send (Enter)"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-1.5 pl-1">
        Press <kbd className="px-1 py-0.5 rounded bg-muted text-[10px]">Enter</kbd> to send,{' '}
        <kbd className="px-1 py-0.5 rounded bg-muted text-[10px]">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
