'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  ExternalLink,
  Link2,
  GitBranch,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Filter,
  Loader2,
  X,
} from 'lucide-react';
import { integrationsApi } from '@/lib/integrations-api';
import { api } from '@/lib/api';

interface StrategicContextPanelProps {
  nodeId?: number;
  nodeContent?: string;
  canvasId: number;
  onLinkIssue?: (taskId: number) => void;
}

interface RelatedIssue {
  score: number;
  issue_key: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  source_url?: string;
  task_id: number;
  context?: string;
  assignee_name?: string;
  is_linked?: boolean;
}

const priorityColors = {
  urgent: 'bg-red-100 text-red-800 border-red-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  low: 'bg-gray-100 text-gray-800 border-gray-300',
};

const statusIcons = {
  pending: Clock,
  in_progress: TrendingUp,
  completed: CheckCircle2,
  cancelled: X,
};

export function StrategicContextPanel({
  nodeId,
  nodeContent,
  canvasId,
  onLinkIssue,
}: StrategicContextPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'high-confidence' | 'unlinked'>('all');

  // Auto-search when node content changes
  const effectiveQuery = searchQuery || nodeContent || '';

  // Fetch related Jira issues
  const { data: contextResult, isLoading, refetch } = useQuery({
    queryKey: ['jira-context', effectiveQuery, canvasId],
    queryFn: async () => {
      if (!effectiveQuery || effectiveQuery.length < 3) return null;

      return await integrationsApi.searchJiraContext({
        query: effectiveQuery,
        canvasId,
        topK: 15, // Get more for strategic overview
      });
    },
    enabled: effectiveQuery.length >= 3,
  });

  // Fetch already linked issues if we have a node
  const { data: linkedTasks } = useQuery({
    queryKey: ['linked-tasks', nodeId],
    queryFn: async () => {
      if (!nodeId) return [];
      const tasks = await api.getTasks({ linked_node_id: nodeId });
      return tasks.filter(t => t.source === 'jira');
    },
    enabled: !!nodeId,
  });

  // Enrich issues with linked status
  const enrichedIssues = contextResult?.issues.map((issue: RelatedIssue) => ({
    ...issue,
    is_linked: linkedTasks?.some(t => t.id === issue.task_id) || false,
  })) || [];

  // Apply filters
  const filteredIssues = enrichedIssues.filter((issue: RelatedIssue) => {
    if (activeFilter === 'high-confidence') return issue.score >= 0.75;
    if (activeFilter === 'unlinked') return !issue.is_linked;
    return true;
  });

  // Group by confidence
  const highConfidence = filteredIssues.filter((i: RelatedIssue) => i.score >= 0.8);
  const mediumConfidence = filteredIssues.filter((i: RelatedIssue) => i.score >= 0.6 && i.score < 0.8);
  const lowConfidence = filteredIssues.filter((i: RelatedIssue) => i.score < 0.6);

  // Stats
  const totalIssues = filteredIssues.length;
  const linkedCount = filteredIssues.filter((i: RelatedIssue) => i.is_linked).length;
  const unlinkdCount = totalIssues - linkedCount;

  const handleLinkIssue = async (taskId: number) => {
    if (onLinkIssue) {
      await onLinkIssue(taskId);
      refetch();
    }
  };

  const IssueCard = ({ issue }: { issue: RelatedIssue }) => {
    const StatusIcon = statusIcons[issue.status as keyof typeof statusIcons] || Clock;
    const confidencePercent = Math.round(issue.score * 100);

    return (
      <Card className={`transition-all hover:shadow-md ${issue.is_linked ? 'border-green-300 bg-green-50/30' : ''}`}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {issue.issue_key}
              </Badge>
              <Badge
                variant="secondary"
                className={`text-xs ${priorityColors[issue.priority as keyof typeof priorityColors] || ''}`}
              >
                {issue.priority}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {/* Confidence Score */}
              <Badge variant={issue.score >= 0.8 ? 'default' : 'outline'} className="text-xs">
                {confidencePercent}% match
              </Badge>
            </div>
          </div>

          {/* Title */}
          <h4 className="font-medium text-sm mb-2 line-clamp-2">{issue.title}</h4>

          {/* Description Preview */}
          {issue.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {issue.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <StatusIcon className="h-3 w-3" />
              <span className="capitalize">{issue.status.replace('_', ' ')}</span>
              {issue.assignee_name && (
                <>
                  <span>•</span>
                  <span>{issue.assignee_name}</span>
                </>
              )}
            </div>

            <div className="flex gap-1">
              {/* Link to Jira */}
              {issue.source_url && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => window.open(issue.source_url, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}

              {/* Link to Node */}
              {nodeId && !issue.is_linked && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs"
                  onClick={() => handleLinkIssue(issue.task_id)}
                >
                  <Link2 className="h-3 w-3 mr-1" />
                  Link
                </Button>
              )}

              {issue.is_linked && (
                <Badge variant="outline" className="h-7 text-xs text-green-700 border-green-300">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Linked
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-blue-600" />
              Strategic Context
            </CardTitle>
            <CardDescription className="mt-1">
              Discover all related Jira work for strategic decision making
            </CardDescription>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for related issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Stats & Filters */}
        {totalIssues > 0 && (
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span>{totalIssues} found</span>
              <span>•</span>
              <span className="text-green-700">{linkedCount} linked</span>
              {unlinkdCount > 0 && (
                <>
                  <span>•</span>
                  <span className="text-orange-700">{unlinkdCount} unlinked</span>
                </>
              )}
            </div>

            {/* Filter */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                className="h-7 text-xs"
                onClick={() => setActiveFilter('all')}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={activeFilter === 'high-confidence' ? 'default' : 'outline'}
                className="h-7 text-xs"
                onClick={() => setActiveFilter('high-confidence')}
              >
                High Match
              </Button>
              <Button
                size="sm"
                variant={activeFilter === 'unlinked' ? 'default' : 'outline'}
                className="h-7 text-xs"
                onClick={() => setActiveFilter('unlinked')}
              >
                Unlinked
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !effectiveQuery || effectiveQuery.length < 3 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Search className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Enter a search query or select a node to discover related Jira issues
            </p>
          </div>
        ) : totalIssues === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No related Jira issues found
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try a different search query or import more Jira issues
            </p>
          </div>
        ) : (
          <Tabs defaultValue="grouped" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="grouped">By Confidence</TabsTrigger>
              <TabsTrigger value="all">All Issues</TabsTrigger>
            </TabsList>

            <TabsContent value="grouped" className="mt-4 space-y-4">
              {/* High Confidence */}
              {highConfidence.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <h3 className="text-sm font-semibold">Strong Match ({highConfidence.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {highConfidence.map((issue) => (
                      <IssueCard key={issue.task_id} issue={issue} />
                    ))}
                  </div>
                </div>
              )}

              {/* Medium Confidence */}
              {mediumConfidence.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <h3 className="text-sm font-semibold">Moderate Match ({mediumConfidence.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {mediumConfidence.map((issue) => (
                      <IssueCard key={issue.task_id} issue={issue} />
                    ))}
                  </div>
                </div>
              )}

              {/* Low Confidence */}
              {lowConfidence.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-2 w-2 rounded-full bg-gray-400" />
                    <h3 className="text-sm font-semibold">Weak Match ({lowConfidence.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {lowConfidence.map((issue) => (
                      <IssueCard key={issue.task_id} issue={issue} />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="mt-4 space-y-2">
              {filteredIssues.map((issue: RelatedIssue) => (
                <IssueCard key={issue.task_id} issue={issue} />
              ))}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
