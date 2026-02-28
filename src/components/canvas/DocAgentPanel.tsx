'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bot,
  Send,
  X,
  Sparkles,
  Check,
  XCircle,
  Copy,
  RefreshCw,
  ChevronRight,
  FileText,
  Wand2,
  MessageSquare,
  Lightbulb,
  Edit3,
  Loader2,
} from 'lucide-react';

interface AgentSuggestion {
  id: string;
  type: 'edit' | 'addition' | 'comment' | 'rewrite';
  originalText?: string;
  suggestedText: string;
  explanation: string;
  status: 'pending' | 'accepted' | 'rejected';
  location?: { start: number; end: number };
}

interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  suggestions?: AgentSuggestion[];
}

interface DocAgentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  documentContent: string;
  documentTitle: string;
  onApplySuggestion: (suggestion: AgentSuggestion) => void;
  availableAgents?: Array<{ id: string; name: string }>;
}

const QUICK_ACTIONS = [
  { id: 'improve', label: 'Improve writing', icon: Wand2 },
  { id: 'summarize', label: 'Summarize', icon: FileText },
  { id: 'expand', label: 'Expand on this', icon: Edit3 },
  { id: 'ideas', label: 'Suggest ideas', icon: Lightbulb },
];

export function DocAgentPanel({
  isOpen,
  onClose,
  documentContent,
  documentTitle,
  onApplySuggestion,
  availableAgents = [],
}: DocAgentPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('default');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Agent response - calls backend API or shows preview mode
  const getAgentResponse = useCallback(async (userMessage: string): Promise<ChatMessage> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${backendUrl}/api/v1/ai/document-assist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          document_content: documentContent,
          document_title: documentTitle,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          id: `msg-${Date.now()}`,
          role: 'agent',
          content: data.response,
          timestamp: new Date(),
          suggestions: data.suggestions || [],
        };
      }
    } catch (error) {
      // Backend not available - fall through to preview mode
    }

    // Preview mode - generate sample suggestions
    const suggestions: AgentSuggestion[] = [];

    if (userMessage.toLowerCase().includes('improve') || userMessage.toLowerCase().includes('rewrite')) {
      suggestions.push({
        id: `sug-${Date.now()}`,
        type: 'rewrite',
        originalText: documentContent.slice(0, 100),
        suggestedText: 'Here is an improved version of your opening paragraph that is more engaging and professional.',
        explanation: 'I\'ve made the language more concise and impactful.',
        status: 'pending',
      });
    }

    if (userMessage.toLowerCase().includes('add') || userMessage.toLowerCase().includes('expand')) {
      suggestions.push({
        id: `sug-${Date.now()}-add`,
        type: 'addition',
        suggestedText: '\n\nAdditionally, consider adding a section about the key benefits and how they align with your objectives.',
        explanation: 'This addition would strengthen your argument.',
        status: 'pending',
      });
    }

    return {
      id: `msg-${Date.now()}`,
      role: 'agent',
      content: suggestions.length > 0
        ? `I've analyzed your document "${documentTitle}" and have some suggestions for you:`
        : `I've reviewed your document. ${userMessage.toLowerCase().includes('summarize')
            ? 'Here\'s a brief summary: Your document discusses key points about the topic at hand, outlining objectives and next steps.'
            : 'How can I help you improve it? You can ask me to rewrite sections, add content, or provide feedback.'}`,
      timestamp: new Date(),
      suggestions,
    };
  }, [documentContent, documentTitle]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const agentResponse = await getAgentResponse(inputValue);
      setMessages(prev => [...prev, agentResponse]);
    } catch (error) {
      console.error('Error getting agent response:', error);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, getAgentResponse]);

  const handleQuickAction = useCallback((actionId: string) => {
    const actionMessages: Record<string, string> = {
      improve: 'Please improve the writing quality of my document. Make it more professional and engaging.',
      summarize: 'Please summarize the key points of my document.',
      expand: 'Please suggest ways to expand and add more detail to my document.',
      ideas: 'Please suggest some ideas to make my document more compelling.',
    };

    setInputValue(actionMessages[actionId] || '');
  }, []);

  const handleSuggestionAction = useCallback((suggestion: AgentSuggestion, action: 'accept' | 'reject') => {
    setMessages(prev => prev.map(msg => ({
      ...msg,
      suggestions: msg.suggestions?.map(s =>
        s.id === suggestion.id ? { ...s, status: action === 'accept' ? 'accepted' : 'rejected' } : s
      ),
    })));

    if (action === 'accept') {
      onApplySuggestion({ ...suggestion, status: 'accepted' });
    }
  }, [onApplySuggestion]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'absolute top-0 right-0 h-full w-full md:w-[400px] bg-background border-l shadow-xl z-[60]',
        'flex flex-col transition-transform duration-300',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 rounded-lg">
            <Bot className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Document Assistant</h3>
            <p className="text-xs text-muted-foreground">AI-powered editing</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-10 w-10 md:h-9 md:w-9" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Agent Selector */}
      {availableAgents.length > 0 && (
        <div className="px-4 py-2 border-b">
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default Assistant</SelectItem>
              {availableAgents.map(agent => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Quick Actions */}
      {messages.length === 0 && (
        <div className="p-4 border-b">
          <p className="text-xs text-muted-foreground mb-3">Quick actions</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  className="flex items-center gap-2 p-2 rounded-lg border hover:bg-accent transition-colors text-left"
                  onClick={() => handleQuickAction(action.id)}
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Sparkles className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                Ask me to help improve your document
              </p>
            </div>
          )}

          {messages.map(message => (
            <div
              key={message.id}
              className={cn(
                'flex flex-col gap-2',
                message.role === 'user' ? 'items-end' : 'items-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[90%] rounded-lg px-3 py-2',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>

              {/* Suggestions */}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="w-full space-y-2 mt-2">
                  {message.suggestions.map(suggestion => (
                    <div
                      key={suggestion.id}
                      className={cn(
                        'rounded-lg border p-3 transition-colors',
                        suggestion.status === 'accepted' && 'bg-green-500/10 border-green-500/30',
                        suggestion.status === 'rejected' && 'bg-red-500/10 border-red-500/30 opacity-60'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-xs',
                            suggestion.type === 'rewrite' && 'bg-blue-500/10 text-blue-600',
                            suggestion.type === 'addition' && 'bg-green-500/10 text-green-600',
                            suggestion.type === 'comment' && 'bg-yellow-500/10 text-yellow-600'
                          )}
                        >
                          {suggestion.type === 'rewrite' && 'Rewrite'}
                          {suggestion.type === 'addition' && 'Addition'}
                          {suggestion.type === 'comment' && 'Comment'}
                          {suggestion.type === 'edit' && 'Edit'}
                        </Badge>

                        {suggestion.status === 'pending' && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                              onClick={() => handleSuggestionAction(suggestion, 'accept')}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                              onClick={() => handleSuggestionAction(suggestion, 'reject')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        {suggestion.status !== 'pending' && (
                          <Badge variant={suggestion.status === 'accepted' ? 'default' : 'secondary'}>
                            {suggestion.status === 'accepted' ? 'Applied' : 'Dismissed'}
                          </Badge>
                        )}
                      </div>

                      {suggestion.originalText && (
                        <div className="mb-2 p-2 bg-red-500/5 rounded border-l-2 border-red-500/30">
                          <p className="text-xs text-muted-foreground mb-1">Original:</p>
                          <p className="text-sm line-through opacity-60">{suggestion.originalText}</p>
                        </div>
                      )}

                      <div className="p-2 bg-green-500/5 rounded border-l-2 border-green-500/30">
                        <p className="text-xs text-muted-foreground mb-1">Suggested:</p>
                        <p className="text-sm">{suggestion.suggestedText}</p>
                      </div>

                      <p className="text-xs text-muted-foreground mt-2 italic">
                        {suggestion.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <span className="text-[10px] text-muted-foreground">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Agent is thinking...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="relative">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the agent to help with your document..."
            className="min-h-[80px] pr-12 resize-none"
          />
          <Button
            size="icon"
            className="absolute bottom-2 right-2 h-8 w-8"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
