'use client';

import React, { useEffect, useRef } from 'react';
import { NodeType } from '@/types/canvas';
import {
  FileText,
  Target,
  BarChart3,
  Bot,
  Sparkles,
  AlertCircle,
  Puzzle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface CanvasContextMenuProps {
  x: number;
  y: number;
  onAddNode: (type: NodeType) => void;
  onAddAgent?: () => void;
  onAddSkillNode?: (provider: string) => void;
  onClose: () => void;
}

interface MenuItemData {
  type: NodeType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const MENU_ITEMS: MenuItemData[] = [
  {
    type: 'doc',
    label: 'Document',
    icon: FileText,
    description: 'Rich text document with formatting',
  },
  {
    type: 'agent',
    label: 'AI Agent',
    icon: Bot,
    description: 'Create an AI agent with context',
  },
  {
    type: 'problem',
    label: 'Problem Statement',
    icon: AlertCircle,
    description: 'Define the problem to solve',
  },
  {
    type: 'objective',
    label: 'Objective',
    icon: Target,
    description: 'Create an objective with key results',
  },
  {
    type: 'metric',
    label: 'Metric',
    icon: BarChart3,
    description: 'Track a company metric',
  },
];

interface IntegrationItemData {
  provider: string;
  label: string;
  description: string;
  color: string;
}

const INTEGRATION_ITEMS: IntegrationItemData[] = [
  { provider: 'jira', label: 'Jira', description: 'Import & track Jira issues', color: 'text-blue-500' },
  { provider: 'confluence', label: 'Confluence', description: 'Sync Confluence spaces', color: 'text-blue-600' },
  { provider: 'slack', label: 'Slack', description: 'Connect Slack channels', color: 'text-purple-500' },
  { provider: 'github', label: 'GitHub', description: 'Link GitHub repos', color: 'text-gray-700 dark:text-gray-300' },
  { provider: 'google-docs', label: 'Google Docs', description: 'Sync Google documents', color: 'text-yellow-600' },
  { provider: 'notion', label: 'Notion', description: 'Import Notion pages', color: 'text-gray-800 dark:text-gray-200' },
];

export function CanvasContextMenu({
  x,
  y,
  onAddNode,
  onAddAgent,
  onAddSkillNode,
  onClose,
}: CanvasContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Position menu within viewport bounds
  useEffect(() => {
    if (!menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    if (x + rect.width > viewportWidth) {
      adjustedX = viewportWidth - rect.width - 16;
    }

    if (y + rect.height > viewportHeight) {
      adjustedY = viewportHeight - rect.height - 16;
    }

    menu.style.left = `${adjustedX}px`;
    menu.style.top = `${adjustedY}px`;
  }, [x, y]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute z-50 min-w-[220px] bg-popover text-popover-foreground border rounded-lg shadow-lg overflow-hidden"
      style={{ left: x, top: y }}
    >
      <div className="px-3 py-2 border-b">
        <p className="text-sm font-medium">Add Node</p>
        <p className="text-xs text-muted-foreground">Choose a node type</p>
      </div>

      <div className="p-1">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isAgent = item.type === 'agent';
          return (
            <button
              key={item.type}
              className={cn(
                'w-full flex items-start gap-3 px-3 py-2 rounded-md',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:bg-accent focus:text-accent-foreground focus:outline-none',
                'transition-colors text-left',
                isAgent && 'relative'
              )}
              onClick={() => {
                if (isAgent && onAddAgent) {
                  onAddAgent();
                } else {
                  onAddNode(item.type);
                }
              }}
            >
              <Icon className={cn(
                'h-5 w-5 mt-0.5 flex-shrink-0',
                isAgent && 'text-emerald-500'
              )} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{item.label}</p>
                  {isAgent && (
                    <Sparkles className="h-3 w-3 text-emerald-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}

        {/* Integrations section */}
        {onAddSkillNode && (
          <>
            <Separator className="my-1" />
            <div className="px-3 py-1.5">
              <p className="text-xs font-medium text-muted-foreground">Integrations</p>
            </div>
            {INTEGRATION_ITEMS.map((item) => (
              <button
                key={item.provider}
                className={cn(
                  'w-full flex items-start gap-3 px-3 py-2 rounded-md',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus:bg-accent focus:text-accent-foreground focus:outline-none',
                  'transition-colors text-left'
                )}
                onClick={() => onAddSkillNode(item.provider)}
              >
                <Puzzle className={cn('h-5 w-5 mt-0.5 flex-shrink-0', item.color)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
