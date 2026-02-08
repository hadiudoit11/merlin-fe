"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, UserIcon, LinkIcon } from 'lucide-react';
import { format } from 'date-fns';
import {
  Task,
  TASK_PRIORITY_COLORS,
  TASK_STATUS_COLORS,
  TASK_STATUS_LABELS,
  TASK_SOURCE_LABELS,
} from '@/types/task';
import TaskDetail from './TaskDetail';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onTaskUpdated?: () => void;
  onTaskDeleted?: (task: Task) => void;
  showStatus?: boolean;
  showSource?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onTaskUpdated,
  onTaskDeleted,
  showStatus = true,
  showSource = false,
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleTaskUpdated = () => {
    if (onTaskUpdated) {
      onTaskUpdated();
    }
  };

  const handleTaskDeleted = () => {
    setIsSheetOpen(false);
    if (onTaskDeleted) {
      onTaskDeleted(task);
    }
  };

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-md transition-all"
        onClick={() => setIsSheetOpen(true)}
      >
        <CardHeader className="p-3 pb-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-sm font-medium line-clamp-2 flex-1">{task.title}</h3>
            <div className="flex flex-col gap-1 items-end flex-shrink-0">
              {showStatus && (
                <Badge className={`text-xs px-2 py-0.5 ${TASK_STATUS_COLORS[task.status]}`}>
                  {TASK_STATUS_LABELS[task.status]}
                </Badge>
              )}
              <Badge className={`text-xs px-2 py-0.5 ${TASK_PRIORITY_COLORS[task.priority]}`}>
                {task.priority}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3 pt-0">
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-3">
              {task.due_date && (
                <div className={`flex items-center gap-1 ${task.is_overdue ? 'text-red-500' : 'text-muted-foreground'}`}>
                  <CalendarIcon className="h-3 w-3" />
                  <span>{format(new Date(task.due_date), 'MMM d')}</span>
                </div>
              )}

              {task.assignee_name && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <UserIcon className="h-3 w-3" />
                  <span className="truncate max-w-[80px]">{task.assignee_name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {task.linked_nodes.length > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <LinkIcon className="h-3 w-3" />
                  <span>{task.linked_nodes.length}</span>
                </div>
              )}

              {showSource && task.source !== 'manual' && (
                <Badge variant="outline" className="text-xs">
                  {TASK_SOURCE_LABELS[task.source]}
                </Badge>
              )}
            </div>
          </div>

          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.slice(0, 3).map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  +{task.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <TaskDetail
        taskId={task.id}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />
    </>
  );
};

export default TaskCard;
