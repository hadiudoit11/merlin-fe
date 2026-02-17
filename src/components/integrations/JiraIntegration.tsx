'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Link2,
  Link2Off,
  RefreshCw,
  Download,
  Upload,
  Check,
  X,
  AlertCircle,
  ExternalLink,
  Loader2,
  FileText,
  Search,
  Building2,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { integrationsApi } from '@/lib/integrations-api';
import { JiraConnectionStatus, JiraImportResult, JiraConnectionInfo } from '@/types/integrations';
import { useOrganization } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

interface JiraIntegrationProps {
  onUpdate?: () => void;
}

// Jira logo component
const JiraLogo = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
    <path
      d="M11.5 2C6.25 2 2 6.25 2 11.5C2 16.75 6.25 21 11.5 21C16.75 21 21 16.75 21 11.5C21 6.25 16.75 2 11.5 2Z"
      fill="#2684FF"
    />
    <path d="M11.75 6.5L8.25 10L11.75 13.5V10.5H15.25V9.5H11.75V6.5Z" fill="white" />
    <path d="M11.25 17.5L14.75 14L11.25 10.5V13.5H7.75V14.5H11.25V17.5Z" fill="white" />
  </svg>
);

// Connection row component for org/personal/individual connections
function ConnectionRow({
  type,
  connection,
  isActive,
  onConnect,
  onDisconnect,
  isConnecting,
}: {
  type: 'organization' | 'personal' | 'individual';
  connection?: JiraConnectionInfo;
  isActive: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  isConnecting: boolean;
}) {
  const isConnected = connection?.connected;
  const Icon = type === 'organization' ? Building2 : User;

  const labels: Record<typeof type, { label: string; description: string }> = {
    organization: {
      label: 'Organization',
      description: 'Shared connection for all team members',
    },
    personal: {
      label: 'Personal',
      description: 'Your personal Jira account (overrides org)',
    },
    individual: {
      label: 'My Jira',
      description: 'Connect your personal Jira account',
    },
  };

  const { label, description } = labels[type];

  return (
    <div className={`p-3 rounded-lg border ${isActive ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'bg-muted/30'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-muted'}`}>
            <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-600' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{label}</span>
              {isActive && (
                <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300">
                  Active
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <div className="text-right mr-2">
                <div className="text-sm font-medium">{connection.siteName}</div>
                <div className="text-xs text-muted-foreground">
                  {connection.connectedAt
                    ? new Date(connection.connectedAt).toLocaleDateString()
                    : 'Connected'}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={onDisconnect}
              >
                <Link2Off className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-1" />
                  Connect
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function JiraIntegration({ onUpdate }: JiraIntegrationProps) {
  const [status, setStatus] = useState<JiraConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [connectingScope, setConnectingScope] = useState<'organization' | 'personal' | 'individual' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if user has organization membership
  const { hasOrganization, isLoading: orgLoading } = useOrganization();
  const isIndividualUser = !hasOrganization;
  const { toast } = useToast();

  const loadStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const jiraStatus = await integrationsApi.getJiraStatus();
      setStatus(jiraStatus);
      setError(null);
    } catch (err) {
      console.warn('Failed to load Jira status (backend may be offline):', err);
      setStatus({ connected: false });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();

    // Check for OAuth callback result
    const params = new URLSearchParams(window.location.search);
    const jiraStatus = params.get('jira');
    const scopeParam = params.get('scope');

    if (jiraStatus === 'connected') {
      // Show success toast
      const scopeLabel = scopeParam === 'organization' ? 'Organization' : scopeParam === 'personal' ? 'Personal' : 'Individual';
      toast({
        title: 'JIRA Connected!',
        description: `Successfully connected your ${scopeLabel} JIRA account.`,
        variant: 'default',
      });
      loadStatus();
      window.history.replaceState({}, '', window.location.pathname);
    } else if (jiraStatus === 'error') {
      // Show error toast
      const errorMessage = params.get('message') || 'Failed to connect to JIRA';
      toast({
        title: 'Connection Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [loadStatus, toast]);

  const handleConnect = async (scope: 'organization' | 'personal' | 'individual') => {
    setConnectingScope(scope);
    setError(null);
    try {
      const { authUrl } = await integrationsApi.connectJira(scope);
      window.location.href = authUrl;
    } catch (err: unknown) {
      console.error('Failed to initiate Jira OAuth:', err);
      const axiosError = err as { response?: { status?: number } };
      if (axiosError.response?.status === 404 || axiosError.response?.status === 503) {
        setError('Jira integration is not configured on the server. Contact your administrator.');
      } else {
        setError('Failed to connect to Jira. Please ensure the backend is running.');
      }
      setConnectingScope(null);
    }
  };

  const handleDisconnect = async (scope: 'organization' | 'personal' | 'individual') => {
    const labels: Record<typeof scope, string> = {
      organization: 'organization',
      personal: 'personal',
      individual: 'Jira',
    };
    if (!confirm(`Disconnect ${labels[scope]} connection?`)) return;

    try {
      await integrationsApi.disconnectJira(scope);
      toast({
        title: 'Disconnected',
        description: `Successfully disconnected your ${labels[scope]} JIRA connection.`,
        variant: 'default',
      });
      await loadStatus();
      onUpdate?.();
    } catch (err) {
      console.error('Failed to disconnect Jira:', err);
      toast({
        title: 'Disconnect Failed',
        description: 'Failed to disconnect JIRA. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading || orgLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // For individual users, check personal connection (used for individual scope)
  // For org users, check both organization and personal connections
  const hasAnyConnection = isIndividualUser
    ? status?.personal?.connected
    : status?.organization?.connected || status?.personal?.connected;

  // No connections at all - show simple connect UI
  if (!hasAnyConnection) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <JiraLogo />
            </div>
            <div>
              <CardTitle className="text-base">Jira</CardTitle>
              <CardDescription>Sync tasks with Jira issues</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect to Jira to sync tasks with issues, import via JQL, and receive webhook updates.
          </p>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {isIndividualUser ? (
              // Individual user - single connect option
              <ConnectionRow
                type="individual"
                connection={status?.personal}
                isActive={false}
                onConnect={() => handleConnect('individual')}
                onDisconnect={() => handleDisconnect('individual')}
                isConnecting={connectingScope === 'individual'}
              />
            ) : (
              // Organization member - org and personal options
              <>
                <ConnectionRow
                  type="organization"
                  connection={status?.organization}
                  isActive={false}
                  onConnect={() => handleConnect('organization')}
                  onDisconnect={() => handleDisconnect('organization')}
                  isConnecting={connectingScope === 'organization'}
                />
                <ConnectionRow
                  type="personal"
                  connection={status?.personal}
                  isActive={false}
                  onConnect={() => handleConnect('personal')}
                  onDisconnect={() => handleDisconnect('personal')}
                  isConnecting={connectingScope === 'personal'}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // At least one connection exists - show full management UI
  const activeSite = isIndividualUser
    ? status?.personal?.siteName
    : status?.activeScope === 'personal'
      ? status?.personal?.siteName
      : status?.organization?.siteName;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <JiraLogo />
            </div>
            <div>
              <CardTitle className="text-base">Jira</CardTitle>
              <CardDescription className="flex items-center gap-2">
                Connected to <span className="font-medium">{activeSite}</span>
                {!isIndividualUser && status?.activeScope && (
                  <Badge variant="secondary" className="text-xs">
                    {status.activeScope === 'personal' ? 'Personal' : 'Org'}
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-emerald-600">
            <Check className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Management */}
        <div className="space-y-3">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">
            {isIndividualUser ? 'Connection' : 'Connections'}
          </Label>
          {isIndividualUser ? (
            // Individual user - single connection row
            <ConnectionRow
              type="individual"
              connection={status?.personal}
              isActive={true}
              onConnect={() => handleConnect('individual')}
              onDisconnect={() => handleDisconnect('individual')}
              isConnecting={connectingScope === 'individual'}
            />
          ) : (
            // Organization member - org and personal options
            <>
              <ConnectionRow
                type="organization"
                connection={status?.organization}
                isActive={status?.activeScope === 'organization'}
                onConnect={() => handleConnect('organization')}
                onDisconnect={() => handleDisconnect('organization')}
                isConnecting={connectingScope === 'organization'}
              />
              <ConnectionRow
                type="personal"
                connection={status?.personal}
                isActive={status?.activeScope === 'personal'}
                onConnect={() => handleConnect('personal')}
                onDisconnect={() => handleDisconnect('personal')}
                isConnecting={connectingScope === 'personal'}
              />
              {status?.personal?.connected && status?.organization?.connected && (
                <p className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-200 dark:border-amber-800">
                  Personal connection is active and overrides the organization connection.
                </p>
              )}
            </>
          )}
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportDialog(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Import Issues
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://${activeSite}.atlassian.net`, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Jira
          </Button>
        </div>

        <Separator />

        {/* Features */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Download className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Import</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Import issues using JQL queries
            </p>
          </div>
          <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Push</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Create Jira issues from tasks
            </p>
          </div>
          <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Sync</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Auto-sync status changes
            </p>
          </div>
          <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Webhooks</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time updates from Jira
            </p>
          </div>
        </div>
      </CardContent>

      <JiraImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImported={() => {
          onUpdate?.();
        }}
      />
    </Card>
  );
}

// Import Dialog
function JiraImportDialog({
  open,
  onOpenChange,
  onImported,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}) {
  const [jql, setJql] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<JiraImportResult | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  const presets = [
    { label: 'My open issues', value: 'assignee = currentUser() AND status != Done' },
    { label: 'Recently updated', value: 'updated >= -7d ORDER BY updated DESC' },
    { label: 'High priority', value: 'priority in (High, Highest) AND status != Done' },
    { label: 'Custom JQL', value: '' },
  ];

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    if (value !== '') {
      setJql(value);
    }
  };

  const handleImport = async () => {
    if (!jql.trim()) return;

    setIsImporting(true);
    setResult(null);

    try {
      const importResult = await integrationsApi.importFromJira({ jql: jql.trim() });
      setResult(importResult);

      if (importResult.imported > 0) {
        onImported();
      }
    } catch (err) {
      console.error('Import failed:', err);
      setResult({
        status: 'error',
        message: 'Import failed. Please check your JQL query.',
        imported: 0,
        updated: 0,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setJql('');
    setResult(null);
    setSelectedPreset('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Import from Jira
          </DialogTitle>
          <DialogDescription>
            Import issues using a JQL query
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {result ? (
            <div className={`p-4 rounded-lg ${
              result.status === 'completed'
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200'
            }`}>
              <div className="flex items-center gap-2 font-medium">
                {result.status === 'completed' ? (
                  <Check className="h-5 w-5 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span>{result.message}</span>
              </div>
              {result.imported > 0 && (
                <p className="text-sm mt-2 text-muted-foreground">
                  Imported {result.imported} issue{result.imported !== 1 ? 's' : ''}
                  {result.updated > 0 && `, updated ${result.updated}`}
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Quick select</Label>
                <Select value={selectedPreset} onValueChange={handlePresetChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a preset or enter custom JQL" />
                  </SelectTrigger>
                  <SelectContent>
                    {presets.map((preset) => (
                      <SelectItem key={preset.label} value={preset.value || 'custom'}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jql">JQL Query</Label>
                <Input
                  id="jql"
                  value={jql}
                  onChange={(e) => setJql(e.target.value)}
                  placeholder="project = PROJ AND status != Done"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Use JQL to filter which issues to import.{' '}
                  <a
                    href="https://support.atlassian.com/jira-software-cloud/docs/use-advanced-search-with-jira-query-language-jql/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Learn JQL syntax
                  </a>
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {result ? (
            <Button onClick={handleClose}>Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!jql.trim() || isImporting}>
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Import Issues
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
