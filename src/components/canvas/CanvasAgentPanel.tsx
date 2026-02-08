'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  X,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { NodeType } from '@/types/canvas';

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
  type: 'create_node' | 'connect_nodes' | 'update_node' | 'delete_node';
  description: string;
  status: 'pending' | 'complete' | 'error';
  params: Record<string, unknown>;
}

interface CanvasAgentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNode: (type: NodeType, name: string, content?: string) => Promise<number | null>;
  onConnectNodes: (sourceId: number, targetId: number) => Promise<boolean>;
  onUpdateNode: (nodeId: number, data: { name?: string; content?: string }) => Promise<void>;
  onDeleteNode: (nodeId: number) => Promise<void>;
  getCanvasState: () => { nodes: Array<{ id: number; name: string; type: NodeType; content?: string }>; connections: Array<{ sourceId: number; targetId: number }> };
}

export function CanvasAgentPanel({
  isOpen,
  onClose,
  onCreateNode,
  onConnectNodes,
  onUpdateNode,
  onDeleteNode,
  getCanvasState,
}: CanvasAgentPanelProps) {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your canvas assistant. I can help you create and organize nodes on your canvas. Try saying things like:\n\n- \"Create a problem statement about user retention\"\n- \"Add an objective to improve onboarding\"\n- \"Connect the problem to the objective\"\n- \"What's on my canvas?\"",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Process user message and generate response
  const processMessage = useCallback(async (userMessage: string) => {
    const canvasState = getCanvasState();
    const lowerMessage = userMessage.toLowerCase();

    // Simple intent detection and action execution
    // In production, this would call an LLM API with tools

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
    // Create metric
    else if (lowerMessage.includes('metric') && (lowerMessage.includes('create') || lowerMessage.includes('add'))) {
      const match = userMessage.match(/(?:to|for|about|called|named)\s+(.+?)(?:\.|$)/i);
      const topic = match ? match[1].trim() : 'New Metric';
      const name = topic.charAt(0).toUpperCase() + topic.slice(1);

      const nodeId = await onCreateNode('metric', name, '');
      if (nodeId) {
        actions.push({
          type: 'create_node',
          description: `Created metric: "${name}"`,
          status: 'complete',
          params: { type: 'metric', name, id: nodeId },
        });
        responseText = `I've created a metric: "${name}".`;
      } else {
        responseText = "I couldn't create the metric. Please try again.";
      }
    }
    // Create document
    else if ((lowerMessage.includes('doc') || lowerMessage.includes('document') || lowerMessage.includes('note')) && (lowerMessage.includes('create') || lowerMessage.includes('add'))) {
      const match = userMessage.match(/(?:about|for|called|named|titled)\s+(.+?)(?:\.|$)/i);
      const topic = match ? match[1].trim() : 'New Document';
      const name = topic.charAt(0).toUpperCase() + topic.slice(1);

      const nodeId = await onCreateNode('doc', name, '');
      if (nodeId) {
        actions.push({
          type: 'create_node',
          description: `Created document: "${name}"`,
          status: 'complete',
          params: { type: 'doc', name, id: nodeId },
        });
        responseText = `I've created a document: "${name}". Double-click it to edit the content.`;
      } else {
        responseText = "I couldn't create the document. Please try again.";
      }
    }
    // Connect nodes
    else if (lowerMessage.includes('connect')) {
      // Try to find node names in the message
      const nodes = canvasState.nodes;
      let sourceNode = null;
      let targetNode = null;

      for (const node of nodes) {
        const nodeName = node.name.toLowerCase();
        if (lowerMessage.includes(nodeName) || lowerMessage.includes(nodeName.split(':')[1]?.trim() || '')) {
          if (!sourceNode) {
            sourceNode = node;
          } else if (!targetNode) {
            targetNode = node;
            break;
          }
        }
      }

      if (sourceNode && targetNode) {
        const success = await onConnectNodes(sourceNode.id, targetNode.id);
        if (success) {
          actions.push({
            type: 'connect_nodes',
            description: `Connected "${sourceNode.name}" to "${targetNode.name}"`,
            status: 'complete',
            params: { sourceId: sourceNode.id, targetId: targetNode.id },
          });
          responseText = `Done! I've connected "${sourceNode.name}" to "${targetNode.name}".`;
        } else {
          responseText = `I couldn't connect those nodes. They might already be connected or the connection isn't allowed.`;
        }
      } else if (nodes.length < 2) {
        responseText = "You need at least 2 nodes to create a connection. Would you like me to create some nodes first?";
      } else {
        responseText = "I couldn't identify which nodes to connect. Please mention the node names, like: \"Connect Problem Statement to Objective\"";
      }
    }
    // Help
    else if (lowerMessage.includes('help')) {
      responseText = "Here's what I can do:\n\n" +
        "**Create nodes:**\n" +
        "- \"Create a problem statement about X\"\n" +
        "- \"Add an objective to improve Y\"\n" +
        "- \"Create a key result to increase Z by 20%\"\n" +
        "- \"Add a metric called Revenue\"\n" +
        "- \"Create a document about planning\"\n\n" +
        "**Connect nodes:**\n" +
        "- \"Connect Problem to Objective\"\n\n" +
        "**View canvas:**\n" +
        "- \"What's on my canvas?\"\n" +
        "- \"Show me all nodes\"";
    }
    // Default response
    else {
      responseText = "I'm not sure what you'd like me to do. Try asking me to:\n" +
        "- Create a problem statement, objective, key result, or metric\n" +
        "- Connect two nodes together\n" +
        "- Show what's on your canvas\n\n" +
        "Or just say \"help\" for more options!";
    }

    return { responseText, actions };
  }, [getCanvasState, onCreateNode, onConnectNodes]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

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
      const { responseText, actions } = await processMessage(input.trim());

      const assistantMessage: AgentMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        actions: actions.length > 0 ? actions : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
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
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-[80]"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-[400px] bg-background border-l shadow-xl z-[85] transition-transform duration-200 ease-out flex flex-col',
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
              <span className="font-semibold">Canvas Assistant</span>
              <p className="text-xs text-muted-foreground">AI-powered canvas helper</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

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
