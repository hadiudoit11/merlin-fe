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

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Board</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchTasks}
          className="text-gray-600 dark:text-gray-300 hover:bg-gray-200/50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Trello-like board background */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-gray-900 dark:to-gray-800 rounded-xl p-4 -mx-2 shadow-inner">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory sm:snap-none scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent -mx-1 px-1">
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

            {/* Add another list button */}
            <div className="flex-shrink-0 w-72">
              <button
                className="w-full p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-left text-white/90 text-sm font-medium flex items-center gap-2"
                onClick={() => {
                  toast({
                    title: 'Coming soon',
                    description: 'Custom lists will be available soon',
                    duration: 2000,
                  });
                }}
              >
                <span className="text-lg">+</span>
                Add another list
              </button>
            </div>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default TaskBoard;
