'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Link2,
  Unlink,
  Plus,
  Check,
  X,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { integrationsApi } from '@/lib/integrations-api';
import { useToast } from '@/components/ui/use-toast';

interface JiraConnectionsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canvasId: number;
  nodeId?: number; // If managing connections for a specific node
  nodeTitle?: string;
}

interface JiraTask {
  id: number;
  source_id: string; // PROJ-123
  title: string;
  description?: string;
  status: string;
  priority: string;
  source_url?: string;
  assignee_name?: string;
  canvas_id?: number;
  is_linked?: boolean; // If nodeId provided, whether it's linked to that node
}

export function JiraConnectionsManager({
  open,
  onOpenChange,
  canvasId,
  nodeId,
  nodeTitle,
}: JiraConnectionsManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssues, setSelectedIssues] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all Jira issues in the system (or on this canvas)
  const { data: allJiraIssues, isLoading: loadingAll } = useQuery({
    queryKey: ['jira-tasks', canvasId],
    queryFn: async () => {
      // Get all Jira tasks on this canvas
      const tasks = await api.getTasks({
        canvas_id: canvasId,
        source: 'jira',
      });
      return tasks as JiraTask[];
    },
    enabled: open,
  });

  // Fetch issues currently linked to this canvas/node
  const { data: linkedIssues, isLoading: loadingLinked } = useQuery({
    queryKey: ['linked-jira', nodeId || canvasId],
    queryFn: async () => {
      if (nodeId) {
        // Get issues linked to specific node
        const tasks = await api.getTasks({
          linked_node_id: nodeId,
          source: 'jira',
        });
        return tasks as JiraTask[];
      } else {
        // Get all issues on this canvas
        const tasks = await api.getTasks({
          canvas_id: canvasId,
          source: 'jira',
        });
        return tasks as JiraTask[];
      }
    },
    enabled: open,
  });

  // Fetch suggested issues (if we have search query)
  const { data: suggestedIssues } = useQuery({
    queryKey: ['jira-suggestions', searchQuery, canvasId],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 3) return [];

      const result = await integrationsApi.searchJiraContext({
        query: searchQuery,
        canvasId,
        topK: 20,
      });

      return result.issues.map((issue: any) => ({
        id: issue.task_id,
        source_id: issue.issue_key,
        title: issue.title,
        description: issue.description,
        status: issue.status,
        priority: issue.priority,
        source_url: issue.source_url,
        assignee_name: issue.assignee_name,
        score: issue.score,
      }));
    },
    enabled: open && searchQuery.length >= 3,
  });

  // Link mutation
  const linkMutation = useMutation({
    mutationFn: async (taskId: number) => {
      if (nodeId) {
        // Link to specific node
        await api.post(`/tasks/${taskId}/link/${nodeId}`);
      } else {
        // Add to canvas (update canvas_id)
        await api.put(`/tasks/${taskId}`, { canvas_id: canvasId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linked-jira'] });
      queryClient.invalidateQueries({ queryKey: ['jira-tasks'] });
      toast({
        title: 'Issue Linked',
        description: nodeId ? 'Issue linked to node' : 'Issue added to canvas',
      });
    },
  });

  // Unlink mutation
  const unlinkMutation = useMutation({
    mutationFn: async (taskId: number) => {
      if (nodeId) {
        // Unlink from specific node
        await api.delete(`/tasks/${taskId}/link/${nodeId}`);
      } else {
        // Remove from canvas (set canvas_id to null)
        await api.put(`/tasks/${taskId}`, { canvas_id: null });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linked-jira'] });
      queryClient.invalidateQueries({ queryKey: ['jira-tasks'] });
      toast({
        title: 'Issue Unlinked',
        description: nodeId ? 'Issue unlinked from node' : 'Issue removed from canvas',
      });
    },
  });

  // Bulk link mutation
  const bulkLinkMutation = useMutation({
    mutationFn: async (taskIds: number[]) => {
      await Promise.all(
        taskIds.map(taskId => linkMutation.mutateAsync(taskId))
      );
    },
    onSuccess: () => {
      setSelectedIssues(new Set());
      toast({
        title: 'Issues Linked',
        description: `Successfully linked ${selectedIssues.size} issues`,
      });
    },
  });

  const linkedIssueIds = new Set(linkedIssues?.map(i => i.id) || []);

  // Filter logic
  const filteredAvailableIssues = (allJiraIssues || []).filter(issue => {
    if (linkedIssueIds.has(issue.id)) return false; // Already linked

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        issue.source_id.toLowerCase().includes(query) ||
        issue.title.toLowerCase().includes(query) ||
        issue.description?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const handleToggleIssue = (issueId: number) => {
    const newSelected = new Set(selectedIssues);
    if (newSelected.has(issueId)) {
      newSelected.delete(issueId);
    } else {
      newSelected.add(issueId);
    }
    setSelectedIssues(newSelected);
  };

  const handleBulkLink = () => {
    bulkLinkMutation.mutate(Array.from(selectedIssues));
  };

  const IssueRow = ({ issue, isLinked }: { issue: JiraTask & { score?: number }, isLinked: boolean }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
      {!isLinked && (
        <Checkbox
          checked={selectedIssues.has(issue.id)}
          onCheckedChange={() => handleToggleIssue(issue.id)}
        />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="font-mono text-xs">
            {issue.source_id}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {issue.priority}
          </Badge>
          {issue.score !== undefined && (
            <Badge variant={issue.score >= 0.8 ? 'default' : 'outline'} className="text-xs">
              {Math.round(issue.score * 100)}% match
            </Badge>
          )}
        </div>
        <p className="text-sm font-medium truncate">{issue.title}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span className="capitalize">{issue.status.replace('_', ' ')}</span>
          {issue.assignee_name && (
            <>
              <span>•</span>
              <span>{issue.assignee_name}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-1">
        {issue.source_url && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => window.open(issue.source_url, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}

        {isLinked ? (
          <Button
            size="sm"
            variant="destructive"
            className="h-8"
            onClick={() => unlinkMutation.mutate(issue.id)}
            disabled={unlinkMutation.isPending}
          >
            {unlinkMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Unlink className="h-4 w-4 mr-1" />
                Unlink
              </>
            )}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={() => linkMutation.mutate(issue.id)}
            disabled={linkMutation.isPending}
          >
            {linkMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Link2 className="h-4 w-4 mr-1" />
                Link
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Manage Jira Connections
          </DialogTitle>
          <DialogDescription>
            {nodeId
              ? `Customize which Jira issues are linked to "${nodeTitle}"`
              : `Manage Jira issues on this canvas`
            }
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by issue key, title, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="linked" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="linked">
              Linked ({linkedIssues?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="available">
              Available ({filteredAvailableIssues.length})
            </TabsTrigger>
            {searchQuery && suggestedIssues && (
              <TabsTrigger value="suggested">
                Suggested ({suggestedIssues.length})
              </TabsTrigger>
            )}
          </TabsList>

          {/* Linked Issues */}
          <TabsContent value="linked" className="flex-1 mt-4 min-h-0">
            <ScrollArea className="h-[400px] pr-4">
              {loadingLinked ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : linkedIssues && linkedIssues.length > 0 ? (
                <div className="space-y-2">
                  {linkedIssues.map(issue => (
                    <IssueRow key={issue.id} issue={issue} isLinked={true} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No Jira issues linked yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Switch to "Available" tab to add issues
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Available Issues */}
          <TabsContent value="available" className="flex-1 mt-4 min-h-0">
            {selectedIssues.size > 0 && (
              <div className="flex items-center justify-between p-3 mb-2 rounded-lg bg-muted">
                <span className="text-sm font-medium">
                  {selectedIssues.size} issue{selectedIssues.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedIssues(new Set())}
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleBulkLink}
                    disabled={bulkLinkMutation.isPending}
                  >
                    {bulkLinkMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Link2 className="h-4 w-4 mr-2" />
                    )}
                    Link Selected
                  </Button>
                </div>
              </div>
            )}

            <ScrollArea className="h-[400px] pr-4">
              {loadingAll ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredAvailableIssues.length > 0 ? (
                <div className="space-y-2">
                  {filteredAvailableIssues.map(issue => (
                    <IssueRow key={issue.id} issue={issue} isLinked={false} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'No matching issues found' : 'All issues are already linked'}
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Suggested Issues (AI-powered) */}
          {searchQuery && suggestedIssues && (
            <TabsContent value="suggested" className="flex-1 mt-4 min-h-0">
              <ScrollArea className="h-[400px] pr-4">
                {suggestedIssues.length > 0 ? (
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-3">
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        <strong>AI-powered suggestions</strong> based on semantic similarity to your search
                      </p>
                    </div>
                    {suggestedIssues.map((issue: any) => (
                      <IssueRow
                        key={issue.id}
                        issue={issue}
                        isLinked={linkedIssueIds.has(issue.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No AI suggestions found
                    </p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          )}
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
