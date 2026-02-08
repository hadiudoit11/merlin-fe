"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { tasks } from '@/lib/task-api';
import {
  Task,
  TaskStatus,
  TasksByStatus,
  groupTasksByStatus,
} from '@/types/task';
import TaskColumn from './TaskColumn';
import TaskStats from './TaskStats';

interface TaskBoardProps {
  canvasId?: number;
  showStats?: boolean;
  showCancelled?: boolean;
}

const COLUMN_ORDER: TaskStatus[] = ['pending', 'in_progress', 'completed'];
const ALL_COLUMNS: TaskStatus[] = ['pending', 'in_progress', 'completed', 'cancelled'];

const TaskBoard: React.FC<TaskBoardProps> = ({
  canvasId,
  showStats = true,
  showCancelled = false,
}) => {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [tasksByStatus, setTasksByStatus] = useState<TasksByStatus>({
    pending: [],
    in_progress: [],
    completed: [],
    cancelled: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const columns = showCancelled ? ALL_COLUMNS : COLUMN_ORDER;

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await tasks.listTasks({
        canvas_id: canvasId,
        page_size: 100, // Get all tasks
      });

      setAllTasks(response.tasks);
      setTasksByStatus(groupTasksByStatus(response.tasks));
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [canvasId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a column
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const taskId = parseInt(draggableId, 10);
    const newStatus = destination.droppableId as TaskStatus;
    const oldStatus = source.droppableId as TaskStatus;

    // Optimistic update
    const task = allTasks.find((t) => t.id === taskId);
    if (!task) return;

    // Update local state immediately
    const updatedTask = { ...task, status: newStatus };
    const newAllTasks = allTasks.map((t) =>
      t.id === taskId ? updatedTask : t
    );
    setAllTasks(newAllTasks);
    setTasksByStatus(groupTasksByStatus(newAllTasks));

    // Persist to backend
    try {
      await tasks.updateTaskStatus(taskId, newStatus);

      toast({
        title: 'Task moved',
        description: `Moved to ${newStatus.replace('_', ' ')}`,
        duration: 2000,
      });
    } catch (err) {
      console.error('Error updating task status:', err);

      // Revert on error
      const revertedTask = { ...task, status: oldStatus };
      const revertedTasks = allTasks.map((t) =>
        t.id === taskId ? revertedTask : t
      );
      setAllTasks(revertedTasks);
      setTasksByStatus(groupTasksByStatus(revertedTasks));

      toast({
        title: 'Failed to move task',
        description: 'The change has been reverted',
        variant: 'destructive',
      });
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    const updatedTasks = [...allTasks, newTask];
    setAllTasks(updatedTasks);
    setTasksByStatus(groupTasksByStatus(updatedTasks));
  };

  const handleTaskUpdated = () => {
    fetchTasks();
  };

  const handleTaskDeleted = (deletedTask: Task) => {
    const updatedTasks = allTasks.filter((t) => t.id !== deletedTask.id);
    setAllTasks(updatedTasks);
    setTasksByStatus(groupTasksByStatus(updatedTasks));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={fetchTasks}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showStats && (
        <TaskStats
          stats={{
            total: allTasks.length,
            pending: tasksByStatus.pending.length,
            in_progress: tasksByStatus.in_progress.length,
            completed: tasksByStatus.completed.length,
            overdue: allTasks.filter((t) => t.is_overdue).length,
          }}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <Button variant="outline" size="sm" onClick={fetchTasks}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              columnTasks={tasksByStatus[status]}
              canvasId={canvasId}
              onTaskCreated={handleTaskCreated}
              onTaskUpdated={handleTaskUpdated}
              onTaskDeleted={handleTaskDeleted}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default TaskBoard;
