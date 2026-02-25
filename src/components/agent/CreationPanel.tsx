'use client';

/**
 * CreationPanel
 *
 * Full-screen overlay for problem-oriented canvas creation.
 * Guides the user through a conversational flow:
 * 1. Connect skills (Jira, Confluence, Slack)
 * 2. Define problems to watch for
 * 3. Set check frequency
 * 4. Establish goals
 * 5. Auto-generate OKR structure
 *
 * Usage:
 *   <CreationPanel
 *     sessionId={sessionId}
 *     message={userMessage}
 *     onComplete={(canvasId) => router.push(`/canvas/${canvasId}`)}
 *     onCancel={() => setOpen(false)}
 *   />
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
  X,
  Send,
  Sparkles,
  FolderOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { getSession } from 'next-auth/react';
import { SkillsQuickConnect, ConnectedSkill } from './SkillsQuickConnect';
import {
  ConversationProgress,
  ConversationPhase,
  getPhasePrompt,
  PHASE_SUGGESTIONS,
} from './ConversationProgress';

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
  /** Enable problem-oriented conversational flow */
  conversationalMode?: boolean;
  /** Resume from a saved draft */
  draftId?: string | null;
}

// Draft state for saving/restoring wizard progress
interface WizardDraft {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  sessionId: string | null;
  currentPhase: ConversationPhase;
  completedPhases: ConversationPhase[];
  messages: AgentMessage[];
  actions: AgentAction[];
  connectedSkills: ConnectedSkill[];
}

const DRAFT_STORAGE_KEY = 'canvas-creation-drafts';

// Helper functions for draft management
function loadDrafts(): WizardDraft[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveDrafts(drafts: WizardDraft[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
}

function getDraft(id: string): WizardDraft | null {
  const drafts = loadDrafts();
  return drafts.find((d) => d.id === id) || null;
}

function deleteDraft(id: string): void {
  const drafts = loadDrafts();
  saveDrafts(drafts.filter((d) => d.id !== id));
}

// System prompt for structured conversation
const CONVERSATION_SYSTEM_PROMPT = `You are helping a PM create a new canvas. Guide them through this flow:

1. SKILLS: First, ask what tools they use (Jira, Confluence, Slack). They can connect them inline.

2. PROBLEMS: Ask "What problems are you trying to solve?" or "What signals should I watch for?"
   Help them articulate specific signals like "tickets blocked for >3 days" or "customer complaints about X".

3. FREQUENCY: Ask how often to check for updates:
   - Real-time (every 5 min)
   - Hourly
   - Daily digest
   - Manual only

4. GOALS: Ask "What does success look like?" to define their objective.

After gathering this information, create the canvas with:
- A Problem node describing their problems
- An Objective node with their goal
- 3-5 Key Result nodes with measurable outcomes
- Connect them: Problem → Objective → Key Results

Keep responses concise and conversational. Ask one question at a time.`;

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
  conversationalMode = true,
  draftId,
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

  // Conversational flow state
  const [currentPhase, setCurrentPhase] = useState<ConversationPhase>('skills');
  const [completedPhases, setCompletedPhases] = useState<ConversationPhase[]>([]);
  const [connectedSkills, setConnectedSkills] = useState<ConnectedSkill[]>([]);
  const [showSkillsPanel, setShowSkillsPanel] = useState(false); // Start collapsed, compact bar always shows

  // Draft state
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(draftId || null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isRestoredFromDraft, setIsRestoredFromDraft] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);
  const hasStartedRef = useRef(false);

  // Save current state as draft
  const saveDraft = useCallback(() => {
    if (isDone || currentPhase === 'complete') return; // Don't save completed wizards

    setIsSavingDraft(true);

    const draftName = messages.length > 0
      ? messages[0].content.slice(0, 50) + (messages[0].content.length > 50 ? '...' : '')
      : 'New Canvas';

    const draft: WizardDraft = {
      id: currentDraftId || `draft-${Date.now()}`,
      name: draftName,
      createdAt: currentDraftId ? getDraft(currentDraftId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sessionId,
      currentPhase,
      completedPhases,
      messages,
      actions,
      connectedSkills,
    };

    const drafts = loadDrafts();
    const existingIndex = drafts.findIndex((d) => d.id === draft.id);

    if (existingIndex >= 0) {
      drafts[existingIndex] = draft;
    } else {
      drafts.unshift(draft);
    }

    // Keep only last 10 drafts
    saveDrafts(drafts.slice(0, 10));
    setCurrentDraftId(draft.id);
    setLastSaved(new Date());
    setIsSavingDraft(false);
  }, [isDone, currentPhase, messages, actions, connectedSkills, completedPhases, sessionId, currentDraftId]);

  // Restore from draft on mount
  useEffect(() => {
    if (draftId && !isRestoredFromDraft) {
      const draft = getDraft(draftId);
      if (draft) {
        setMessages(draft.messages);
        setActions(draft.actions);
        setCurrentPhase(draft.currentPhase);
        setCompletedPhases(draft.completedPhases);
        setConnectedSkills(draft.connectedSkills);
        if (draft.sessionId) setSessionId(draft.sessionId);
        setCurrentDraftId(draft.id);
        setIsRestoredFromDraft(true);
        hasStartedRef.current = true; // Don't auto-start when restoring
      }
    }
  }, [draftId, isRestoredFromDraft]);

  // Auto-save draft every 10 seconds if there's progress
  useEffect(() => {
    if (!conversationalMode || isDone || messages.length === 0) return;

    const interval = setInterval(() => {
      saveDraft();
    }, 10000);

    return () => clearInterval(interval);
  }, [conversationalMode, isDone, messages.length, saveDraft]);

  // Save draft when user is about to close
  const handleCancel = useCallback(() => {
    if (messages.length > 0 && !isDone) {
      saveDraft();
    }
    onCancel?.();
  }, [messages.length, isDone, saveDraft, onCancel]);

  // Clear draft when canvas is successfully created
  useEffect(() => {
    if (isDone && currentDraftId) {
      deleteDraft(currentDraftId);
      setCurrentDraftId(null);
    }
  }, [isDone, currentDraftId]);

  // Detect phase from agent responses
  const detectPhaseFromMessage = useCallback((content: string) => {
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('what tools') || lowerContent.includes('connect') || lowerContent.includes('jira') || lowerContent.includes('confluence') || lowerContent.includes('slack')) {
      return 'skills';
    }
    if (lowerContent.includes('problem') || lowerContent.includes('signal') || lowerContent.includes('watch for') || lowerContent.includes('listen for')) {
      return 'problems';
    }
    if (lowerContent.includes('how often') || lowerContent.includes('frequency') || lowerContent.includes('check') || lowerContent.includes('real-time') || lowerContent.includes('daily')) {
      return 'frequency';
    }
    if (lowerContent.includes('goal') || lowerContent.includes('success') || lowerContent.includes('objective') || lowerContent.includes('achieve')) {
      return 'goals';
    }
    if (lowerContent.includes('creating') || lowerContent.includes('building') || lowerContent.includes('setting up')) {
      return 'generating';
    }

    return null;
  }, []);

  // Handle skills change
  const handleSkillsChanged = useCallback((skills: ConnectedSkill[]) => {
    setConnectedSkills(skills);
  }, []);

  // Auto-scroll to bottom when content changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [actions, messages]);

  // Start streaming on mount - handle React StrictMode double-invoke
  useEffect(() => {
    isMountedRef.current = true;

    // Only start the request once, even with StrictMode double-invoke
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      // Create abort controller for cancellation
      abortRef.current = new AbortController();

      // In conversational mode, start with a greeting that asks about skills
      if (conversationalMode && !initialMessage.trim()) {
        sendMessage("I'd like to create a new canvas to track a problem space.", true);
      } else {
        sendMessage(initialMessage, conversationalMode);
      }
    }

    return () => {
      isMountedRef.current = false;
      // Don't abort here - let ongoing requests complete
      // AbortController is only used for user-initiated cancel
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = async (text: string, includeSystemPrompt: boolean = false) => {
    if (!text.trim() || isStreaming) {
      return;
    }

    setIsStreaming(true);
    setError(null);

    // Add user message to display
    setMessages((prev) => [...prev, { role: 'user', content: text }]);

    // Create abort controller if not already set (for follow-up messages)
    if (!abortRef.current) {
      abortRef.current = new AbortController();
    }

    try {
      // Get auth token
      const session = await getSession();
      const token = (session as { accessToken?: string })?.accessToken;

      if (!token) {
        throw new Error('No authentication token available. Please log in again.');
      }

      // Build message with optional system context
      let messageToSend = text;
      if (includeSystemPrompt && conversationalMode) {
        // Prepend system context for the agent
        const skillsContext = connectedSkills.filter(s => s.connected).map(s => s.name).join(', ');
        const contextInfo = skillsContext
          ? `\n\n[Context: User has connected: ${skillsContext}]`
          : '\n\n[Context: No tools connected yet]';
        messageToSend = `${CONVERSATION_SYSTEM_PROMPT}${contextInfo}\n\nUser: ${text}`;
      }

      const response = await fetch(`${API_BASE}/api/v1/agent/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: messageToSend,
          session_id: sessionId,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok || !response.body) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.status} - ${errorText}`);
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

            // In conversational mode, detect phase from agent response
            if (conversationalMode) {
              const detectedPhase = detectPhaseFromMessage(agentTextBuffer);
              if (detectedPhase && detectedPhase !== currentPhase) {
                // Mark current phase as completed and move to next
                if (currentPhase !== 'complete') {
                  setCompletedPhases((prev) => [...prev, currentPhase]);
                }
                setCurrentPhase(detectedPhase);
              }
            }
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

            if (doneCanvasId) {
              setCanvasId(doneCanvasId);
              // Canvas created - mark as complete
              if (conversationalMode) {
                setCurrentPhase('complete');
              }
            }
            if (doneSessionId) setSessionId(doneSessionId);

            setIsDone(true);
            if (doneCanvasId && doneSessionId) {
              onComplete?.(doneCanvasId, doneSessionId);
            }
          } else if (type === 'error') {
            setError(event.message as string);
            setIsStreaming(false);
            return;
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
      // Ignore AbortError (happens on cleanup/cancel)
      if ((err as Error).name !== 'AbortError') {
        const errorMsg = (err as Error).message || 'Something went wrong';
        setError(errorMsg);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleFollowUp = () => {
    const text = followUpMessage.trim();
    if (!text) return;
    setFollowUpMessage('');
    sendMessage(text, false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Handle special suggestions
    if (suggestion === 'Skip for now') {
      // Close expanded panel if open, but compact bar still shows
      setShowSkillsPanel(false);
      sendMessage("Let's skip connecting tools for now and continue.", false);
      return;
    }

    if (suggestion.startsWith('Connect ')) {
      // Expand the skills panel
      setShowSkillsPanel(true);
      return;
    }

    // Send the suggestion as a message
    sendMessage(suggestion, false);
  };

  const handleOpenCanvas = () => {
    if (canvasId) router.push(`/canvas/${canvasId}`);
  };

  // Get current suggestions based on phase
  const currentSuggestions = conversationalMode ? PHASE_SUGGESTIONS[currentPhase] : [];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex flex-col gap-3 px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              ) : isDone ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Sparkles className="w-4 h-4 text-primary" />
              )}
              <h2 className="text-sm font-semibold">
                {isStreaming
                  ? currentPhase === 'generating'
                    ? 'Creating your canvas…'
                    : 'Thinking…'
                  : isDone
                  ? 'Canvas ready'
                  : 'Create New Canvas'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {/* Auto-save indicator - subtle, no user action needed */}
              {conversationalMode && !isDone && messages.length > 0 && (
                <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                  {isSavingDraft ? (
                    <>
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      saving
                    </>
                  ) : lastSaved ? (
                    <>
                      <Check className="w-2.5 h-2.5" />
                      draft saved
                    </>
                  ) : null}
                </span>
              )}
              {onCancel && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                  onClick={handleCancel}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Restored from draft indicator */}
          {isRestoredFromDraft && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FolderOpen className="w-3 h-3" />
              <span>Continuing from saved draft</span>
            </div>
          )}

          {/* Conversation Progress */}
          {conversationalMode && currentPhase !== 'complete' && (
            <ConversationProgress
              currentPhase={currentPhase}
              completedPhases={completedPhases}
            />
          )}
        </div>

        {/* Skills Bar - Shows connection status and config options */}
        <div className="px-6 py-2 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground shrink-0">Tools:</span>

            {/* Jira */}
            {connectedSkills.find(s => s.provider === 'jira')?.connected ? (
              <button
                onClick={() => setShowSkillsPanel(true)}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all"
              >
                <Check className="h-3 w-3" />
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <path d="M11.5 2C6.25 2 2 6.25 2 11.5C2 16.75 6.25 21 11.5 21C16.75 21 21 16.75 21 11.5C21 6.25 16.75 2 11.5 2Z" fill="#2684FF"/>
                </svg>
                Jira
              </button>
            ) : (
              <button
                onClick={() => setShowSkillsPanel(true)}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium bg-muted/50 border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <path d="M11.5 2C6.25 2 2 6.25 2 11.5C2 16.75 6.25 21 11.5 21C16.75 21 21 16.75 21 11.5C21 6.25 16.75 2 11.5 2Z" fill="#2684FF"/>
                </svg>
                Jira
              </button>
            )}

            {/* Confluence */}
            {connectedSkills.find(s => s.provider === 'confluence')?.connected ? (
              <button
                onClick={() => setShowSkillsPanel(true)}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all"
              >
                <Check className="h-3 w-3" />
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12.5C3 12.5 4.5 10 7 10C9.5 10 11 12.5 11 12.5C11 12.5 12.5 15 15 15C17.5 15 19 12.5 19 12.5L21 14C21 14 18.5 18 15 18C11.5 18 9 14 9 14C9 14 6.5 10 4 10L3 12.5Z" fill="#2684FF"/>
                </svg>
                Confluence
              </button>
            ) : (
              <button
                onClick={() => setShowSkillsPanel(true)}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium bg-muted/50 border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12.5C3 12.5 4.5 10 7 10C9.5 10 11 12.5 11 12.5C11 12.5 12.5 15 15 15C17.5 15 19 12.5 19 12.5L21 14C21 14 18.5 18 15 18C11.5 18 9 14 9 14C9 14 6.5 10 4 10L3 12.5Z" fill="#2684FF"/>
                </svg>
                Confluence
              </button>
            )}

            {/* Slack - disabled */}
            <button
              disabled
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium bg-muted/30 border-border text-muted-foreground/50 cursor-not-allowed"
            >
              Slack
              <span className="text-[10px]">soon</span>
            </button>

            <button
              onClick={() => setShowSkillsPanel(!showSkillsPanel)}
              className="ml-auto text-xs text-primary hover:underline"
            >
              {showSkillsPanel ? 'Hide' : (connectedSkills.some(s => s.connected) ? 'Configure' : 'Setup')}
            </button>
          </div>
        </div>

        {/* Expanded Skills Panel - shows connection or configuration */}
        {showSkillsPanel && (
          <div className="px-6 py-3 border-b border-border bg-card shrink-0">
            <SkillsQuickConnect
              onSkillsChanged={handleSkillsChanged}
              compact={false}
            />
          </div>
        )}

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
          {/* Suggestions */}
          {conversationalMode && currentSuggestions.length > 0 && !isStreaming && !isDone && (
            <div className="flex flex-wrap gap-2">
              {currentSuggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}

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
              placeholder={
                conversationalMode && currentPhase !== 'complete'
                  ? getPhasePrompt(currentPhase).replace(/[.?!]$/, '…')
                  : 'Ask a follow-up or request changes…'
              }
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

// Export draft utilities for use in canvas page
export { loadDrafts, deleteDraft };
export type { WizardDraft };
