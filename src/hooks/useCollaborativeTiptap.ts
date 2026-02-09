'use client';

import { useEffect, useMemo, useState } from 'react';
import { useEditor, Editor } from '@tiptap/react';
import { isLiveblocksEnabled, useRoom, useSelf } from '@/lib/liveblocks.config';
import { Extensions } from '@tiptap/core';

// Dynamic imports for Liveblocks Yjs - only load if enabled
let LiveblocksYjsProvider: any = null;
let Y: any = null;
let Collaboration: any = null;
let CollaborationCursor: any = null;

if (isLiveblocksEnabled) {
  LiveblocksYjsProvider = require('@liveblocks/yjs').LiveblocksYjsProvider;
  Y = require('yjs');
  Collaboration = require('@tiptap/extension-collaboration').default;
  CollaborationCursor = require('@tiptap/extension-collaboration-cursor').default;
}

interface UseCollaborativeTiptapOptions {
  /** Base extensions to use (without Starter Kit's history) */
  extensions?: Extensions;
  /** Initial content (only used if Yjs doc is empty) */
  initialContent?: string;
  /** Document ID for Yjs namespace (optional, defaults to room ID) */
  documentId?: string;
  /** Callback when content changes */
  onUpdate?: (editor: Editor) => void;
  /** Whether the editor is editable */
  editable?: boolean;
}

interface UseCollaborativeTiptapReturn {
  /** The Tiptap editor instance */
  editor: Editor | null;
  /** Whether the editor is synced with Liveblocks */
  isSynced: boolean;
  /** Whether the editor is connecting */
  isConnecting: boolean;
  /** Connected users count */
  connectedUsers: number;
  /** Yjs provider for advanced usage */
  provider: any | null;
}

/**
 * Hook for collaborative Tiptap editing using Liveblocks Yjs.
 *
 * @example
 * ```tsx
 * function CollaborativeEditor() {
 *   const { editor, isSynced, connectedUsers } = useCollaborativeTiptap({
 *     extensions: [StarterKit.configure({ history: false })],
 *   });
 *
 *   if (!editor) return <div>Loading editor...</div>;
 *
 *   return (
 *     <div>
 *       <p>{connectedUsers} users editing</p>
 *       <EditorContent editor={editor} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useCollaborativeTiptap({
  extensions = [],
  initialContent,
  documentId,
  onUpdate,
  editable = true,
}: UseCollaborativeTiptapOptions = {}): UseCollaborativeTiptapReturn {
  // If Liveblocks isn't enabled, provide a non-collaborative editor
  if (!isLiveblocksEnabled) {
    return useNonCollaborativeTiptap({ extensions, initialContent, onUpdate, editable });
  }

  return useCollaborativeTiptapInner({ extensions, initialContent, documentId, onUpdate, editable });
}

/**
 * Non-collaborative fallback when Liveblocks isn't configured
 */
function useNonCollaborativeTiptap({
  extensions = [],
  initialContent,
  onUpdate,
  editable = true,
}: Omit<UseCollaborativeTiptapOptions, 'documentId'>): UseCollaborativeTiptapReturn {
  const editor = useEditor({
    extensions,
    content: initialContent,
    editable,
    onUpdate: onUpdate ? ({ editor }) => onUpdate(editor) : undefined,
    immediatelyRender: false,
  });

  return {
    editor,
    isSynced: true, // Always "synced" since there's no collaboration
    isConnecting: false,
    connectedUsers: 1, // Just the current user
    provider: null,
  };
}

/**
 * Collaborative editor using Liveblocks Yjs
 */
function useCollaborativeTiptapInner({
  extensions = [],
  initialContent,
  documentId,
  onUpdate,
  editable = true,
}: UseCollaborativeTiptapOptions): UseCollaborativeTiptapReturn {
  const room = useRoom();
  const self = useSelf();
  const [isSynced, setIsSynced] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [provider, setProvider] = useState<any | null>(null);
  const [connectedUsers, setConnectedUsers] = useState(0);

  // Get user info for collaboration cursor
  const userInfo = useMemo(() => {
    const info = self?.info || self?.presence?.user;
    return {
      name: info?.name || 'Anonymous',
      color: info?.color || '#888888',
    };
  }, [self]);

  // Create Yjs document and provider
  const { yDoc, yProvider } = useMemo(() => {
    const doc = new Y.Doc();
    const provider = new LiveblocksYjsProvider(room, doc);
    return { yDoc: doc, yProvider: provider };
  }, [room]);

  // Handle provider sync status
  useEffect(() => {
    const handleSync = (synced: boolean) => {
      setIsSynced(synced);
      setIsConnecting(!synced);
    };

    const handleAwarenessChange = () => {
      const awareness = yProvider.awareness;
      if (awareness) {
        setConnectedUsers(awareness.getStates().size);
      }
    };

    yProvider.on('sync', handleSync);
    yProvider.awareness?.on('change', handleAwarenessChange);

    // Initial check
    setIsSynced(yProvider.synced);
    setIsConnecting(!yProvider.synced);
    setProvider(yProvider);

    return () => {
      yProvider.off('sync', handleSync);
      yProvider.awareness?.off('change', handleAwarenessChange);
    };
  }, [yProvider]);

  // Create collaborative extensions
  const collaborativeExtensions = useMemo(() => {
    return [
      ...extensions,
      Collaboration.configure({
        document: yDoc,
        field: documentId || 'default', // Namespace for the document
      }),
      CollaborationCursor.configure({
        provider: yProvider,
        user: userInfo,
      }),
    ];
  }, [extensions, yDoc, yProvider, userInfo, documentId]);

  // Create the editor
  const editor = useEditor({
    extensions: collaborativeExtensions,
    content: initialContent,
    editable,
    onUpdate: onUpdate ? ({ editor }) => onUpdate(editor) : undefined,
    // Enable immediate updates for real-time collaboration
    immediatelyRender: false,
  });

  // Cleanup
  useEffect(() => {
    return () => {
      if (yProvider) {
        yProvider.destroy();
      }
      if (yDoc) {
        yDoc.destroy();
      }
    };
  }, [yDoc, yProvider]);

  return {
    editor,
    isSynced,
    isConnecting,
    connectedUsers,
    provider,
  };
}

/**
 * Standalone wrapper for collaborative Tiptap - use when not already in a Liveblocks room.
 * This creates its own RoomProvider internally.
 */
export function useCollaborativeTiptapStandalone() {
  // This is a placeholder for a future implementation that creates its own room
  // For now, use CollaborationRoom wrapper + useCollaborativeTiptap
  throw new Error(
    'useCollaborativeTiptapStandalone is not implemented. Use CollaborationRoom wrapper with useCollaborativeTiptap instead.'
  );
}
