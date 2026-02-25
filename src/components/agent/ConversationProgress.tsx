'use client';

/**
 * ConversationProgress
 *
 * Visual progress indicator for the conversational canvas creation flow.
 * Shows the current phase in the conversation.
 */

import React from 'react';
import { Check, Plug, AlertCircle, Clock, Target, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export type ConversationPhase =
  | 'skills'      // Connect your tools
  | 'problems'    // What problems are you solving?
  | 'frequency'   // How often should we check?
  | 'goals'       // What's your end goal?
  | 'generating'  // Creating your canvas...
  | 'complete';   // Done!

interface ConversationProgressProps {
  currentPhase: ConversationPhase;
  completedPhases?: ConversationPhase[];
  className?: string;
}

interface PhaseConfig {
  id: ConversationPhase;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
}

const PHASES: PhaseConfig[] = [
  {
    id: 'skills',
    label: 'Connect Tools',
    shortLabel: 'Skills',
    icon: <Plug className="w-3.5 h-3.5" />,
  },
  {
    id: 'problems',
    label: 'Define Problem',
    shortLabel: 'Problem',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  {
    id: 'frequency',
    label: 'Set Frequency',
    shortLabel: 'Freq',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  {
    id: 'goals',
    label: 'Set Goals',
    shortLabel: 'Goals',
    icon: <Target className="w-3.5 h-3.5" />,
  },
  {
    id: 'generating',
    label: 'Creating',
    shortLabel: 'Creating',
    icon: <Sparkles className="w-3.5 h-3.5" />,
  },
];

export function ConversationProgress({
  currentPhase,
  completedPhases = [],
  className,
}: ConversationProgressProps) {
  const currentIndex = PHASES.findIndex((p) => p.id === currentPhase);

  // Don't show progress if complete
  if (currentPhase === 'complete') {
    return null;
  }

  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      {PHASES.map((phase, index) => {
        const isCompleted = completedPhases.includes(phase.id) || index < currentIndex;
        const isCurrent = phase.id === currentPhase;
        const isPending = !isCompleted && !isCurrent;

        return (
          <React.Fragment key={phase.id}>
            {/* Connector line */}
            {index > 0 && (
              <div
                className={cn(
                  'h-0.5 w-6 transition-colors duration-300',
                  isCompleted ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}

            {/* Phase indicator */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'relative flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300',
                isCurrent && 'bg-primary/10 text-primary ring-1 ring-primary/30',
                isCompleted && 'text-primary',
                isPending && 'text-muted-foreground'
              )}
            >
              {isCompleted ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <span className={cn(isCurrent && 'animate-pulse')}>
                  {phase.icon}
                </span>
              )}
              <span className="hidden sm:inline">{phase.shortLabel}</span>

              {/* Current indicator dot */}
              {isCurrent && (
                <motion.div
                  layoutId="phase-indicator"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                />
              )}
            </motion.div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Helper to get phase-specific prompts
export function getPhasePrompt(phase: ConversationPhase): string {
  switch (phase) {
    case 'skills':
      return "Let's start by connecting your tools. Which apps do you use?";
    case 'problems':
      return "What problems are you trying to solve? What signals should I watch for?";
    case 'frequency':
      return "How often should I check for updates?";
    case 'goals':
      return "What does success look like? What's your main objective?";
    case 'generating':
      return "Creating your canvas with OKRs and connected insights...";
    case 'complete':
      return "Your canvas is ready!";
    default:
      return '';
  }
}

// Suggested responses for each phase
export const PHASE_SUGGESTIONS: Record<ConversationPhase, string[]> = {
  skills: [
    'Connect Jira',
    'Connect Confluence',
    'Connect Slack',
    'Skip for now',
  ],
  problems: [
    'Customer churn signals',
    'Engineering bottlenecks',
    'Product feedback themes',
    'Sprint blockers',
  ],
  frequency: [
    'Real-time (every 5 min)',
    'Hourly updates',
    'Daily digest',
    'Manual only',
  ],
  goals: [
    'Reduce churn by 20%',
    'Ship features faster',
    'Improve team velocity',
    'Better customer insights',
  ],
  generating: [],
  complete: [],
};
