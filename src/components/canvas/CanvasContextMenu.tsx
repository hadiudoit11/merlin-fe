'use client';

import React, { useEffect, useRef } from 'react';
import { NodeType } from '@/types/canvas';
import {
  FileText,
  Webhook,
  Globe,
  Server,
  Target,
  BarChart3,
  Puzzle,
  Bot,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CanvasContextMenuProps {
  x: number;
  y: number;
  onAddNode: (type: NodeType) => void;
  onAddAgent?: () => void;
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
  {
    type: 'api',
    label: 'API Call',
    icon: Globe,
    description: 'REST or GraphQL API endpoint',
  },
  {
    type: 'webhook',
    label: 'Webhook',
    icon: Webhook,
    description: 'HTTP webhook receiver',
  },
  {
    type: 'mcp',
    label: 'MCP Server',
    icon: Server,
    description: 'Model Context Protocol connection',
  },
  {
    type: 'integration',
    label: 'Integration',
    icon: Puzzle,
    description: 'Connect to external service',
  },
];

export function CanvasContextMenu({
  x,
  y,
  onAddNode,
  onAddAgent,
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
      className="fixed z-50 min-w-[220px] bg-popover text-popover-foreground border rounded-lg shadow-lg overflow-hidden"
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
      </div>
    </div>
  );
}
