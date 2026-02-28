'use client';

/**
 * SkillsQuickConnect
 *
 * Inline skill connection cards for the canvas creation flow.
 * Shows Jira, Confluence, and Slack with one-click OAuth connection.
 */

import React, { useState, useEffect } from 'react';
import { Check, Loader2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { skillsApi } from '@/lib/skills-api';
import { SkillProvider } from '@/types/skills';

interface ConnectedSkill {
  provider: SkillProvider;
  name: string;
  connected: boolean;
}

interface SkillsQuickConnectProps {
  onSkillsChanged?: (skills: ConnectedSkill[]) => void;
  onConfigChanged?: (config: SkillConfig) => void;
  compact?: boolean;
  className?: string;
  /** For testing: pre-set which skills are connected */
  initialConnected?: SkillProvider[];
}

// Configuration that will be passed to canvas creation
export interface SkillConfig {
  jira?: {
    watchFor?: string; // Natural language description of what to monitor
  };
  confluence?: {
    watchFor?: string; // Natural language description of what to sync/monitor
  };
  slack?: {
    watchFor?: string;
  };
}

interface SkillCardData {
  provider: SkillProvider;
  name: string;
  description: string;
  benefits: string[];
  icon: React.ReactNode;
  color: string;
  available: boolean;
}

const AVAILABLE_SKILLS: SkillCardData[] = [
  {
    provider: 'jira',
    name: 'Jira',
    description: 'Import issues and track engineering work',
    benefits: [
      'Import issues via JQL queries',
      'Track blockers and sprint progress',
      'Auto-link relevant tickets to problems',
    ],
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <path
          d="M11.5 2C6.25 2 2 6.25 2 11.5C2 16.75 6.25 21 11.5 21C16.75 21 21 16.75 21 11.5C21 6.25 16.75 2 11.5 2Z"
          fill="#2684FF"
        />
        <path d="M11.75 6.5L8.25 10L11.75 13.5V10.5H15.25V9.5H11.75V6.5Z" fill="white" />
        <path d="M11.25 17.5L14.75 14L11.25 10.5V13.5H7.75V14.5H11.25V17.5Z" fill="white" />
      </svg>
    ),
    color: 'bg-[#2684FF]/10 border-[#2684FF]/20 hover:border-[#2684FF]/40',
    available: true,
  },
  {
    provider: 'confluence',
    name: 'Confluence',
    description: 'Sync documentation and knowledge base',
    benefits: [
      'Import existing PRDs and specs',
      'Keep docs in sync bidirectionally',
      'Reference team knowledge in canvas',
    ],
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 12.5C3 12.5 4.5 10 7 10C9.5 10 11 12.5 11 12.5C11 12.5 12.5 15 15 15C17.5 15 19 12.5 19 12.5L21 14C21 14 18.5 18 15 18C11.5 18 9 14 9 14C9 14 6.5 10 4 10L3 12.5Z"
          fill="#2684FF"
        />
        <path
          d="M21 11.5C21 11.5 19.5 14 17 14C14.5 14 13 11.5 13 11.5C13 11.5 11.5 9 9 9C6.5 9 5 11.5 5 11.5L3 10C3 10 5.5 6 9 6C12.5 6 15 10 15 10C15 10 17.5 14 20 14L21 11.5Z"
          fill="#2684FF"
        />
      </svg>
    ),
    color: 'bg-[#2684FF]/10 border-[#2684FF]/20 hover:border-[#2684FF]/40',
    available: true,
  },
  {
    provider: 'slack',
    name: 'Slack',
    description: 'Monitor conversations and get alerts',
    benefits: [
      'Watch channels for problem signals',
      'Get notified of important discussions',
      'Extract action items from threads',
    ],
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z" fill="#E01E5A"/>
        <path d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
        <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z" fill="#36C5F0"/>
        <path d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
        <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834z" fill="#2EB67D"/>
        <path d="M17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D"/>
        <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52z" fill="#ECB22E"/>
        <path d="M15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E"/>
      </svg>
    ),
    color: 'bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40',
    available: false, // Coming soon
  },
];

export function SkillsQuickConnect({
  onSkillsChanged,
  onConfigChanged,
  compact = false,
  className,
  initialConnected,
}: SkillsQuickConnectProps) {
  // Initialize with initialConnected if provided (for testing)
  const getInitialMap = () => {
    const map = new Map<SkillProvider, boolean>();
    if (initialConnected) {
      initialConnected.forEach(p => map.set(p, true));
    }
    return map;
  };

  const [connectedSkills, setConnectedSkills] = useState<Map<SkillProvider, boolean>>(getInitialMap);
  const [loadingSkill, setLoadingSkill] = useState<SkillProvider | null>(null);
  const [isLoading, setIsLoading] = useState(!initialConnected); // Skip loading if initial provided

  // Simple context strings for each skill - what should the agent watch for?
  const [jiraContext, setJiraContext] = useState('');
  const [confluenceContext, setConfluenceContext] = useState('');
  const [slackContext, setSlackContext] = useState('');

  // Load current skill status on mount (skip if initialConnected provided)
  useEffect(() => {
    if (!initialConnected) {
      loadSkillStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Notify config changes when context strings change
  useEffect(() => {
    handleConfigUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jiraContext, confluenceContext, slackContext, connectedSkills]);

  // Listen for OAuth callback
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'oauth-callback' && event.data?.provider) {
        loadSkillStatus();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const loadSkillStatus = async () => {
    console.log('[SkillsQuickConnect] Loading skill status...');
    try {
      const skills = await skillsApi.listSkills();
      console.log('[SkillsQuickConnect] API returned skills:', skills);

      const statusMap = new Map<SkillProvider, boolean>();

      skills.forEach((skill) => {
        console.log(`[SkillsQuickConnect] Skill ${skill.provider}: status=${skill.status}, connected=${skill.status === 'connected'}`);
        if (skill.status === 'connected') {
          statusMap.set(skill.provider, true);
        }
      });

      console.log('[SkillsQuickConnect] Final statusMap:', Object.fromEntries(statusMap));
      setConnectedSkills(statusMap);

      // Notify parent of current status
      const connectedList: ConnectedSkill[] = AVAILABLE_SKILLS.map((s) => ({
        provider: s.provider,
        name: s.name,
        connected: statusMap.get(s.provider) || false,
      }));
      onSkillsChanged?.(connectedList);
    } catch (err) {
      console.error('[SkillsQuickConnect] Failed to load skill status:', err);
      // On error, show empty state (no skills connected) so UI is still usable
      setConnectedSkills(new Map());
      onSkillsChanged?.(AVAILABLE_SKILLS.map((s) => ({
        provider: s.provider,
        name: s.name,
        connected: false,
      })));
    } finally {
      setIsLoading(false);
    }
  };

  // Notify parent when config changes
  const handleConfigUpdate = () => {
    const config: SkillConfig = {};
    if (connectedSkills.get('jira') && jiraContext.trim()) {
      config.jira = { watchFor: jiraContext.trim() };
    }
    if (connectedSkills.get('confluence') && confluenceContext.trim()) {
      config.confluence = { watchFor: confluenceContext.trim() };
    }
    if (connectedSkills.get('slack') && slackContext.trim()) {
      config.slack = { watchFor: slackContext.trim() };
    }
    onConfigChanged?.(config);
  };

  const handleConnect = async (provider: SkillProvider) => {
    setLoadingSkill(provider);

    try {
      let authUrl: string | undefined;

      if (provider === 'jira') {
        const result = await skillsApi.connectJira('individual');
        authUrl = result.authUrl;
      } else if (provider === 'confluence') {
        const result = await skillsApi.connectConfluence();
        authUrl = result.authUrl;
      } else {
        // Slack or other - not implemented yet
        console.log('Skill not yet implemented:', provider);
        return;
      }

      if (authUrl) {
        // Open OAuth popup
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
          authUrl,
          `${provider}-oauth`,
          `width=${width},height=${height},left=${left},top=${top}`
        );

        // Poll for popup close
        const checkPopup = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkPopup);
            loadSkillStatus();
            setLoadingSkill(null);
          }
        }, 500);

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(checkPopup);
          setLoadingSkill(null);
        }, 300000);
      }
    } catch (err) {
      console.error('Failed to connect skill:', err);
      setLoadingSkill(null);
    }
  };

  const handleDisconnect = async (provider: SkillProvider) => {
    setLoadingSkill(provider);

    try {
      if (provider === 'jira') {
        await skillsApi.disconnectJira();
      } else {
        await skillsApi.disconnectSkill(provider);
      }

      // Update local state
      const newMap = new Map(connectedSkills);
      newMap.delete(provider);
      setConnectedSkills(newMap);

      // Notify parent
      const connectedList: ConnectedSkill[] = AVAILABLE_SKILLS.map((s) => ({
        provider: s.provider,
        name: s.name,
        connected: newMap.get(s.provider) || false,
      }));
      onSkillsChanged?.(connectedList);
    } catch (err) {
      console.error('Failed to disconnect skill:', err);
    } finally {
      setLoadingSkill(null);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading skills...</span>
      </div>
    );
  }

  const connectedCount = Array.from(connectedSkills.values()).filter(Boolean).length;

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 flex-wrap', className)}>
        {AVAILABLE_SKILLS.map((skill) => {
          const isConnected = connectedSkills.get(skill.provider);
          const isLoading = loadingSkill === skill.provider;

          return (
            <button
              key={skill.provider}
              onClick={() => isConnected ? handleDisconnect(skill.provider) : handleConnect(skill.provider)}
              disabled={isLoading}
              className={cn(
                'inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium transition-all',
                isConnected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-muted/50 border-border hover:bg-muted text-muted-foreground',
                isLoading && 'opacity-60 cursor-wait'
              )}
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : isConnected ? (
                <Check className="w-3 h-3" />
              ) : (
                skill.icon
              )}
              {skill.name}
            </button>
          );
        })}
        {connectedCount === 0 && (
          <span className="text-xs text-muted-foreground">(none connected)</span>
        )}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Connect your tools
          </span>
          {connectedCount > 0 && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400">
              {connectedCount} connected
            </span>
          )}
        </div>

        <div className="space-y-2">
          {AVAILABLE_SKILLS.map((skill) => {
            const isConnected = connectedSkills.get(skill.provider);
            const isLoading = loadingSkill === skill.provider;
            const isAvailable = skill.available;

            return (
              <div
                key={skill.provider}
                className={cn(
                  'rounded-lg border transition-all',
                  isConnected
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : isAvailable
                    ? skill.color
                    : 'bg-muted/30 border-muted opacity-60'
                )}
              >
                {/* Header Row */}
                <div className="flex items-start gap-3 p-3">
                  {/* Icon */}
                  <div className="relative mt-0.5 shrink-0">
                    {skill.icon}
                    {isConnected && (
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{skill.name}</span>
                    {!isAvailable && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        Coming soon
                      </span>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground">
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="font-medium mb-1">{skill.name}</p>
                        <ul className="text-xs space-y-1">
                          {skill.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <Check className="w-3 h-3 mt-0.5 text-emerald-500 shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {skill.description}
                  </p>
                </div>

                {/* Action - only show connect/disconnect for non-connected */}
                {!isConnected && (
                  <div className="shrink-0">
                    <Button
                      size="sm"
                      variant="default"
                      className="shrink-0 h-7 text-xs"
                      disabled={isLoading || !isAvailable}
                      onClick={() => handleConnect(skill.provider)}
                    >
                      {isLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        'Connect'
                      )}
                    </Button>
                  </div>
                )}
                </div>
                {/* End Header Row */}

                {/* Context input for connected skills */}
                {isConnected && (
                  <div className="px-3 pb-3 pt-0">
                    <Input
                      value={
                        skill.provider === 'jira' ? jiraContext :
                        skill.provider === 'confluence' ? confluenceContext :
                        slackContext
                      }
                      onChange={(e) => {
                        if (skill.provider === 'jira') setJiraContext(e.target.value);
                        else if (skill.provider === 'confluence') setConfluenceContext(e.target.value);
                        else if (skill.provider === 'slack') setSlackContext(e.target.value);
                      }}
                      placeholder={
                        skill.provider === 'jira'
                          ? "e.g., Watch for blocked tickets, auth bugs, sprint blockers..."
                          : skill.provider === 'confluence'
                          ? "e.g., Sync PRDs, engineering specs, team docs..."
                          : "e.g., Watch #product-feedback for customer complaints..."
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs text-muted-foreground"
          onClick={() => onSkillsChanged?.(AVAILABLE_SKILLS.map((s) => ({
            provider: s.provider,
            name: s.name,
            connected: connectedSkills.get(s.provider) || false,
          })))}
        >
          Skip for now
        </Button>
      </div>
    </TooltipProvider>
  );
}

export type { ConnectedSkill, SkillConfig };
