'use client';

import { useCallback, useEffect } from 'react';
import { EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import { useCollaborativeTiptap } from '@/hooks/useCollaborativeTiptap';
import { Loader2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollaborativeTiptapEditorProps {
  /** Unique document ID for this editor */
  documentId: string;
  /** Initial content (only used if Yjs doc is empty) */
  initialContent?: string;
  /** Callback when content changes */
  onUpdate?: (content: string) => void;
  /** Callback for auto-save */
  onAutoSave?: (content: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Additional class names */
  className?: string;
  /** Whether the editor is editable */
  editable?: boolean;
  /** Show connected users count */
  showCollaborators?: boolean;
}

// Base extensions without history (Yjs handles history)
const baseExtensions = [
  StarterKit.configure({
    history: false, // Disable history, Yjs handles undo/redo
  }),
  Placeholder.configure({
    placeholder: 'Start typing...',
  }),
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
  Link.configure({
    openOnClick: false,
  }),
];

/**
 * A collaborative Tiptap editor that syncs in real-time via Liveblocks.
 * Must be used inside a CollaborationRoom wrapper.
 *
 * @example
 * ```tsx
 * <CollaborationRoom roomId={`doc-${docId}`}>
 *   <CollaborativeTiptapEditor
 *     documentId={docId}
 *     onAutoSave={(content) => saveToBackend(content)}
 *   />
 * </CollaborationRoom>
 * ```
 */
export function CollaborativeTiptapEditor({
  documentId,
  initialContent,
  onUpdate,
  onAutoSave,
  placeholder = 'Start typing...',
  className,
  editable = true,
  showCollaborators = true,
}: CollaborativeTiptapEditorProps) {
  const handleUpdate = useCallback(
    (editor: Editor) => {
      const html = editor.getHTML();
      onUpdate?.(html);
    },
    [onUpdate]
  );

  const { editor, isSynced, isConnecting, connectedUsers } =
    useCollaborativeTiptap({
      extensions: [
        ...baseExtensions,
        Placeholder.configure({
          placeholder,
        }),
      ],
      documentId,
      initialContent,
      onUpdate: handleUpdate,
      editable,
    });

  // Auto-save debounced
  useEffect(() => {
    if (!editor || !onAutoSave || !isSynced) return;

    const timer = setInterval(() => {
      const html = editor.getHTML();
      onAutoSave(html);
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(timer);
  }, [editor, onAutoSave, isSynced]);

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Connecting to document...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Collaborator indicator */}
      {showCollaborators && connectedUsers > 1 && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2 py-1 bg-muted/80 rounded-full text-xs font-medium backdrop-blur-sm">
          <Users className="h-3 w-3" />
          <span>{connectedUsers} editing</span>
        </div>
      )}

      {/* Sync indicator */}
      {!isSynced && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Syncing...</span>
        </div>
      )}

      {/* Editor content */}
      <EditorContent
        editor={editor}
        className={cn(
          'prose prose-sm max-w-none',
          'min-h-[200px] p-4',
          '[&_.ProseMirror]:outline-none',
          '[&_.ProseMirror]:min-h-[inherit]',
          // Collaboration cursor styles
          '[&_.collaboration-cursor__caret]:border-l-2',
          '[&_.collaboration-cursor__caret]:border-current',
          '[&_.collaboration-cursor__caret]:ml-[-1px]',
          '[&_.collaboration-cursor__caret]:mr-[-1px]',
          '[&_.collaboration-cursor__caret]:pointer-events-none',
          '[&_.collaboration-cursor__caret]:relative',
          '[&_.collaboration-cursor__caret]:h-[1.1em]',
          '[&_.collaboration-cursor__caret]:-top-[0.1em]',
          '[&_.collaboration-cursor__label]:rounded',
          '[&_.collaboration-cursor__label]:px-1',
          '[&_.collaboration-cursor__label]:py-0.5',
          '[&_.collaboration-cursor__label]:text-xs',
          '[&_.collaboration-cursor__label]:text-white',
          '[&_.collaboration-cursor__label]:font-medium',
          '[&_.collaboration-cursor__label]:absolute',
          '[&_.collaboration-cursor__label]:top-[-1.4em]',
          '[&_.collaboration-cursor__label]:left-[-1px]',
          '[&_.collaboration-cursor__label]:whitespace-nowrap',
          '[&_.collaboration-cursor__label]:select-none'
        )}
      />
    </div>
  );
}
