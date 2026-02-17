# Strategic Context Panel - Integration Guide

## Quick Integration

Add the Strategic Context Panel to your canvas page in 3 steps:

### Step 1: Add to Canvas Layout

```tsx
// app/(dashboard)/canvas/[id]/page.tsx
import { StrategicContextPanel } from '@/components/canvas/StrategicContextPanel';

export default function CanvasPage({ params }: { params: { id: string } }) {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  return (
    <div className="flex h-screen">
      {/* Main Canvas */}
      <div className="flex-1">
        <Canvas
          canvasId={params.id}
          onNodeSelect={setSelectedNode}
        />
      </div>

      {/* Right Sidebar with Strategic Context */}
      <div className="w-[400px] border-l bg-muted/30">
        <StrategicContextPanel
          nodeId={selectedNode?.id}
          nodeContent={selectedNode?.content}
          canvasId={parseInt(params.id)}
          onLinkIssue={async (taskId) => {
            // Link task to node
            await api.post(`/tasks/${taskId}/link/${selectedNode?.id}`);
            // Refresh node data
            refetchCanvas();
          }}
        />
      </div>
    </div>
  );
}
```

### Step 2: Auto-Index on Import

Update your Jira import dialog to automatically index issues:

```tsx
// components/integrations/JiraIntegration.tsx
const handleImport = async () => {
  // Import issues
  const result = await integrationsApi.importFromJira({ jql, canvasId });

  toast({
    title: 'Import Complete',
    description: `Imported ${result.imported} issues`,
  });

  // Auto-index for strategic context
  try {
    await integrationsApi.indexJiraIssuesForCanvas(canvasId);
    toast({
      title: 'Ready for Strategic Context',
      description: 'Issues indexed and ready to discover',
    });
  } catch (err) {
    console.warn('Failed to index:', err);
    // Non-fatal - user can manually index later
  }

  setShowImportDialog(false);
  onImported();
};
```

### Step 3: Add Toggle to Canvas Header

Allow users to show/hide the panel:

```tsx
// components/canvas/CanvasHeader.tsx
const [showStrategicContext, setShowStrategicContext] = useState(true);

<Button
  variant={showStrategicContext ? 'default' : 'outline'}
  onClick={() => setShowStrategicContext(!showStrategicContext)}
>
  <GitBranch className="h-4 w-4 mr-2" />
  Strategic Context
</Button>
```

---

## Advanced Features

### Feature 1: Floating Panel (Alternative Layout)

For users who want the panel as an overlay:

```tsx
// components/canvas/FloatingStrategicContext.tsx
export function FloatingStrategicContext() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <Button
        className="fixed bottom-4 right-4 rounded-full h-14 w-14 shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <GitBranch className="h-6 w-6" />
      </Button>

      {/* Sheet Panel */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-[500px] sm:w-[600px]">
          <StrategicContextPanel {...props} />
        </SheetContent>
      </Sheet>
    </>
  );
}
```

### Feature 2: Issue Network Visualization

Show connections between issues:

```tsx
// components/canvas/IssueNetworkGraph.tsx
import { NetworkGraph } from '@/components/visualizations/NetworkGraph';

// In StrategicContextPanel
<Card>
  <CardHeader>
    <CardTitle>Issue Network</CardTitle>
  </CardHeader>
  <CardContent>
    <NetworkGraph
      nodes={issues.map(i => ({
        id: i.issue_key,
        label: i.title,
        score: i.score,
      }))}
      edges={/* compute edges based on shared labels/assignees */}
    />
  </CardContent>
</Card>
```

### Feature 3: Quick Actions Menu

Add bulk actions:

```tsx
// Inside StrategicContextPanel
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">
      <MoreVertical className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={linkAllHighConfidence}>
      Link All High Confidence
    </DropdownMenuItem>
    <DropdownMenuItem onClick={exportToCSV}>
      Export to CSV
    </DropdownMenuItem>
    <DropdownMenuItem onClick={shareWithTeam}>
      Share with Team
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Feature 4: Historical Trends

Track issue discovery over time:

```tsx
// Show how many issues are being discovered
<div className="flex items-center gap-2">
  <TrendingUp className="h-4 w-4 text-green-600" />
  <span className="text-sm text-muted-foreground">
    +3 new issues since last week
  </span>
</div>
```

---

## Keyboard Shortcuts

Add keyboard navigation:

```tsx
// In StrategicContextPanel
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'k':
          e.preventDefault();
          searchInputRef.current?.focus();
          break;
        case 'l':
          e.preventDefault();
          if (highlightedIssue) {
            handleLinkIssue(highlightedIssue.task_id);
          }
          break;
      }
    }

    // Arrow navigation
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, filteredIssues.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, 0));
    }
  };

  document.addEventListener('keydown', handleKeyPress);
  return () => document.removeEventListener('keydown', handleKeyPress);
}, [highlightedIssue, filteredIssues]);
```

---

## Mobile/Responsive Layout

Make it work on smaller screens:

```tsx
// Use Sheet instead of fixed sidebar on mobile
import { useMediaQuery } from '@/hooks/useMediaQuery';

export function ResponsiveStrategicContext() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button className="fixed bottom-4 right-4">
            <GitBranch />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <StrategicContextPanel {...props} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="w-[400px] border-l">
      <StrategicContextPanel {...props} />
    </div>
  );
}
```

---

## Testing

### Manual Testing Checklist

- [ ] Import Jira issues to a canvas
- [ ] Verify auto-indexing completes
- [ ] Select a Problem node
- [ ] See related issues appear automatically
- [ ] Click "Link" button - verify link created
- [ ] Check linked issue shows "Linked" badge
- [ ] Try manual search - verify results
- [ ] Test filters: All, High Match, Unlinked
- [ ] Switch tabs: Grouped vs All Issues
- [ ] Open issue in Jira (external link)

### Automated Tests

```typescript
// __tests__/StrategicContextPanel.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { StrategicContextPanel } from '@/components/canvas/StrategicContextPanel';

describe('StrategicContextPanel', () => {
  it('searches for issues when node content provided', async () => {
    render(
      <StrategicContextPanel
        nodeContent="authentication slow"
        canvasId={5}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/related issues/i)).toBeInTheDocument();
    });
  });

  it('displays confidence scores', async () => {
    // Mock API response
    // Verify badges show percentage
  });

  it('handles linking an issue', async () => {
    // Click link button
    // Verify API call made
    // Verify badge changes to "Linked"
  });
});
```

---

## Performance Optimization

### Debounce Search

```tsx
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const debouncedQuery = useDebouncedValue(searchQuery, 300);

useQuery({
  queryKey: ['jira-context', debouncedQuery, canvasId],
  // ...
});
```

### Virtualize Long Lists

For canvases with 50+ issues:

```tsx
import { VirtualizedList } from '@/components/ui/virtualized-list';

<VirtualizedList
  items={filteredIssues}
  renderItem={(issue) => <IssueCard issue={issue} />}
  height={600}
/>
```

### Cache Search Results

```tsx
useQuery({
  queryKey: ['jira-context', query, canvasId],
  // ...
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
});
```

---

## Analytics

Track usage for product insights:

```tsx
// Track searches
const handleSearch = (query: string) => {
  analytics.track('Strategic Context Search', {
    query_length: query.length,
    canvas_id: canvasId,
    results_count: results.length,
  });
  setSearchQuery(query);
};

// Track links
const handleLinkIssue = async (taskId: number) => {
  analytics.track('Strategic Context Link', {
    task_id: taskId,
    node_id: nodeId,
    confidence_score: issue.score,
  });
  await onLinkIssue(taskId);
};

// Track filters
const setActiveFilter = (filter: string) => {
  analytics.track('Strategic Context Filter', {
    filter,
    canvas_id: canvasId,
  });
  _setActiveFilter(filter);
};
```

---

## User Onboarding

Add a first-time user tour:

```tsx
import { Joyride } from 'react-joyride';

const tourSteps = [
  {
    target: '.search-input',
    content: 'Search for Jira issues related to your work',
  },
  {
    target: '.confidence-badge',
    content: 'Confidence shows how related each issue is',
  },
  {
    target: '.link-button',
    content: 'Click to link relevant issues to your node',
  },
];

<Joyride steps={tourSteps} run={isFirstTimeUser} />
```

---

## Configuration Options

Allow users to customize:

```tsx
interface StrategicContextSettings {
  autoSearch: boolean;           // Auto-search on node select
  autoIndex: boolean;            // Auto-index on import
  defaultFilter: 'all' | 'high' | 'unlinked';
  minConfidence: number;         // Hide below this threshold
  maxResults: number;            // Limit results shown
  groupBy: 'confidence' | 'status' | 'assignee';
}

// Store in user preferences
const settings = useUserPreference<StrategicContextSettings>('strategic-context');
```

---

## Example: Complete Integration

```tsx
// app/(dashboard)/canvas/[id]/page.tsx
'use client';

import { useState } from 'react';
import { Canvas } from '@/components/canvas/Canvas';
import { StrategicContextPanel } from '@/components/canvas/StrategicContextPanel';
import { Button } from '@/components/ui/button';
import { GitBranch, X } from 'lucide-react';
import { api } from '@/lib/api';

export default function CanvasPage({ params }: { params: { id: string } }) {
  const canvasId = parseInt(params.id);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showContext, setShowContext] = useState(true);

  const handleLinkIssue = async (taskId: number) => {
    if (!selectedNode) return;

    await api.post(`/tasks/${taskId}/link/${selectedNode.id}`);

    // Refresh canvas
    await refetchCanvas();

    // Show success toast
    toast({
      title: 'Issue Linked',
      description: 'Jira issue linked to node',
    });
  };

  return (
    <div className="flex h-screen">
      {/* Canvas */}
      <div className={`flex-1 transition-all ${showContext ? 'mr-[400px]' : ''}`}>
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant={showContext ? 'default' : 'outline'}
            onClick={() => setShowContext(!showContext)}
          >
            {showContext ? <X className="h-4 w-4 mr-2" /> : <GitBranch className="h-4 w-4 mr-2" />}
            {showContext ? 'Hide' : 'Show'} Strategic Context
          </Button>
        </div>

        <Canvas
          canvasId={canvasId}
          onNodeSelect={setSelectedNode}
        />
      </div>

      {/* Strategic Context Sidebar */}
      {showContext && (
        <div className="fixed right-0 top-0 h-screen w-[400px] border-l bg-background shadow-lg">
          <StrategicContextPanel
            nodeId={selectedNode?.id}
            nodeContent={selectedNode?.content}
            canvasId={canvasId}
            onLinkIssue={handleLinkIssue}
          />
        </div>
      )}
    </div>
  );
}
```

---

**Ready to integrate! The component is fully built and the backend is ready.**
