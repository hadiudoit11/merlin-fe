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
  Loader2,
  Search,
  Check,
  ExternalLink,
} from 'lucide-react';
import {
  CanvasNode,
  NodeType,
  ObjectiveNodeConfig,
  KeyResultNodeConfig,
  MetricNodeConfig,
  SkillNodeConfig,
  CONTEXTUAL_ADD_OPTIONS,
} from '@/types/canvas';
import { skillsApi } from '@/lib/skills-api';
import { SkillProvider, ConfluenceSpace } from '@/types/skills';

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
      {/* Overlay - fixed to viewport */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-[70]"
          onClick={onClose}
        />
      )}

      {/* Panel - fixed to viewport */}
      <div
        className={cn(
          'fixed top-0 right-0 h-screen w-full md:w-[360px] bg-background border-l shadow-xl z-[75] transition-transform duration-200 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">Node Settings</span>
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 md:h-8 md:w-8" onClick={onClose}>
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

            {node.node_type === 'skill' && (
              <SkillSettings node={node} onConfigUpdate={handleConfigUpdate} />
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
            <SelectItem value="api">API Skill</SelectItem>
            <SelectItem value="skill">Third-party Skill</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Skill-specific settings
function SkillSettings({
  node,
  onConfigUpdate,
}: {
  node: CanvasNode;
  onConfigUpdate: (config: Record<string, unknown>) => void;
}) {
  const config = node.config as SkillNodeConfig | undefined;
  const service = config?.service || '';

  // Connection status
  const [isConnected, setIsConnected] = useState(config?.connected ?? false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  // Jira config state
  const [jiraProjects, setJiraProjects] = useState<Array<{ key: string; name: string; avatarUrl?: string }>>([]);
  const [loadingJiraProjects, setLoadingJiraProjects] = useState(false);
  const [jiraIssues, setJiraIssues] = useState<Array<{ key: string; summary: string; status: string; issueType: string }>>([]);
  const [loadingJiraIssues, setLoadingJiraIssues] = useState(false);
  const [jiraFilter, setJiraFilter] = useState<'recent' | 'mine' | 'search'>('recent');
  const [jiraSearchQuery, setJiraSearchQuery] = useState('');

  // Confluence config state
  const [confluenceSpaces, setConfluenceSpaces] = useState<ConfluenceSpace[]>([]);
  const [loadingSpaces, setLoadingSpaces] = useState(false);

  // Derived state from node config
  const selectedProject = config?.jira?.projectKey || null;
  const selectedIssues = config?.jira?.selectedIssues || [];
  const selectedSpaceKeys = config?.confluence?.spaceKeys || [];

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load data when connected and service is known
  useEffect(() => {
    if (!isConnected || isCheckingStatus) return;
    if (service === 'jira') {
      loadJiraProjects();
      loadJiraIssues();
    } else if (service === 'confluence') {
      loadConfluenceSpaces();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, isCheckingStatus, service]);

  // Reload issues when project or filter changes
  useEffect(() => {
    if (isConnected && service === 'jira') {
      loadJiraIssues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject, jiraFilter]);

  // Listen for OAuth callback
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'oauth-callback') {
        checkConnectionStatus();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkConnectionStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const skills = await skillsApi.listSkills();
      const provider = service as SkillProvider;
      const skill = skills.find((s) => s.provider === provider && s.status === 'connected');
      const connected = !!skill;
      setIsConnected(connected);
      if (connected !== config?.connected) {
        onConfigUpdate({ connected });
      }
    } catch {
      // If API fails, fall back to what's in config
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleConnect = async (provider: SkillProvider) => {
    setIsConnecting(true);
    try {
      let authUrl: string | undefined;
      if (provider === 'jira') {
        const result = await skillsApi.connectJira('individual');
        authUrl = result.authUrl;
      } else if (provider === 'confluence') {
        const result = await skillsApi.connectConfluence();
        authUrl = result.authUrl;
      }
      if (authUrl) {
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        const popup = window.open(
          authUrl,
          `${provider}-oauth`,
          `width=${width},height=${height},left=${left},top=${top}`
        );
        const checkPopup = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkPopup);
            checkConnectionStatus();
            setIsConnecting(false);
          }
        }, 500);
        setTimeout(() => {
          clearInterval(checkPopup);
          setIsConnecting(false);
        }, 300000);
      }
    } catch (err) {
      console.error('Failed to connect skill:', err);
      setIsConnecting(false);
    }
  };

  const handleServiceChange = (value: string) => {
    onConfigUpdate({ service: value, jira: undefined, confluence: undefined });
  };

  const handleProjectChange = (projectKey: string) => {
    onConfigUpdate({
      jira: {
        ...config?.jira,
        projectKey: projectKey || undefined,
      },
    });
  };

  const handleToggleIssue = (issueKey: string) => {
    const current = selectedIssues;
    const next = current.includes(issueKey)
      ? current.filter((k) => k !== issueKey)
      : [...current, issueKey];
    onConfigUpdate({
      jira: {
        ...config?.jira,
        selectedIssues: next,
      },
    });
  };

  const handleClearIssues = () => {
    onConfigUpdate({
      jira: {
        ...config?.jira,
        selectedIssues: [],
      },
    });
  };

  const handleToggleSpace = (spaceKey: string) => {
    const current = selectedSpaceKeys;
    const next = current.includes(spaceKey)
      ? current.filter((k) => k !== spaceKey)
      : [...current, spaceKey];
    onConfigUpdate({
      confluence: { spaceKeys: next },
    });
  };

  const loadJiraProjects = async () => {
    setLoadingJiraProjects(true);
    try {
      const projects = await skillsApi.getJiraProjects();
      setJiraProjects(projects);
    } catch {
      // ignore
    } finally {
      setLoadingJiraProjects(false);
    }
  };

  const loadJiraIssues = async () => {
    setLoadingJiraIssues(true);
    try {
      let result;
      if (jiraFilter === 'mine') {
        result = await skillsApi.getMyJiraIssues(15);
      } else if (jiraFilter === 'search' && jiraSearchQuery) {
        result = await skillsApi.searchJiraIssues(jiraSearchQuery, selectedProject || undefined, 15);
      } else {
        result = await skillsApi.searchJiraIssues('', selectedProject || undefined, 15);
      }
      setJiraIssues(result.issues);
    } catch {
      setJiraIssues([]);
    } finally {
      setLoadingJiraIssues(false);
    }
  };

  const handleJiraSearch = () => {
    setJiraFilter('search');
    loadJiraIssues();
  };

  const loadConfluenceSpaces = async () => {
    setLoadingSpaces(true);
    try {
      const spaces = await skillsApi.getConfluenceSpaces();
      setConfluenceSpaces(spaces);
    } catch {
      // ignore
    } finally {
      setLoadingSpaces(false);
    }
  };

  if (isCheckingStatus) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Skill Settings</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          Checking connection...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Skill Settings</h3>

      {/* Service selector */}
      <div className="space-y-2">
        <Label>Service</Label>
        <Select value={service} onValueChange={handleServiceChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a service..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="jira">Jira</SelectItem>
            <SelectItem value="confluence">Confluence</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Connection status + connect button */}
      {service && !isConnected && (
        <div className="rounded-lg border border-dashed border-border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-sm text-muted-foreground">
              {service.charAt(0).toUpperCase() + service.slice(1)} is not connected
            </span>
          </div>
          <Button
            size="sm"
            className="w-full gap-2"
            disabled={isConnecting}
            onClick={() => handleConnect(service as SkillProvider)}
          >
            {isConnecting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ExternalLink className="w-3.5 h-3.5" />
            )}
            Connect {service.charAt(0).toUpperCase() + service.slice(1)}
          </Button>
        </div>
      )}

      {/* Connected: show config */}
      {service && isConnected && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm text-emerald-600 dark:text-emerald-400">Connected</span>
          </div>

          {/* Jira configuration */}
          {service === 'jira' && (
            <div className="space-y-3">
              {/* Project selector */}
              <div className="space-y-1.5">
                <Label className="text-xs">Project</Label>
                {loadingJiraProjects ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading projects...
                  </div>
                ) : (
                  <Select
                    value={selectedProject || '_all'}
                    onValueChange={(v) => handleProjectChange(v === '_all' ? '' : v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_all">All projects</SelectItem>
                      {jiraProjects.map((project) => (
                        <SelectItem key={project.key} value={project.key}>
                          {project.name} ({project.key})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Filter tabs */}
              <div className="flex gap-1 border-b border-border">
                {(['recent', 'mine', 'search'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setJiraFilter(tab)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors',
                      jiraFilter === tab
                        ? 'border-primary text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {tab === 'recent' ? 'Recent' : tab === 'mine' ? 'My Issues' : 'Search'}
                  </button>
                ))}
              </div>

              {/* Search input */}
              {jiraFilter === 'search' && (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      value={jiraSearchQuery}
                      onChange={(e) => setJiraSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleJiraSearch()}
                      placeholder="Search issues..."
                      className="h-8 text-xs pl-7"
                    />
                  </div>
                  <Button size="sm" variant="secondary" className="h-8 text-xs" onClick={handleJiraSearch}>
                    Search
                  </Button>
                </div>
              )}

              {/* Issue list */}
              <div className="space-y-1">
                {loadingJiraIssues ? (
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading issues...
                  </div>
                ) : jiraIssues.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                    {jiraIssues.map((issue) => (
                      <label
                        key={issue.key}
                        className={cn(
                          'flex items-start gap-2 p-2 rounded-md cursor-pointer transition-colors',
                          selectedIssues.includes(issue.key)
                            ? 'bg-primary/10 border border-primary/30'
                            : 'bg-muted/30 border border-transparent hover:bg-muted/50'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIssues.includes(issue.key)}
                          onChange={() => handleToggleIssue(issue.key)}
                          className="mt-0.5 rounded border-border"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">{issue.key}</span>
                            <span className={cn(
                              'text-[10px] px-1.5 py-0.5 rounded',
                              issue.status.toLowerCase().includes('done')
                                ? 'bg-emerald-500/20 text-emerald-600'
                                : issue.status.toLowerCase().includes('progress')
                                ? 'bg-blue-500/20 text-blue-600'
                                : 'bg-muted text-muted-foreground'
                            )}>
                              {issue.status}
                            </span>
                          </div>
                          <p className="text-xs truncate">{issue.summary}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    {jiraFilter === 'search' && !jiraSearchQuery
                      ? 'Enter a search term to find issues'
                      : 'No issues found'}
                  </p>
                )}
              </div>

              {/* Selected count */}
              {selectedIssues.length > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {selectedIssues.length} issue{selectedIssues.length !== 1 ? 's' : ''} selected
                  </span>
                  <button onClick={handleClearIssues} className="text-primary hover:underline">
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Confluence configuration */}
          {service === 'confluence' && (
            <div className="space-y-3">
              <Label className="text-xs">Spaces to track</Label>
              {loadingSpaces ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading spaces...
                </div>
              ) : confluenceSpaces.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {confluenceSpaces.map((space) => (
                    <button
                      key={space.key}
                      onClick={() => handleToggleSpace(space.key)}
                      className={cn(
                        'px-2 py-1 rounded text-xs border transition-all',
                        selectedSpaceKeys.includes(space.key)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted/50 border-border hover:border-primary/50'
                      )}
                    >
                      {selectedSpaceKeys.includes(space.key) && (
                        <Check className="w-3 h-3 inline mr-1" />
                      )}
                      {space.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No spaces found</p>
              )}
              {selectedSpaceKeys.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedSpaceKeys.length} space{selectedSpaceKeys.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
