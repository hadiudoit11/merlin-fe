'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Home,
  Save,
  Undo,
  Redo,
  MousePointer2,
  Hand,
  FileText,
  Bot,
  Target,
  BarChart3,
  Globe,
  Webhook,
  Server,
  Puzzle,
  Plus,
  Search,
  Settings,
  Share2,
  MoreHorizontal,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  Maximize,
  Users,
  MessageSquare,
  HelpCircle,
  Menu,
  X,
  FolderOpen,
  Download,
  Upload,
  Trash2,
  Copy,
  Image,
  Layers,
  Grid3X3,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  LayoutGrid,
  GitBranch,
} from 'lucide-react';
import { NodeType } from '@/types/canvas';
import { colors } from '@/styles/colors';

interface CanvasFloatingToolbarProps {
  canvasName: string;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onSave: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onAddNode: (type: NodeType) => void;
  onAddAgent: () => void;
  onHome: () => void;
  // Menu state control - menu closes on canvas interaction
  isMenuOpen?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
  // Canvas settings
  gridEnabled?: boolean;
  onGridToggle?: () => void;
  snapEnabled?: boolean;
  onSnapToggle?: () => void;
  // Additional actions
  onExport?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  // AI Assistant
  onOpenAssistant?: () => void;
  // MCP Setup
  onOpenMCPSetup?: () => void;
  // Workflow tracker
  onOpenWorkflow?: () => void;
  workflowProjectCount?: number;
  // Auto Layout
  onAutoLayout?: () => void;
  onUndoLayout?: () => void;
  canUndoLayout?: boolean;
}

const NODE_TYPES: Array<{ type: NodeType; label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = [
  { type: 'doc', label: 'Document', icon: FileText, color: 'text-blue-500' },
  { type: 'agent', label: 'AI Agent', icon: Bot, color: 'text-emerald-500' },
  { type: 'problem', label: 'Problem Statement', icon: AlertCircle, color: 'text-rose-500' },
  { type: 'objective', label: 'Objective', icon: Target, color: 'text-yellow-500' },
  { type: 'metric', label: 'Metric', icon: BarChart3, color: 'text-cyan-500' },
  { type: 'api', label: 'API Call', icon: Globe, color: 'text-green-500' },
  { type: 'webhook', label: 'Webhook', icon: Webhook, color: 'text-orange-500' },
  { type: 'mcp', label: 'MCP Server', icon: Server, color: 'text-purple-500' },
  { type: 'skill', label: 'Skill', icon: Puzzle, color: 'text-pink-500' },
];

function ToolbarButton({
  children,
  tooltip,
  active,
  disabled,
  onClick,
  className,
}: {
  children: React.ReactNode;
  tooltip: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8 rounded-lg',
            active && 'bg-accent',
            className
          )}
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

export function CanvasFloatingToolbar({
  canvasName,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onSave,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onAddNode,
  onAddAgent,
  onHome,
  isMenuOpen: controlledMenuOpen,
  onMenuOpenChange,
  gridEnabled = true,
  onGridToggle,
  snapEnabled = true,
  onSnapToggle,
  onExport,
  onDuplicate,
  onDelete,
  onOpenAssistant,
  onOpenMCPSetup,
  onOpenWorkflow,
  workflowProjectCount = 0,
  onAutoLayout,
  onUndoLayout,
  canUndoLayout = false,
}: CanvasFloatingToolbarProps) {
  const [activeTool, setActiveTool] = useState<'select' | 'pan'>('select');
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const isMenuOpen = controlledMenuOpen ?? internalMenuOpen;
  const setMenuOpen = useCallback((open: boolean) => {
    if (onMenuOpenChange) {
      onMenuOpenChange(open);
    } else {
      setInternalMenuOpen(open);
    }
  }, [onMenuOpenChange]);

  const toggleMenu = useCallback(() => {
    setMenuOpen(!isMenuOpen);
  }, [isMenuOpen, setMenuOpen]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, [setMenuOpen]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, closeMenu]);

  return (
    <TooltipProvider delayDuration={0}>
      {/* Slide-out Menu Panel */}
      <div
        className={cn(
          'absolute top-0 left-0 h-full w-64 bg-background border-r shadow-xl z-[60] transition-transform duration-200 ease-out',
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <span className="text-sm font-black text-white">T</span>
            </div>
            <span className="font-semibold">Typequest</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closeMenu}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Canvas Name */}
        <div className="p-4 border-b">
          <div className="text-xs text-muted-foreground mb-1">Current Canvas</div>
          <div className="font-medium truncate">{canvasName}</div>
        </div>

        {/* Canvas-specific Menu Items */}
        <div className="p-2">
          <div className="text-xs text-muted-foreground px-2 py-1 mb-1">Canvas</div>

          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left text-sm"
            onClick={() => { onSave(); closeMenu(); }}
          >
            <Save className="h-4 w-4" />
            <span>Save Canvas</span>
            <span className="ml-auto text-xs text-muted-foreground">Cmd+S</span>
          </button>

          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left text-sm"
            onClick={() => { onExport?.(); closeMenu(); }}
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>

          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left text-sm"
            onClick={() => { onDuplicate?.(); closeMenu(); }}
          >
            <Copy className="h-4 w-4" />
            <span>Duplicate Canvas</span>
          </button>

          <Separator className="my-2" />

          <div className="text-xs text-muted-foreground px-2 py-1 mb-1">View</div>

          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left text-sm"
            onClick={() => { onGridToggle?.(); }}
          >
            <Grid3X3 className="h-4 w-4" />
            <span>Show Grid</span>
            <div className={cn(
              "ml-auto w-4 h-4 rounded border flex items-center justify-center",
              gridEnabled && "bg-primary border-primary"
            )}>
              {gridEnabled && <div className="w-2 h-2 bg-white rounded-sm" />}
            </div>
          </button>

          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left text-sm"
            onClick={() => { onSnapToggle?.(); }}
          >
            <Target className="h-4 w-4" />
            <span>Snap to Grid</span>
            <div className={cn(
              "ml-auto w-4 h-4 rounded border flex items-center justify-center",
              snapEnabled && "bg-primary border-primary"
            )}>
              {snapEnabled && <div className="w-2 h-2 bg-white rounded-sm" />}
            </div>
          </button>

          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left text-sm"
            onClick={() => { onResetZoom(); closeMenu(); }}
          >
            <Maximize className="h-4 w-4" />
            <span>Fit to Screen</span>
          </button>

          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left text-sm"
            onClick={() => { onAutoLayout?.(); closeMenu(); }}
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Auto Layout</span>
            <span className="ml-auto text-xs text-muted-foreground">Cmd+L</span>
          </button>

          {canUndoLayout && (
            <button
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left text-sm"
              onClick={() => { onUndoLayout?.(); closeMenu(); }}
            >
              <Undo className="h-4 w-4" />
              <span>Undo Layout</span>
              <span className="ml-auto text-xs text-muted-foreground">Cmd+Z</span>
            </button>
          )}

          <Separator className="my-2" />

          <div className="text-xs text-muted-foreground px-2 py-1 mb-1">Navigation</div>

          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left text-sm"
            onClick={() => { onHome(); closeMenu(); }}
          >
            <FolderOpen className="h-4 w-4" />
            <span>All Canvases</span>
          </button>

          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left text-sm"
            onClick={() => { closeMenu(); }}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>

        {/* Delete at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-2 border-t">
          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 transition-colors text-left text-sm text-destructive"
            onClick={() => { onDelete?.(); closeMenu(); }}
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Canvas</span>
          </button>
        </div>
      </div>

      {/* Overlay when menu is open */}
      {isMenuOpen && (
        <div
          className="absolute inset-0 bg-black/20 z-[55]"
          onClick={closeMenu}
        />
      )}

      {/* Top Left - Hamburger Menu and Canvas Name */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-10 w-10 rounded-xl bg-background/80 backdrop-blur-sm border shadow-sm hover:bg-background transition-colors",
            isMenuOpen && "bg-accent"
          )}
          onClick={toggleMenu}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2 px-3 py-2 bg-background/80 backdrop-blur-sm border rounded-xl shadow-sm">
          <span className="font-semibold text-sm max-w-[200px] truncate">
            {canvasName}
          </span>
        </div>
      </div>

      {/* Top Center - Main Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-1 px-2 py-1.5 bg-background/80 backdrop-blur-sm border rounded-xl shadow-lg">
          {/* Selection Tools */}
          <ToolbarButton
            tooltip="Select (V)"
            active={activeTool === 'select'}
            onClick={() => setActiveTool('select')}
          >
            <MousePointer2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Pan (H)"
            active={activeTool === 'pan'}
            onClick={() => setActiveTool('pan')}
          >
            <Hand className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Add Node Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 rounded-lg gap-1"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">Add</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
              <div className="space-y-1">
                {NODE_TYPES.map((node) => {
                  const Icon = node.icon;
                  const isAgent = node.type === 'agent';
                  return (
                    <button
                      key={node.type}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left"
                      onClick={() => {
                        if (isAgent) {
                          onAddAgent();
                        } else {
                          onAddNode(node.type);
                        }
                      }}
                    >
                      <Icon className={cn('h-4 w-4', node.color)} />
                      <span className="text-sm">{node.label}</span>
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Undo/Redo */}
          <ToolbarButton
            tooltip="Undo (Cmd+Z)"
            disabled={!canUndo}
            onClick={onUndo}
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Redo (Cmd+Shift+Z)"
            disabled={!canRedo}
            onClick={onRedo}
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Top Right - Actions */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        {/* Workflow Tracker Button */}
        {onOpenWorkflow && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="relative h-10 px-3 rounded-xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-teal-500/30 hover:from-teal-500/20 hover:to-cyan-500/20 gap-2"
                onClick={onOpenWorkflow}
              >
                <GitBranch className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium">Workflow</span>
                {workflowProjectCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-[10px] text-white flex items-center justify-center font-bold">
                    {workflowProjectCount}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span className="text-xs">View workflow stages</span>
            </TooltipContent>
          </Tooltip>
        )}

        {/* MCP Setup Button */}
        {onOpenMCPSetup && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10 w-10 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/30 hover:from-purple-500/20 hover:to-indigo-500/20"
                onClick={onOpenMCPSetup}
              >
                <Server className="h-4 w-4 text-purple-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span className="text-xs">Connect Claude via MCP</span>
            </TooltipContent>
          </Tooltip>
        )}

        {/* AI Assistant Button */}
        {onOpenAssistant && (
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/30 hover:from-violet-500/20 hover:to-purple-500/20 gap-2"
            onClick={onOpenAssistant}
          >
            <Sparkles className="h-4 w-4 text-violet-500" />
            <span className="text-sm font-medium">AI Assistant</span>
          </Button>
        )}

        <div className="flex items-center gap-1 px-2 py-1.5 bg-background/80 backdrop-blur-sm border rounded-xl shadow-sm">
          <ToolbarButton tooltip="Comments">
            <MessageSquare className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton tooltip="Share">
            <Share2 className="h-4 w-4" />
          </ToolbarButton>
          <Button
            variant="default"
            size="sm"
            className="h-8 px-3 rounded-lg ml-1"
            onClick={onSave}
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Bottom Left - Zoom Controls */}
      <div className="absolute bottom-4 left-4 z-50">
        <div className="flex items-center gap-1 px-2 py-1.5 bg-background/80 backdrop-blur-sm border rounded-xl shadow-sm">
          <ToolbarButton tooltip="Zoom out" onClick={onZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </ToolbarButton>
          <button
            className="px-2 py-1 text-sm font-medium hover:bg-accent rounded min-w-[50px] text-center"
            onClick={onResetZoom}
          >
            {Math.round(zoom * 100)}%
          </button>
          <ToolbarButton tooltip="Zoom in" onClick={onZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </ToolbarButton>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <ToolbarButton tooltip="Fit to screen" onClick={onResetZoom}>
            <Maximize className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Bottom Right - Help */}
      <div className="absolute bottom-4 right-4 z-50">
        <div className="flex items-center gap-1 px-2 py-1.5 bg-background/80 backdrop-blur-sm border rounded-xl shadow-sm">
          <ToolbarButton tooltip="Help">
            <HelpCircle className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton tooltip="Settings">
            <Settings className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>
    </TooltipProvider>
  );
}
