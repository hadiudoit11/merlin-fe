'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  X,
  Settings,
  Target,
  BarChart3,
  FileText,
  Trash2,
  Plus,
} from 'lucide-react';
import {
  CanvasNode,
  NodeType,
  ObjectiveNodeConfig,
  KeyResultNodeConfig,
  MetricNodeConfig,
  CONTEXTUAL_ADD_OPTIONS,
} from '@/types/canvas';

interface NodeSettingsPanelProps {
  node: CanvasNode | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (nodeId: number, data: Partial<CanvasNode>) => void;
  onDelete: (nodeId: number) => void;
  onAddConnectedNode?: (sourceNodeId: number, nodeType: NodeType) => void;
}

export function NodeSettingsPanel({
  node,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onAddConnectedNode,
}: NodeSettingsPanelProps) {
  const [localName, setLocalName] = useState(node?.name || '');
  const [localContent, setLocalContent] = useState(node?.content || '');

  // Sync local state when node changes
  useEffect(() => {
    if (node) {
      setLocalName(node.name);
      setLocalContent(node.content || '');
    }
  }, [node?.id, node?.name, node?.content]);

  const handleNameChange = useCallback((value: string) => {
    setLocalName(value);
  }, []);

  const handleNameBlur = useCallback(() => {
    if (node && localName !== node.name) {
      onUpdate(node.id, { name: localName });
    }
  }, [node, localName, onUpdate]);

  const handleContentChange = useCallback((value: string) => {
    setLocalContent(value);
  }, []);

  const handleContentBlur = useCallback(() => {
    if (node && localContent !== node.content) {
      onUpdate(node.id, { content: localContent });
    }
  }, [node, localContent, onUpdate]);

  const handleConfigUpdate = useCallback((configUpdates: Record<string, unknown>) => {
    if (node) {
      onUpdate(node.id, {
        config: { ...node.config, ...configUpdates },
      });
    }
  }, [node, onUpdate]);

  const handleDelete = useCallback(() => {
    if (node && confirm('Are you sure you want to delete this node?')) {
      onDelete(node.id);
      onClose();
    }
  }, [node, onDelete, onClose]);

  const addOptions = node ? (CONTEXTUAL_ADD_OPTIONS[node.node_type] || []) : [];

  if (!node) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-[70]"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-[360px] bg-background border-l shadow-xl z-[75] transition-transform duration-200 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">Node Settings</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="p-4 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Basic Info</h3>

              <div className="space-y-2">
                <Label htmlFor="node-name">Name</Label>
                <Input
                  id="node-name"
                  value={localName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onBlur={handleNameBlur}
                  placeholder="Node name..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="node-content">
                  {node.node_type === 'objective' ? 'Objective Statement' :
                   node.node_type === 'keyresult' ? 'Key Result (use [[metric]] to link)' :
                   'Content'}
                </Label>
                <Textarea
                  id="node-content"
                  value={localContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  onBlur={handleContentBlur}
                  placeholder={
                    node.node_type === 'objective' ? 'What do you want to achieve?' :
                    node.node_type === 'keyresult' ? 'Increase [[revenue]] by 20%' :
                    'Enter content...'
                  }
                  rows={3}
                />
                {node.node_type === 'keyresult' && (
                  <p className="text-xs text-muted-foreground">
                    Tip: Wrap metric names in [[double brackets]] to highlight them
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Type-specific settings */}
            {node.node_type === 'objective' && (
              <ObjectiveSettings node={node} onConfigUpdate={handleConfigUpdate} />
            )}

            {node.node_type === 'keyresult' && (
              <KeyResultSettings node={node} onConfigUpdate={handleConfigUpdate} />
            )}

            {node.node_type === 'metric' && (
              <MetricSettings node={node} onConfigUpdate={handleConfigUpdate} />
            )}

            {/* Add Connected Nodes */}
            {addOptions.length > 0 && onAddConnectedNode && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Add Connected</h3>
                  <div className="space-y-2">
                    {addOptions.map((type) => (
                      <Button
                        key={type}
                        variant="outline"
                        className="w-full justify-start gap-2"
                        onClick={() => {
                          onAddConnectedNode(node.id, type);
                          onClose();
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        {type === 'keyresult' ? 'Add Key Result' :
                         type === 'metric' ? 'Add Metric' :
                         `Add ${type}`}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
          <Button
            variant="destructive"
            className="w-full gap-2"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete Node
          </Button>
        </div>
      </div>
    </>
  );
}

// Objective-specific settings
function ObjectiveSettings({
  node,
  onConfigUpdate,
}: {
  node: CanvasNode;
  onConfigUpdate: (config: Record<string, unknown>) => void;
}) {
  const config = node.config as ObjectiveNodeConfig | undefined;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Objective Settings</h3>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={config?.status || 'draft'}
          onValueChange={(value) => onConfigUpdate({ status: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Level</Label>
        <Select
          value={config?.level || 'company'}
          onValueChange={(value) => onConfigUpdate({ level: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="company">Company</SelectItem>
            <SelectItem value="team">Team</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Quarter</Label>
        <Select
          value={config?.timeframe?.quarter || ''}
          onValueChange={(value) => onConfigUpdate({ timeframe: { ...config?.timeframe, quarter: value } })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select quarter..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Q1 2025">Q1 2025</SelectItem>
            <SelectItem value="Q2 2025">Q2 2025</SelectItem>
            <SelectItem value="Q3 2025">Q3 2025</SelectItem>
            <SelectItem value="Q4 2025">Q4 2025</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Owner</Label>
        <Input
          value={config?.owner || ''}
          onChange={(e) => onConfigUpdate({ owner: e.target.value })}
          placeholder="Who owns this objective?"
        />
      </div>
    </div>
  );
}

// Key Result-specific settings
function KeyResultSettings({
  node,
  onConfigUpdate,
}: {
  node: CanvasNode;
  onConfigUpdate: (config: Record<string, unknown>) => void;
}) {
  const config = node.config as KeyResultNodeConfig | undefined;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Key Result Settings</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Start Value</Label>
          <Input
            type="number"
            value={config?.startValue ?? 0}
            onChange={(e) => onConfigUpdate({ startValue: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Target Value</Label>
          <Input
            type="number"
            value={config?.targetValue ?? 100}
            onChange={(e) => onConfigUpdate({ targetValue: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Current Value</Label>
          <Input
            type="number"
            value={config?.currentValue ?? 0}
            onChange={(e) => onConfigUpdate({ currentValue: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Unit</Label>
          <Input
            value={config?.unit || ''}
            onChange={(e) => onConfigUpdate({ unit: e.target.value })}
            placeholder="%, $, users..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={config?.status || 'not_started'}
          onValueChange={(value) => onConfigUpdate({ status: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="on_track">On Track</SelectItem>
            <SelectItem value="at_risk">At Risk</SelectItem>
            <SelectItem value="behind">Behind</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Metric Type</Label>
        <Select
          value={config?.metricType || 'number'}
          onValueChange={(value) => onConfigUpdate({ metricType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="currency">Currency</SelectItem>
            <SelectItem value="boolean">Yes/No</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Metric-specific settings
function MetricSettings({
  node,
  onConfigUpdate,
}: {
  node: CanvasNode;
  onConfigUpdate: (config: Record<string, unknown>) => void;
}) {
  const config = node.config as MetricNodeConfig | undefined;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Metric Settings</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Current Value</Label>
          <Input
            type="number"
            value={config?.value ?? 0}
            onChange={(e) => onConfigUpdate({ value: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Previous Value</Label>
          <Input
            type="number"
            value={config?.previousValue ?? 0}
            onChange={(e) => onConfigUpdate({ previousValue: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Unit</Label>
          <Input
            value={config?.unit || ''}
            onChange={(e) => onConfigUpdate({ unit: e.target.value })}
            placeholder="users, $, %..."
          />
        </div>
        <div className="space-y-2">
          <Label>Format</Label>
          <Select
            value={config?.format || 'number'}
            onValueChange={(value) => onConfigUpdate({ format: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="currency">Currency</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Data Source</Label>
        <Select
          value={config?.source || 'manual'}
          onValueChange={(value) => onConfigUpdate({ source: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual Entry</SelectItem>
            <SelectItem value="api">API Integration</SelectItem>
            <SelectItem value="integration">Third-party Integration</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
