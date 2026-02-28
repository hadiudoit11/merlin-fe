'use client';

import React, { useCallback, useState, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { CanvasNode as CanvasNodeType, NodeType, CONTEXTUAL_ADD_OPTIONS, AnchorPosition } from '@/types/canvas';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Webhook,
  Globe,
  Server,
  Target,
  BarChart3,
  Puzzle,
  GripVertical,
  MoreVertical,
  Trash2,
  Lock,
  Unlock,
  Maximize2,
  Minimize2,
  Bot,
  FileCode,
  BookOpen,
  Slack,
  ChevronRight,
  ChevronLeft,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AgentNodeConfig, SkillType } from '@/types/canvas';
import { colors } from '@/styles/colors';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';

interface CanvasNodeProps {
  node: CanvasNodeType;
  isSelected: boolean;
  isConnecting: boolean;
  zoom?: number;
  connectedAnchors?: AnchorPosition[]; // Which anchors have connections
  onSelect: (nodeId: number, additive?: boolean) => void;
  onUpdate: (nodeId: number, data: Partial<CanvasNodeType>) => void;
  onResize: (nodeId: number, width: number, height: number) => void;
  onConnectionStart: (nodeId: number, anchor: AnchorPosition) => void;
  onConnectionEnd: (nodeId: number, anchor: AnchorPosition) => void;
  onDoubleClick?: (nodeId: number) => void;
  onAddConnectedNode?: (sourceNodeId: number, nodeType: NodeType) => void;
}

// Anchor position styles
const ANCHOR_POSITIONS: Record<AnchorPosition, string> = {
  'top': 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
  'bottom': 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
  'left': 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2',
  'right': 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2',
  'top-left': 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
  'top-right': 'top-0 right-0 translate-x-1/2 -translate-y-1/2',
  'bottom-left': 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
  'bottom-right': 'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
};

const NODE_ICONS: Record<NodeType, React.ComponentType<{ className?: string }>> = {
  doc: FileText,
  agent: Bot,
  webhook: Webhook,
  api: Globe,
  mcp: Server,
  problem: AlertCircle,
  objective: Target,
  keyresult: BarChart3,
  metric: BarChart3,
  skill: Puzzle,
  custom: Puzzle,
};

// Brand-aligned node border colors
const NODE_BORDER_COLORS: Record<NodeType, string> = {
  doc: colors.node.doc.border,
  agent: colors.node.agent.border,
  webhook: colors.node.webhook.border,
  api: colors.node.api.border,
  mcp: colors.node.mcp.border,
  problem: colors.node.problem.border,
  objective: colors.node.objective.border,
  keyresult: colors.node.keyresult.border,
  metric: colors.node.metric.border,
  skill: colors.node.skill.border,
  custom: colors.node.custom.border,
};

// Brand-aligned node badge styles
const NODE_BADGE_STYLES: Record<NodeType, { bg: string; text: string }> = {
  doc: { bg: colors.node.doc.bg, text: colors.node.doc.text },
  agent: { bg: colors.node.agent.bg, text: colors.node.agent.text },
  webhook: { bg: colors.node.webhook.bg, text: colors.node.webhook.text },
  api: { bg: colors.node.api.bg, text: colors.node.api.text },
  mcp: { bg: colors.node.mcp.bg, text: colors.node.mcp.text },
  problem: { bg: colors.node.problem.bg, text: colors.node.problem.text },
  objective: { bg: colors.node.objective.bg, text: colors.node.objective.text },
  keyresult: { bg: colors.node.keyresult.bg, text: colors.node.keyresult.text },
  metric: { bg: colors.node.metric.bg, text: colors.node.metric.text },
  skill: { bg: colors.node.skill.bg, text: colors.node.skill.text },
  custom: { bg: colors.node.custom.bg, text: colors.node.custom.text },
};

export function CanvasNode({
  node,
  isSelected,
  isConnecting,
  zoom = 1,
  connectedAnchors = [],
  onSelect,
  onUpdate,
  onResize,
  onConnectionStart,
  onConnectionEnd,
  onDoubleClick,
  onAddConnectedNode,
}: CanvasNodeProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const resizeStartRef = useRef({ width: 0, height: 0, mouseX: 0, mouseY: 0 });

  // Get contextual add options for this node type
  const addOptions = CONTEXTUAL_ADD_OPTIONS[node.node_type] || [];

  // All 8 anchor positions
  const allAnchors: AnchorPosition[] = ['top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: node.id,
    disabled: node.is_locked || isResizing,
  });

  const Icon = NODE_ICONS[node.node_type as NodeType] || Puzzle;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isConnecting) {
        onConnectionEnd(node.id);
      } else {
        onSelect(node.id, e.shiftKey || e.metaKey);
      }
    },
    [node.id, isConnecting, onSelect, onConnectionEnd]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // Double-click opens settings panel (or doc editor for docs)
      if (onDoubleClick) {
        onDoubleClick(node.id);
      }
    },
    [node.id, onDoubleClick]
  );

  const handleAnchorMouseDown = useCallback(
    (e: React.MouseEvent, anchor: AnchorPosition) => {
      e.stopPropagation();
      e.preventDefault();
      onConnectionStart(node.id, anchor);
    },
    [node.id, onConnectionStart]
  );

  const handleAnchorMouseUp = useCallback(
    (e: React.MouseEvent, anchor: AnchorPosition) => {
      e.stopPropagation();
      e.preventDefault();
      // If we're in connecting mode, complete the connection
      if (isConnecting) {
        onConnectionEnd(node.id, anchor);
      }
    },
    [node.id, isConnecting, onConnectionEnd]
  );

  // Also handle mouseup on the entire node card when connecting
  const handleNodeMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (isConnecting) {
        e.stopPropagation();
        onConnectionEnd(node.id);
      }
    },
    [node.id, isConnecting, onConnectionEnd]
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setIsResizing(true);
      resizeStartRef.current = {
        width: node.width,
        height: node.height,
        mouseX: e.clientX,
        mouseY: e.clientY,
      };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        // Account for zoom level when calculating resize delta
        const deltaX = (moveEvent.clientX - resizeStartRef.current.mouseX) / zoom;
        const deltaY = (moveEvent.clientY - resizeStartRef.current.mouseY) / zoom;
        const newWidth = Math.max(200, resizeStartRef.current.width + deltaX);
        const newHeight = Math.max(100, resizeStartRef.current.height + deltaY);
        onResize(node.id, newWidth, newHeight);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [node.id, node.width, node.height, onResize, zoom]
  );

  const handleToggleLock = useCallback(() => {
    onUpdate(node.id, { is_locked: !node.is_locked });
  }, [node.id, node.is_locked, onUpdate]);

  const handleToggleCollapse = useCallback(() => {
    onUpdate(node.id, { is_collapsed: !node.is_collapsed });
  }, [node.id, node.is_collapsed, onUpdate]);

  const borderColor = NODE_BORDER_COLORS[node.node_type as NodeType] || colors.node.custom.border;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: node.position_x,
    top: node.position_y,
    width: node.width,
    height: node.is_collapsed ? 'auto' : node.height,
    transform: CSS.Transform.toString(transform),
    zIndex: isDragging ? 1000 : node.z_index,
    borderColor: `${borderColor}80`, // 50% opacity
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'shadow-lg transition-shadow cursor-pointer select-none bg-card border-2 group',
        isSelected && 'ring-2 ring-primary ring-offset-2',
        isDragging && 'opacity-80 shadow-2xl',
        isConnecting && 'ring-2 ring-green-500/50 cursor-crosshair',
        isResizing && 'pointer-events-none'
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseUp={handleNodeMouseUp}
    >
      {/* Header - entire header is draggable */}
      <CardHeader
        {...attributes}
        {...listeners}
        className={cn(
          'p-2 pb-1 flex flex-row items-center justify-between space-y-0',
          !node.is_locked && 'cursor-grab active:cursor-grabbing',
          node.is_locked && 'cursor-not-allowed'
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Drag indicator */}
          <GripVertical className={cn(
            'h-4 w-4 text-muted-foreground flex-shrink-0',
            node.is_locked && 'opacity-50'
          )} />

          {/* Node type badge */}
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0"
            style={{
              backgroundColor: NODE_BADGE_STYLES[node.node_type as NodeType]?.bg || colors.node.custom.bg,
              color: NODE_BADGE_STYLES[node.node_type as NodeType]?.text || colors.node.custom.text,
            }}
          >
            <Icon className="h-3 w-3" />
            <span className="uppercase">{node.node_type === 'keyresult' ? 'KEY RESULT' : node.node_type === 'problem' ? 'PROBLEM' : node.node_type}</span>
          </div>

          {/* Node title */}
          <span className="text-sm font-semibold truncate">{node.name}</span>
        </div>

        {/* Actions menu - stop propagation to prevent drag */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleToggleLock}>
              {node.is_locked ? (
                <>
                  <Unlock className="h-4 w-4 mr-2" />
                  Unlock
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Lock
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleCollapse}>
              {node.is_collapsed ? (
                <>
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Expand
                </>
              ) : (
                <>
                  <Minimize2 className="h-4 w-4 mr-2" />
                  Collapse
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      {/* Content */}
      {!node.is_collapsed && (
        <CardContent className="p-2 pt-0 overflow-hidden" style={{ height: `calc(100% - 40px)` }}>
          <NodeContent node={node} onUpdate={onUpdate} />
        </CardContent>
      )}

      {/* 8 Anchor points - visible on node hover, always visible if connected */}
      {allAnchors.map((anchor) => {
        const isConnected = connectedAnchors.includes(anchor);

        return (
          <div
            key={anchor}
            className={cn(
              "absolute w-4 h-4 rounded-full cursor-crosshair transition-all border-2 border-background z-10",
              ANCHOR_POSITIONS[anchor],
              // Always visible if connected, otherwise show on group hover or when connecting
              isConnected
                ? "opacity-100 scale-100 bg-primary"
                : "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 bg-muted-foreground hover:bg-primary hover:scale-125",
              // Highlight all anchors when in connecting mode
              isConnecting && !isConnected && "opacity-100 scale-100 bg-green-500 animate-pulse",
            )}
            onMouseDown={(e) => handleAnchorMouseDown(e, anchor)}
            onMouseUp={(e) => handleAnchorMouseUp(e, anchor)}
          />
        );
      })}

      {/* Add menu button - only on right side for nodes with contextual add options */}
      {addOptions.length > 0 && onAddConnectedNode && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className={cn(
                "absolute -right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full cursor-pointer transition-all border border-background flex items-center justify-center",
                "opacity-0 group-hover:opacity-100 hover:scale-125",
                "bg-primary hover:bg-primary/80"
              )}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Plus className="h-3 w-3 text-white" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent align="start" side="right" className="z-[200]">
              {addOptions.map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => onAddConnectedNode(node.id, type)}
                >
                  {type === 'objective' ? 'Add Objective' :
                   type === 'keyresult' ? 'Add Key Result' :
                   type === 'metric' ? 'Add Metric' :
                   type === 'doc' ? 'Add Document' :
                   `Add ${type}`}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      )}

      {/* Resize handle */}
      {!node.is_collapsed && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={handleResizeStart}
        >
          <svg className="w-full h-full text-muted-foreground" viewBox="0 0 16 16">
            <path d="M14 14H10M14 14V10M14 14L10 10" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      )}
    </Card>
  );
}

// Node content renderer based on type
function NodeContent({
  node,
  onUpdate,
}: {
  node: CanvasNodeType;
  onUpdate: (nodeId: number, data: Partial<CanvasNodeType>) => void;
}) {
  const handleContentChange = useCallback(
    (content: string) => {
      onUpdate(node.id, { content });
    },
    [node.id, onUpdate]
  );

  // Helper to strip HTML and get plain text preview
  const getTextPreview = (html: string, maxLength = 150) => {
    if (!html) return '';
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  switch (node.node_type) {
    case 'doc':
      const preview = getTextPreview(node.content || '');
      return (
        <div className="h-full flex flex-col">
          {/* Document preview */}
          <div className="flex-1 overflow-hidden">
            {preview ? (
              <p className="text-sm text-muted-foreground line-clamp-4">
                {preview}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground/60 italic">
                Empty document
              </p>
            )}
          </div>
          {/* Double-click hint */}
          <div className="mt-2 pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground/60 text-center">
              Double-click to edit
            </p>
          </div>
        </div>
      );

    case 'agent':
      return <AgentNodeContent node={node} />;

    case 'objective':
      return <ObjectiveNodeContent node={node} />;

    case 'keyresult':
      return <KeyResultNodeContent node={node} />;

    case 'metric':
      return <MetricNodeContent node={node} />;

    case 'webhook':
    case 'api':
      return <ApiNodeContent node={node} />;

    case 'mcp':
      return <McpNodeContent node={node} />;

    case 'skill':
      return <SkillNodeContent node={node} />;

    default:
      return (
        <div className="text-sm text-muted-foreground p-2">
          {node.content || 'No content'}
        </div>
      );
  }
}

// Placeholder content components for different node types
function ObjectiveNodeContent({ node }: { node: CanvasNodeType }) {
  const config = node.config as { status?: string; level?: string; timeframe?: { quarter?: string } };
  return (
    <div className="h-full flex flex-col space-y-2">
      {/* Objective text */}
      <div className="flex-1">
        <p className="text-sm text-foreground line-clamp-3">
          {node.content || 'Define your objective...'}
        </p>
      </div>
      {/* Status and metadata */}
      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
        <Badge variant="outline" className="text-[10px] bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
          {config.level || 'Company'}
        </Badge>
        {config.timeframe?.quarter && (
          <span className="text-[10px] text-muted-foreground">{config.timeframe.quarter}</span>
        )}
        <span className={cn(
          "ml-auto text-[10px] px-1.5 py-0.5 rounded",
          config.status === 'active' && "bg-green-500/20 text-green-600",
          config.status === 'completed' && "bg-blue-500/20 text-blue-600",
          (!config.status || config.status === 'draft') && "bg-gray-500/20 text-gray-600"
        )}>
          {config.status || 'Draft'}
        </span>
      </div>
    </div>
  );
}

function KeyResultNodeContent({ node }: { node: CanvasNodeType }) {
  const config = node.config as {
    targetValue?: number;
    currentValue?: number;
    unit?: string;
    status?: string;
    linkedMetricName?: string;
  };
  const progress = config.targetValue ? Math.round(((config.currentValue || 0) / config.targetValue) * 100) : 0;

  // Parse content to highlight metric references (text in [[brackets]])
  const renderContentWithMetrics = (content: string) => {
    if (!content) return <span className="text-muted-foreground italic">Define your key result...</span>;

    const parts = content.split(/(\[\[[^\]]+\]\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const metricName = part.slice(2, -2);
        return (
          <span key={i} className="text-cyan-500 font-medium bg-cyan-500/10 px-1 rounded">
            {metricName}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="h-full flex flex-col space-y-2">
      {/* Key result text with metric highlighting */}
      <div className="flex-1">
        <p className="text-sm line-clamp-2">
          {renderContentWithMetrics(node.content || '')}
        </p>
      </div>
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">
            {config.currentValue ?? 0} / {config.targetValue ?? 100} {config.unit || ''}
          </span>
          <span className={cn(
            "font-medium",
            progress >= 70 && "text-green-500",
            progress >= 40 && progress < 70 && "text-yellow-500",
            progress < 40 && "text-red-500"
          )}>
            {progress}%
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              progress >= 70 && "bg-green-500",
              progress >= 40 && progress < 70 && "bg-yellow-500",
              progress < 40 && "bg-red-500"
            )}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>
      {/* Linked metric */}
      {config.linkedMetricName && (
        <div className="flex items-center gap-1 text-[10px] text-cyan-500">
          <BarChart3 className="h-3 w-3" />
          <span>{config.linkedMetricName}</span>
        </div>
      )}
    </div>
  );
}

function MetricNodeContent({ node }: { node: CanvasNodeType }) {
  const config = node.config as {
    value?: number;
    previousValue?: number;
    unit?: string;
    format?: string;
    trend?: 'up' | 'down' | 'stable';
  };

  const formatValue = (val: number | undefined) => {
    if (val === undefined) return '--';
    if (config.format === 'percentage') return `${val}%`;
    if (config.format === 'currency') return `$${val.toLocaleString()}`;
    return val.toLocaleString();
  };

  const change = config.previousValue !== undefined && config.value !== undefined
    ? config.value - config.previousValue
    : null;

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-3xl font-bold">{formatValue(config.value)}</div>
      <div className="text-sm text-muted-foreground">{config.unit || ''}</div>
      {change !== null && (
        <div className={cn(
          "text-xs mt-1 flex items-center gap-1",
          change > 0 && "text-green-500",
          change < 0 && "text-red-500",
          change === 0 && "text-muted-foreground"
        )}>
          {change > 0 ? '↑' : change < 0 ? '↓' : '→'}
          {Math.abs(change).toLocaleString()}
        </div>
      )}
    </div>
  );
}

function ApiNodeContent({ node }: { node: CanvasNodeType }) {
  const config = node.config as { method?: string; url?: string };
  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 bg-green-500/20 text-green-500 rounded text-xs font-mono">
          {config.method || 'GET'}
        </span>
        <span className="truncate text-muted-foreground font-mono text-xs">
          {config.url || 'https://...'}
        </span>
      </div>
    </div>
  );
}

function McpNodeContent({ node }: { node: CanvasNodeType }) {
  const config = node.config as { serverUrl?: string; protocol?: string };
  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-500 rounded text-xs">
          {config.protocol || 'stdio'}
        </span>
      </div>
      <div className="text-xs text-muted-foreground font-mono truncate">
        {config.serverUrl || 'Configure server...'}
      </div>
    </div>
  );
}

function SkillNodeContent({ node }: { node: CanvasNodeType }) {
  const config = node.config as {
    service?: string;
    connected?: boolean;
    jira?: { projectKey?: string; selectedIssues?: string[] };
    confluence?: { spaceKeys?: string[] };
  };

  const service = config.service;
  const issueCount = config.jira?.selectedIssues?.length || 0;
  const spaceCount = config.confluence?.spaceKeys?.length || 0;

  const serviceIcon = service === 'jira' ? (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
      <path d="M11.5 2C6.25 2 2 6.25 2 11.5C2 16.75 6.25 21 11.5 21C16.75 21 21 16.75 21 11.5C21 6.25 16.75 2 11.5 2Z" fill="#2684FF" />
      <path d="M11.75 6.5L8.25 10L11.75 13.5V10.5H15.25V9.5H11.75V6.5Z" fill="white" />
      <path d="M11.25 17.5L14.75 14L11.25 10.5V13.5H7.75V14.5H11.25V17.5Z" fill="white" />
    </svg>
  ) : service === 'confluence' ? (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
      <path d="M3 12.5C3 12.5 4.5 10 7 10C9.5 10 11 12.5 11 12.5C11 12.5 12.5 15 15 15C17.5 15 19 12.5 19 12.5L21 14C21 14 18.5 18 15 18C11.5 18 9 14 9 14C9 14 6.5 10 4 10L3 12.5Z" fill="#2684FF" />
      <path d="M21 11.5C21 11.5 19.5 14 17 14C14.5 14 13 11.5 13 11.5C13 11.5 11.5 9 9 9C6.5 9 5 11.5 5 11.5L3 10C3 10 5.5 6 9 6C12.5 6 15 10 15 10C15 10 17.5 14 20 14L21 11.5Z" fill="#2684FF" />
    </svg>
  ) : null;

  // Build summary line
  let summary = '';
  if (service === 'jira') {
    const parts: string[] = [];
    if (config.jira?.projectKey) parts.push(config.jira.projectKey);
    if (issueCount > 0) parts.push(`${issueCount} issue${issueCount !== 1 ? 's' : ''}`);
    summary = parts.join(' \u00B7 ');
  } else if (service === 'confluence') {
    if (spaceCount > 0) summary = `${spaceCount} space${spaceCount !== 1 ? 's' : ''}`;
  }

  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2">
        {serviceIcon || (
          <span className={cn(
            'w-2 h-2 rounded-full shrink-0',
            config.connected ? 'bg-green-500' : 'bg-yellow-500'
          )} />
        )}
        <span className="font-medium">
          {service ? service.charAt(0).toUpperCase() + service.slice(1) : 'Not configured'}
        </span>
        <span className={cn(
          'w-2 h-2 rounded-full shrink-0 ml-auto',
          config.connected ? 'bg-green-500' : 'bg-yellow-500'
        )} />
      </div>
      {summary && (
        <p className="text-xs text-muted-foreground">{summary}</p>
      )}
      {service && !config.connected && (
        <p className="text-[10px] text-muted-foreground/60 italic">Double-click to connect</p>
      )}
    </div>
  );
}

function AgentNodeContent({ node }: { node: CanvasNodeType }) {
  const config = node.config as AgentNodeConfig | undefined;

  const getSkillIcon = (type: SkillType) => {
    switch (type) {
      case 'slack':
        return <Slack className="h-3 w-3" />;
      case 'jira':
        return <FileCode className="h-3 w-3" />;
      case 'confluence':
        return <BookOpen className="h-3 w-3" />;
      default:
        return <Puzzle className="h-3 w-3" />;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-2">
      {/* Instructions preview */}
      {config?.instructions && (
        <div className="flex-1 overflow-hidden">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {config.instructions}
          </p>
        </div>
      )}

      {/* Context info */}
      <div className="space-y-1.5">
        {config?.contextType === 'documents' && config.documents && config.documents.length > 0 && (
          <div className="flex items-center gap-1.5">
            <FileText className="h-3 w-3 text-blue-500" />
            <span className="text-xs text-muted-foreground">
              {config.documents.length} document{config.documents.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {config?.contextType === 'skills' && config.skills && config.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {config.skills.map((skill) => (
              <Badge
                key={skill.type}
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-5 gap-1"
              >
                {getSkillIcon(skill.type)}
                {skill.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Status indicator */}
      <div className="pt-1 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-muted-foreground">Ready</span>
        </div>
      </div>
    </div>
  );
}
