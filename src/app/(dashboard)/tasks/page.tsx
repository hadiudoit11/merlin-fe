'use client';

import React, { useState } from 'react';
import { Plus, Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TaskBoard from '@/components/tasks/TaskBoard';

export default function TasksPage() {
  const [showCancelled, setShowCancelled] = useState(false);
  const [filterSource, setFilterSource] = useState<string>('all');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 border-b gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage action items from meetings, skills, and manual entries
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {/* Filter by source */}
          <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="zoom">Zoom meetings</SelectItem>
              <SelectItem value="slack">Slack</SelectItem>
              <SelectItem value="jira">Jira</SelectItem>
              <SelectItem value="ai_extracted">AI extracted</SelectItem>
            </SelectContent>
          </Select>

          {/* Toggle cancelled */}
          <Button
            variant={showCancelled ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowCancelled(!showCancelled)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{showCancelled ? 'Hide cancelled' : 'Show cancelled'}</span>
            <span className="sm:hidden">{showCancelled ? 'Hide' : 'Cancelled'}</span>
          </Button>

          {/* Create task button */}
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Task Board */}
      <div className="flex-1 overflow-hidden p-4 md:p-6">
        <TaskBoard showStats={true} showCancelled={showCancelled} />
      </div>
    </div>
  );
}
