'use client';

/**
 * CreationPanel
 *
 * Full-screen overlay shown while the Lifecycle Agent is building a canvas.
 * Consumes an SSE stream from POST /api/v1/agent/chat and displays each
 * action as it completes.
 *
 * Usage:
 *   <CreationPanel
 *     sessionId={sessionId}
 *     message={userMessage}
 *     onComplete={(canvasId) => router.push(`/canvas/${canvasId}`)}
 *     onCancel={() => setOpen(false)}
 *   />
 */

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
  X,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { getSession } from 'next-auth/react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ActionStatus = 'running' | 'done' | 'error';

interface AgentAction {
  id: string;
  action: string;
  status: ActionStatus;
  description?: string;
  result?: Record<string, unknown>;
}

interface AgentMessage {
  role: 'agent' | 'user';
  content: string;
}

interface CreationPanelProps {
  /** Initial message the user typed */
  message: string;
  /** Existing session ID (for file attachments already uploaded) */
  sessionId?: string | null;
  /** Called when the agent finishes and a canvas has been created */
  onComplete?: (canvasId: number, sessionId: string) => void;
  /** Called when the user dismisses the panel */
  onCancel?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ACTION_LABELS: Record<string, string> = {
  create_canvas: 'Creating canvas',
  create_project: 'Setting up project',
  create_node: 'Adding node',
  connect_nodes: 'Connecting nodes',
  create_artifact: 'Drafting document',
  update_node: 'Updating node',
  delete_node: 'Removing node',
  get_canvas_state: 'Reading canvas',
};

function actionLabel(action: string): string {
  return ACTION_LABELS[action] || action.replace(/_/g, ' ');
}

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CreationPanel({
  message: initialMessage,
  sessionId: initialSessionId,
  onComplete,
  onCancel,
}: CreationPanelProps) {
  const router = useRouter();
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [canvasId, setCanvasId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [followUpMessage, setFollowUpMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom when content changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [actions, messages]);

  // Start streaming on mount
  useEffect(() => {
    sendMessage(initialMessage);
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    setIsStreaming(true);
    setError(null);

    // Add user message to display
    setMessages((prev) => [...prev, { role: 'user', content: text }]);

    abortRef.current = new AbortController();

    try {
      // Get auth token
      const session = await getSession();
      const token = (session as { accessToken?: string })?.accessToken;

      const response = await fetch(`${API_BASE}/api/v1/agent/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let agentTextBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          let event: Record<string, unknown>;
          try {
            event = JSON.parse(jsonStr);
          } catch {
            continue;
          }

          const type = event.type as string;

          if (type === 'text') {
            agentTextBuffer += event.content as string;
          } else if (type === 'action') {
            const status = event.status as ActionStatus;
            const actionName = event.action as string;
            const eventId = `${actionName}-${Date.now()}`;

            if (status === 'running') {
              setActions((prev) => [
                ...prev,
                { id: eventId, action: actionName, status: 'running' },
              ]);
            } else {
              setActions((prev) =>
                prev.map((a) =>
                  a.action === actionName && a.status === 'running'
                    ? {
                        ...a,
                        status,
                        description: event.description as string | undefined,
                        result: event.result as Record<string, unknown> | undefined,
                      }
                    : a,
                ),
              );
            }
          } else if (type === 'done') {
            // Flush buffered text as agent message
            if (agentTextBuffer.trim()) {
              setMessages((prev) => [
                ...prev,
                { role: 'agent', content: agentTextBuffer.trim() },
              ]);
              agentTextBuffer = '';
            }

            const doneCanvasId = event.canvas_id as number | undefined;
            const doneSessionId = event.session_id as string | undefined;

            if (doneCanvasId) setCanvasId(doneCanvasId);
            if (doneSessionId) setSessionId(doneSessionId);

            setIsDone(true);
            if (doneCanvasId && doneSessionId) {
              onComplete?.(doneCanvasId, doneSessionId);
            }
          } else if (type === 'error') {
            setError(event.message as string);
          }
        }
      }

      // Flush any remaining text
      if (agentTextBuffer.trim()) {
        setMessages((prev) => [
          ...prev,
          { role: 'agent', content: agentTextBuffer.trim() },
        ]);
      }
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        setError((err as Error).message || 'Something went wrong');
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleFollowUp = () => {
    const text = followUpMessage.trim();
    if (!text) return;
    setFollowUpMessage('');
    sendMessage(text);
  };

  const handleOpenCanvas = () => {
    if (canvasId) router.push(`/canvas/${canvasId}`);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : isDone ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <div className="w-4 h-4" />
            )}
            <h2 className="text-sm font-semibold">
              {isStreaming
                ? 'Building your workspace…'
                : isDone
                ? 'Workspace ready'
                : 'Merlin'}
            </h2>
          </div>
          {onCancel && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={onCancel}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4" ref={scrollRef}>
          {/* Action list */}
          {actions.length > 0 && (
            <div className="mb-4 space-y-1.5">
              <AnimatePresence initial={false}>
                {actions.map((action) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-sm"
                  >
                    {action.status === 'running' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
                    ) : action.status === 'done' ? (
                      <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
                    )}
                    <span
                      className={cn(
                        'text-muted-foreground',
                        action.status === 'done' && 'text-foreground',
                        action.status === 'error' && 'text-destructive',
                      )}
                    >
                      {action.description || actionLabel(action.action)}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Chat messages */}
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-xl px-4 py-2.5 text-sm leading-relaxed',
                  msg.role === 'agent'
                    ? 'bg-muted text-foreground'
                    : 'bg-primary text-primary-foreground ml-8',
                )}
              >
                {msg.content}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border shrink-0 space-y-3">
          {/* Follow-up input — always available */}
          <div className="flex items-end gap-2">
            <Textarea
              value={followUpMessage}
              onChange={(e) => setFollowUpMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleFollowUp();
                }
              }}
              placeholder="Ask a follow-up or request changes…"
              rows={1}
              disabled={isStreaming}
              className="resize-none text-sm min-h-[36px] max-h-28"
            />
            <Button
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={handleFollowUp}
              disabled={isStreaming || !followUpMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Open canvas button */}
          {canvasId && (
            <Button
              className="w-full"
              onClick={handleOpenCanvas}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Canvas
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
