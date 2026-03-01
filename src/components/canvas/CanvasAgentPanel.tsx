'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FolderOpen,
  Bell,
} from 'lucide-react';
import { NodeType } from '@/types/canvas';
import { api, isMockMode } from '@/lib/api';

// Message types
interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: AgentAction[];
  status?: 'pending' | 'complete' | 'error';
}

// Actions the agent can take
interface AgentAction {
  type: 'create_node' | 'connect_nodes' | 'update_node' | 'delete_node' | 'get_canvas_state' | 'create_canvas' | 'create_project' | 'create_artifact';
  description: string;
  status: 'pending' | 'complete' | 'error';
  params: Record<string, unknown>;
  result?: Record<string, unknown>;
}

interface CanvasAgentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  canvasId?: number; // For session scoping
  userId?: string; // For session scoping
  onCreateNode: (type: NodeType, name: string, content?: string) => Promise<number | null>;
  onConnectNodes: (sourceId: number, targetId: number) => Promise<boolean>;
  onUpdateNode: (nodeId: number, data: { name?: string; content?: string }) => Promise<void>;
  onDeleteNode: (nodeId: number) => Promise<void>;
  getCanvasState: () => { nodes: Array<{ id: number; name: string; type: NodeType; content?: string; position_x?: number; position_y?: number; config?: Record<string, unknown> }>; connections: Array<{ sourceId: number; targetId: number }> };
  /** Refresh canvas state after agent makes changes */
  onRefreshCanvas?: () => Promise<void>;
  /** Center the canvas viewport on a specific position */
  onCenterOnPosition?: (x: number, y: number) => void;
  /** Number of projects on this canvas */
  projectCount?: number;
  /** Number of pending change proposals across all projects */
  pendingProposalsCount?: number;
}

const DEFAULT_WELCOME_MESSAGE: AgentMessage = {
  id: '1',
  role: 'assistant',
  content: "Hi! I'm Merlin, your product lifecycle assistant. I can help you:\n\n- **Create and organize nodes** — problems, objectives, KRs, metrics, docs\n- **Draft artifacts** — PRDs, tech specs, timelines\n- **Manage projects** — move through workflow stages\n- **Review change proposals** — \"Show me pending Jira proposals\"\n\nTry: \"Add a tech spec for the authentication feature\" or \"What's on my canvas?\"",
  timestamp: new Date(),
};

// Get session storage key for user-specific agent history
function getSessionKey(canvasId?: number, userId?: string): string {
  return `agent-session-${canvasId || 'unknown'}-${userId || 'anonymous'}`;
}

export function CanvasAgentPanel({
  isOpen,
  onClose,
  canvasId,
  userId,
  onCreateNode,
  onConnectNodes,
  onUpdateNode,
  onDeleteNode,
  getCanvasState,
  onRefreshCanvas,
  onCenterOnPosition,
  projectCount = 0,
  pendingProposalsCount = 0,
}: CanvasAgentPanelProps) {
  const [messages, setMessages] = useState<AgentMessage[]>([DEFAULT_WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Log API mode on mount
  useEffect(() => {
    console.log('[Agent] Component mounted');
    console.log('[Agent] Using mock API:', isMockMode);
    console.log('[Agent] canvasId:', canvasId, 'type:', typeof canvasId);
    console.log('[Agent] userId:', userId);
  }, [canvasId, userId]);

  // Load messages from session storage on mount (user-specific)
  useEffect(() => {
    const sessionKey = getSessionKey(canvasId, userId);
    console.log('[Agent] Loading session with key:', sessionKey);
    try {
      const saved = sessionStorage.getItem(sessionKey);
      console.log('[Agent] Loaded from sessionStorage:', saved ? 'found data' : 'no data');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        const restored = parsed.map((m: AgentMessage) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
        console.log('[Agent] Restored messages count:', restored.length);
        setMessages(restored);
      }
    } catch (e) {
      console.error('Failed to load agent session:', e);
    }
  }, [canvasId, userId]);

  // Save messages to session storage when they change (user-specific)
  useEffect(() => {
    if (messages.length > 1) {
      const sessionKey = getSessionKey(canvasId, userId);
      try {
        sessionStorage.setItem(sessionKey, JSON.stringify(messages));
      } catch (e) {
        console.error('Failed to save agent session:', e);
      }
    }
  }, [messages, canvasId, userId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Conversation history for the AI (stored in ref to persist across renders)
  const conversationHistoryRef = useRef<Array<{ role: string; content: unknown }>>([]);

  // Process user message using the real AI backend
  const processMessage = useCallback(async (userMessage: string): Promise<{ responseText: string; actions: AgentAction[] }> => {
    // If no canvasId, fall back to a simple response
    if (!canvasId) {
      console.log('[Agent] No canvasId provided');
      return {
        responseText: "I need a canvas to work with. Please open a canvas first.",
        actions: [],
      };
    }

    try {
      console.log('[Agent] Calling chatWithCanvasAgent with canvasId:', canvasId);
      console.log('[Agent] Using API:', api);
      // Call the real AI backend
      const response = await api.chatWithCanvasAgent(canvasId, userMessage, conversationHistoryRef.current);
      console.log('[Agent] Raw response received:', response);
      console.log('[Agent] Response type:', typeof response);
      console.log('[Agent] Response.response:', response?.response);
      console.log('[Agent] Response.actions:', response?.actions);

      // Update conversation history for context
      conversationHistoryRef.current.push({ role: 'user', content: userMessage });
      conversationHistoryRef.current.push({ role: 'assistant', content: response.response });

      // Keep history manageable (last 20 messages)
      if (conversationHistoryRef.current.length > 20) {
        conversationHistoryRef.current = conversationHistoryRef.current.slice(-20);
      }

      // Map backend actions to frontend format
      const actions: AgentAction[] = response.actions.map((action: { type: string; description: string; status: string; params: Record<string, unknown>; result?: Record<string, unknown> }) => ({
        type: action.type as AgentAction['type'],
        description: action.description,
        status: action.status as 'pending' | 'complete' | 'error',
        params: action.params,
        result: action.result,
      }));

      // If the agent performed actions that modified the canvas, refresh to sync state
      if (actions.length > 0 && onRefreshCanvas) {
        await onRefreshCanvas();

        // Center on the last created node
        if (onCenterOnPosition) {
          const createNodeActions = actions.filter(
            a => (a.type === 'create_node' || a.type === 'create_artifact') && a.status === 'complete'
          );
          if (createNodeActions.length > 0) {
            const lastAction = createNodeActions[createNodeActions.length - 1];
            // Get node position from canvas state after refresh
            const state = getCanvasState();
            const nodeId = (lastAction.result as { node_id?: number })?.node_id ||
                          (lastAction.params as { id?: number })?.id;
            if (nodeId) {
              const node = state.nodes.find(n => n.id === nodeId);
              if (node && node.position_x !== undefined && node.position_y !== undefined) {
                // Center on the node (add offset for node center)
                onCenterOnPosition(node.position_x + 140, node.position_y + 100);
              }
            }
          }
        }
      }

      return {
        responseText: response.response,
        actions,
      };
    } catch (error) {
      // Log detailed error info for debugging
      console.error('Canvas agent error:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error name:', error.name);
        // Check if it's an Axios error with response data
        const axiosError = error as { response?: { status?: number; data?: unknown }; code?: string };
        if (axiosError.response) {
          console.error('Response status:', axiosError.response.status);
          console.error('Response data:', axiosError.response.data);
        }
        if (axiosError.code) {
          console.error('Error code:', axiosError.code);
        }
      }

      // Fallback to local processing if API fails
      return processMessageLocally(userMessage);
    }
  }, [canvasId, onRefreshCanvas, onCenterOnPosition, getCanvasState]);

  // Local fallback processing when API is unavailable
  const processMessageLocally = useCallback(async (userMessage: string): Promise<{ responseText: string; actions: AgentAction[] }> => {
    const canvasState = getCanvasState();
    const lowerMessage = userMessage.toLowerCase();

    const actions: AgentAction[] = [];
    let responseText = '';

    // Check for canvas state query
    if (lowerMessage.includes("what's on") || lowerMessage.includes('show me') || lowerMessage.includes('list')) {
      if (canvasState.nodes.length === 0) {
        responseText = "Your canvas is empty. Would you like me to help you create some nodes?";
      } else {
        responseText = `Your canvas has ${canvasState.nodes.length} node(s):\n\n`;
        canvasState.nodes.forEach((node, i) => {
          responseText += `${i + 1}. **${node.name}** (${node.type})${node.content ? `: ${node.content.substring(0, 50)}...` : ''}\n`;
        });
        if (canvasState.connections.length > 0) {
          responseText += `\nAnd ${canvasState.connections.length} connection(s).`;
        }
      }
    }
    // Create problem statement
    else if (lowerMessage.includes('problem') && (lowerMessage.includes('create') || lowerMessage.includes('add'))) {
      const match = userMessage.match(/(?:about|for|regarding|on)\s+(.+?)(?:\.|$)/i);
      const topic = match ? match[1].trim() : 'New Problem';
      const name = `Problem: ${topic.charAt(0).toUpperCase() + topic.slice(1)}`;

      const nodeId = await onCreateNode('problem', name, `Define the problem: ${topic}`);
      if (nodeId) {
        actions.push({
          type: 'create_node',
          description: `Created problem statement: "${name}"`,
          status: 'complete',
          params: { type: 'problem', name, id: nodeId },
        });
        responseText = `I've created a problem statement about "${topic}". Would you like me to add an objective to address this problem?`;
      } else {
        responseText = "I couldn't create the node. Please try again.";
      }
    }
    // Create objective
    else if (lowerMessage.includes('objective') && (lowerMessage.includes('create') || lowerMessage.includes('add'))) {
      const match = userMessage.match(/(?:to|for|about)\s+(.+?)(?:\.|$)/i);
      const topic = match ? match[1].trim() : 'New Objective';
      const name = `Objective: ${topic.charAt(0).toUpperCase() + topic.slice(1)}`;

      const nodeId = await onCreateNode('objective', name, topic);
      if (nodeId) {
        actions.push({
          type: 'create_node',
          description: `Created objective: "${name}"`,
          status: 'complete',
          params: { type: 'objective', name, id: nodeId },
        });
        responseText = `I've created an objective: "${topic}". Would you like me to add key results for this objective?`;
      } else {
        responseText = "I couldn't create the objective. Please try again.";
      }
    }
    // Create key result
    else if ((lowerMessage.includes('key result') || lowerMessage.includes('kr')) && (lowerMessage.includes('create') || lowerMessage.includes('add'))) {
      const match = userMessage.match(/(?:to|for|about|:)\s+(.+?)(?:\.|$)/i);
      const topic = match ? match[1].trim() : 'New Key Result';
      const name = `KR: ${topic.charAt(0).toUpperCase() + topic.slice(1)}`;

      const nodeId = await onCreateNode('keyresult', name, topic);
      if (nodeId) {
        actions.push({
          type: 'create_node',
          description: `Created key result: "${name}"`,
          status: 'complete',
          params: { type: 'keyresult', name, id: nodeId },
        });
        responseText = `I've created a key result: "${topic}". Should I connect it to an objective?`;
      } else {
        responseText = "I couldn't create the key result. Please try again.";
      }
    }
    // Help or default
    else {
      responseText = "I'm running in offline mode. Try asking me to:\n" +
        "- Create a problem statement, objective, or key result\n" +
        "- Show what's on your canvas\n\n" +
        "For full AI capabilities, ensure the backend is connected.";
    }

    return { responseText, actions };
  }, [getCanvasState, onCreateNode]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    console.log('[Agent] handleSend called with input:', input.trim());

    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('[Agent] Calling processMessage...');
      const { responseText, actions } = await processMessage(input.trim());
      console.log('[Agent] processMessage returned:', { responseText, actions });

      // Ensure we always have a response to show
      const finalResponseText = responseText || 'I received your message but had no response text.';

      const assistantMessage: AgentMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: finalResponseText,
        timestamp: new Date(),
        actions: actions.length > 0 ? actions : undefined,
      };

      console.log('[Agent] Setting assistant message:', assistantMessage);
      setMessages((prev) => {
        console.log('[Agent] Previous messages count:', prev.length);
        const newMessages = [...prev, assistantMessage];
        console.log('[Agent] New messages count:', newMessages.length);
        return newMessages;
      });
    } catch (error) {
      console.error('[Agent] Error in handleSend:', error);
      const errorMessage: AgentMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
        status: 'error',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, processMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <>
      {/* Overlay - fixed to viewport */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-[80]"
          onClick={onClose}
        />
      )}

      {/* Panel - fixed to viewport, not affected by canvas scroll/pan */}
      <div
        className={cn(
          'fixed top-0 right-0 h-screen w-full md:w-[400px] bg-background border-l shadow-xl z-[85] transition-transform duration-200 ease-out flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-semibold">Merlin</span>
              <p className="text-xs text-muted-foreground">Product lifecycle assistant</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 md:h-8 md:w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Project context banner */}
        {(projectCount > 0 || pendingProposalsCount > 0) && (
          <div className="flex items-center gap-3 px-4 py-2 border-b bg-muted/40 text-xs">
            {projectCount > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <FolderOpen className="h-3 w-3" />
                <span>{projectCount} project{projectCount !== 1 ? 's' : ''}</span>
              </div>
            )}
            {pendingProposalsCount > 0 && (
              <Badge
                variant="destructive"
                className="flex items-center gap-1 text-[10px] h-5 px-1.5 cursor-pointer"
                title="Pending change proposals need review"
              >
                <Bell className="h-2.5 w-2.5" />
                {pendingProposalsCount} proposal{pendingProposalsCount !== 1 ? 's' : ''} pending
              </Badge>
            )}
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' && 'flex-row-reverse'
                )}
              >
                <div
                  className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                    message.role === 'assistant'
                      ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                      : 'bg-primary'
                  )}
                >
                  {message.role === 'assistant' ? (
                    <Bot className="h-4 w-4 text-white" />
                  ) : (
                    <User className="h-4 w-4 text-primary-foreground" />
                  )}
                </div>
                <div
                  className={cn(
                    'flex-1 space-y-2',
                    message.role === 'user' && 'text-right'
                  )}
                >
                  <div
                    className={cn(
                      'inline-block p-3 rounded-lg text-sm whitespace-pre-wrap',
                      message.role === 'assistant'
                        ? 'bg-muted text-left'
                        : 'bg-primary text-primary-foreground'
                    )}
                  >
                    {message.content}
                  </div>

                  {/* Show actions taken */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="space-y-1">
                      {message.actions.map((action, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          {action.status === 'complete' ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : action.status === 'error' ? (
                            <AlertCircle className="h-3 w-3 text-destructive" />
                          ) : (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          )}
                          <span>{action.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me to create nodes..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Try: "Create a problem statement about user churn"
          </p>
        </div>
      </div>
    </>
  );
}
