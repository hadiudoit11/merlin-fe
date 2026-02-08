'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Settings,
  ChevronRight,
  Loader2,
  FileText,
  FolderSync,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { integrationsApi } from '@/lib/integrations-api';
import {
  Integration,
  SpaceIntegration,
  ConfluenceSpace,
  ConfluencePage,
  INTEGRATION_PROVIDERS,
} from '@/types/integrations';
import { Space } from '@/types/document';

interface ConfluenceIntegrationProps {
  space: Space;
  onUpdate?: () => void;
}

export function ConfluenceIntegration({ space, onUpdate }: ConfluenceIntegrationProps) {
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [spaceIntegration, setSpaceIntegration] = useState<SpaceIntegration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadIntegration();
  }, [space.id]);

  const loadIntegration = async () => {
    setIsLoading(true);
    try {
      const integrations = await integrationsApi.listIntegrations();
      const confluenceInt = integrations.find(i => i.provider === 'confluence');
      setIntegration(confluenceInt || null);

      if (confluenceInt) {
        const spaceInt = await integrationsApi.getSpaceIntegration(space.id, 'confluence');
        setSpaceIntegration(spaceInt);
      }
    } catch (err) {
      console.error('Failed to load integration:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!spaceIntegration) return;
    if (!confirm('Disconnect from Confluence? This will not delete any pages.')) return;

    try {
      // Pass space.id since the backend expects the space ID, not the integration ID
      await integrationsApi.disconnectSpaceIntegration(space.id);
      setSpaceIntegration(null);
      onUpdate?.();
    } catch (err) {
      console.error('Failed to disconnect:', err);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Not connected to Confluence at org level
  if (!integration) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl">
              📘
            </div>
            <div>
              <CardTitle className="text-base">Confluence</CardTitle>
              <CardDescription>Connect to sync pages with Confluence</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Connect your organization to Confluence to enable syncing between Typequest and Confluence spaces.
          </p>
          <Button onClick={() => setShowConnectDialog(true)}>
            <Link2 className="h-4 w-4 mr-2" />
            Connect Confluence
          </Button>
        </CardContent>

        <ConnectConfluenceDialog
          open={showConnectDialog}
          onOpenChange={setShowConnectDialog}
          onConnected={() => {
            loadIntegration();
            setShowConnectDialog(false);
          }}
        />
      </Card>
    );
  }

  // Connected but not linked to this space
  if (!spaceIntegration) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl">
                📘
              </div>
              <div>
                <CardTitle className="text-base">Confluence</CardTitle>
                <CardDescription>Link this space to a Confluence space</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-emerald-600">
              <Check className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Your organization is connected to Confluence. Link this space to a Confluence space to start syncing.
          </p>
          <Button onClick={() => setShowConnectDialog(true)}>
            <FolderSync className="h-4 w-4 mr-2" />
            Link Confluence Space
          </Button>
        </CardContent>

        <LinkConfluenceSpaceDialog
          open={showConnectDialog}
          onOpenChange={setShowConnectDialog}
          spaceId={space.id}
          integrationId={integration.id}
          onLinked={() => {
            loadIntegration();
            setShowConnectDialog(false);
            onUpdate?.();
          }}
        />
      </Card>
    );
  }

  // Fully connected
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl">
              📘
            </div>
            <div>
              <CardTitle className="text-base">Confluence</CardTitle>
              <CardDescription className="flex items-center gap-2">
                Linked to <span className="font-mono">{spaceIntegration.confluenceSpaceKey}</span>
                <span className="text-muted-foreground">·</span>
                {spaceIntegration.confluenceSpaceName}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-emerald-600">
            <Check className="h-3 w-3 mr-1" />
            Linked
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sync Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div>
            <div className="font-medium text-sm">Sync Status</div>
            <div className="text-xs text-muted-foreground">
              {spaceIntegration.lastSyncAt
                ? `Last synced ${new Date(spaceIntegration.lastSyncAt).toLocaleString()}`
                : 'Never synced'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                spaceIntegration.syncStatus === 'syncing'
                  ? 'secondary'
                  : spaceIntegration.syncStatus === 'error'
                  ? 'destructive'
                  : 'outline'
              }
            >
              {spaceIntegration.syncStatus === 'syncing' && (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              )}
              {spaceIntegration.syncStatus}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportDialog(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isSyncing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Now
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleDisconnect}
          >
            <Link2Off className="h-4 w-4 mr-2" />
            Unlink
          </Button>
        </div>

        {/* Settings */}
        <Separator />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Auto-sync</div>
              <div className="text-xs text-muted-foreground">
                Automatically sync changes
              </div>
            </div>
            <Switch checked={spaceIntegration.syncEnabled} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Sync Direction</div>
              <div className="text-xs text-muted-foreground">
                {spaceIntegration.syncDirection === 'bidirectional'
                  ? 'Two-way sync'
                  : spaceIntegration.syncDirection === 'import'
                  ? 'Import only'
                  : 'Export only'}
              </div>
            </div>
            <Select defaultValue={spaceIntegration.syncDirection}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bidirectional">Two-way</SelectItem>
                <SelectItem value="import">Import only</SelectItem>
                <SelectItem value="export">Export only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>

      <ImportFromConfluenceDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        spaceId={space.id}
        confluenceSpaceKey={spaceIntegration.confluenceSpaceKey!}
        onImported={() => {
          loadIntegration();
          onUpdate?.();
        }}
      />
    </Card>
  );
}

// Connect Confluence Dialog (Org level)
function ConnectConfluenceDialog({
  open,
  onOpenChange,
  onConnected,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: () => void;
}) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      // Get OAuth URL from backend and redirect
      const { authUrl } = await integrationsApi.connectConfluence();

      // Redirect to Atlassian OAuth
      window.location.href = authUrl;
    } catch (err) {
      console.error('Failed to initiate OAuth:', err);
      setError('Failed to connect to Confluence. Please try again.');
      setIsConnecting(false);
    }
  };

  // Check URL for OAuth callback result
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') === 'confluence') {
      onConnected();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('error') === 'confluence_connect_failed') {
      setError('Failed to connect to Confluence. Please try again.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [onConnected]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">📘</span>
            Connect to Confluence
          </DialogTitle>
          <DialogDescription>
            Connect your organization to Atlassian Confluence
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">OAuth Authentication</p>
                <p className="text-blue-700 dark:text-blue-300 mt-1">
                  You'll be redirected to Atlassian to authorize access. After authorization, you'll be returned here automatically.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <X className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4 mr-2" />
                Connect with Atlassian
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Link Confluence Space Dialog
function LinkConfluenceSpaceDialog({
  open,
  onOpenChange,
  spaceId,
  integrationId,
  onLinked,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: string;
  integrationId: string;
  onLinked: () => void;
}) {
  const [confluenceSpaces, setConfluenceSpaces] = useState<ConfluenceSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLinking, setIsLinking] = useState(false);

  useEffect(() => {
    if (open) {
      loadConfluenceSpaces();
    }
  }, [open]);

  const loadConfluenceSpaces = async () => {
    setIsLoading(true);
    try {
      const spaces = await integrationsApi.getConfluenceSpaces();
      setConfluenceSpaces(spaces);
    } catch (err) {
      console.error('Failed to load Confluence spaces:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLink = async () => {
    if (!selectedSpace) return;

    setIsLinking(true);
    try {
      await integrationsApi.connectSpaceToConfluence(spaceId, integrationId, selectedSpace);
      onLinked();
    } catch (err) {
      console.error('Failed to link space:', err);
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link Confluence Space</DialogTitle>
          <DialogDescription>
            Choose a Confluence space to sync with this Typequest space
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              {confluenceSpaces.map(space => (
                <button
                  key={space.id}
                  onClick={() => setSelectedSpace(space.key)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                    selectedSpace === space.key
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30'
                      : 'border-transparent bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <span className="text-xl">{space.icon || '📁'}</span>
                  <div className="flex-1">
                    <div className="font-medium">{space.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{space.key}</div>
                  </div>
                  {selectedSpace === space.key && (
                    <Check className="h-5 w-5 text-violet-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleLink} disabled={!selectedSpace || isLinking}>
            {isLinking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Linking...
              </>
            ) : (
              <>
                <FolderSync className="h-4 w-4 mr-2" />
                Link Space
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Import from Confluence Dialog
function ImportFromConfluenceDialog({
  open,
  onOpenChange,
  spaceId,
  confluenceSpaceKey,
  onImported,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: string;
  confluenceSpaceKey: string;
  onImported: () => void;
}) {
  const [pages, setPages] = useState<ConfluencePage[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);

  useEffect(() => {
    if (open) {
      loadPages();
      setResult(null);
    }
  }, [open, confluenceSpaceKey]);

  const loadPages = async () => {
    setIsLoading(true);
    try {
      const pagesData = await integrationsApi.getConfluencePages(confluenceSpaceKey);
      setPages(pagesData);
    } catch (err) {
      console.error('Failed to load pages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePage = (pageId: string) => {
    setSelectedPages(prev => {
      const next = new Set(prev);
      if (next.has(pageId)) {
        next.delete(pageId);
      } else {
        next.add(pageId);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedPages.size === pages.length) {
      setSelectedPages(new Set());
    } else {
      setSelectedPages(new Set(pages.map(p => p.id)));
    }
  };

  const handleImport = async () => {
    if (selectedPages.size === 0) return;

    setIsImporting(true);
    try {
      const importResult = await integrationsApi.importFromConfluence(
        spaceId,
        Array.from(selectedPages)
      );

      setResult({
        imported: importResult.imported,
        errors: importResult.errors,
      });

      if (importResult.imported > 0) {
        onImported();
      }
    } catch (err) {
      console.error('Failed to import:', err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import from Confluence</DialogTitle>
          <DialogDescription>
            Select pages to import from {confluenceSpaceKey}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {result ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${
                result.errors.length > 0
                  ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200'
                  : 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200'
              }`}>
                <div className="flex items-center gap-2 font-medium">
                  {result.errors.length > 0 ? (
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  ) : (
                    <Check className="h-5 w-5 text-emerald-600" />
                  )}
                  <span>
                    {result.imported} page{result.imported !== 1 ? 's' : ''} imported
                  </span>
                </div>
                {result.errors.length > 0 && (
                  <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                    {result.errors.map((error, i) => (
                      <p key={i}>{error}</p>
                    ))}
                  </div>
                )}
              </div>
              <Button className="w-full" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pages found in this Confluence space
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={selectAll}
                  className="text-sm text-violet-600 hover:text-violet-700"
                >
                  {selectedPages.size === pages.length ? 'Deselect all' : 'Select all'}
                </button>
                <span className="text-sm text-muted-foreground">
                  {selectedPages.size} selected
                </span>
              </div>

              <ScrollArea className="h-64 border rounded-lg">
                <div className="p-2 space-y-1">
                  {pages.map(page => (
                    <button
                      key={page.id}
                      onClick={() => togglePage(page.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                        selectedPages.has(page.id)
                          ? 'bg-violet-50 dark:bg-violet-900/30'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <Checkbox
                        checked={selectedPages.has(page.id)}
                        onCheckedChange={() => togglePage(page.id)}
                      />
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{page.title}</div>
                        <div className="text-xs text-muted-foreground">
                          v{page.version.number}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {!result && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={selectedPages.size === 0 || isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Import {selectedPages.size} Page{selectedPages.size !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
