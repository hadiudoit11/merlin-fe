"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, PlusCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { tasks } from '@/lib/task-api';
import {
  Task,
  TaskStatus,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
} from '@/types/task';
import TaskCard from './TaskCard';

interface TaskColumnProps {
  status: TaskStatus;
  columnTasks: Task[];
  canvasId?: number;
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: () => void;
  onTaskDeleted?: (task: Task) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  status,
  columnTasks,
  canvasId,
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  const handleCreateTask = async (e?: React.KeyboardEvent) => {
    if (e && e.key !== 'Enter') return;
    if (!newTaskTitle.trim()) {
      setIsCreating(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const newTask = await tasks.createTask({
        title: newTaskTitle.trim(),
        canvas_id: canvasId,
      });

      // Update status to match column
      if (status !== 'pending') {
        await tasks.updateTaskStatus(newTask.id, status);
        newTask.status = status;
      }

      toast({
        title: 'Task created',
        duration: 3000,
      });

      if (onTaskCreated) {
        onTaskCreated(newTask);
      }

      setNewTaskTitle('');
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Failed to create task',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlur = () => {
    if (newTaskTitle.trim() && !isSubmitting) {
      handleCreateTask();
    } else if (!isSubmitting) {
      setIsCreating(false);
    }
  };

  return (
    <Card className="flex-1 w-72 flex-shrink-0 border bg-card text-card-foreground rounded-md">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${TASK_STATUS_COLORS[status].split(' ')[0]}`} />
            <h3 className="text-sm font-medium">{TASK_STATUS_LABELS[status]}</h3>
          </div>
          <Badge variant="outline" className="text-xs font-normal">
            {columnTasks.length}
          </Badge>
        </div>
      </CardHeader>

      <Droppable droppableId={status} isDropDisabled={!isMounted}>
        {(droppableProvided, snapshot) => (
          <CardContent
            className="p-2 min-h-[200px]"
            ref={droppableProvided.innerRef}
            {...droppableProvided.droppableProps}
          >
            <div
              className={`rounded-md transition-colors ${
                snapshot.isDraggingOver ? 'bg-muted/50' : ''
              }`}
            >
              {columnTasks.length === 0 && !isCreating && (
                <div
                  onClick={() => setIsCreating(true)}
                  className="flex flex-col items-center justify-center h-24 text-center border border-dashed border-muted rounded-lg p-2 my-1 cursor-pointer hover:bg-muted/20 transition-colors"
                >
                  <PlusCircle className="h-5 w-5 text-muted-foreground mb-1" />
                  <p className="text-sm text-muted-foreground">No tasks</p>
                  <p className="text-xs text-muted-foreground mt-1">Click to add one</p>
                </div>
              )}

              {columnTasks.map((task, index) => (
                <Draggable
                  key={task.id}
                  draggableId={String(task.id)}
                  index={index}
                  isDragDisabled={!isMounted}
                >
                  {(draggableProvided, dragSnapshot) => (
                    <div
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.draggableProps}
                      {...draggableProvided.dragHandleProps}
                      className={`mb-2 ${dragSnapshot.isDragging ? 'opacity-90 rotate-1' : ''}`}
                    >
                      <TaskCard
                        task={task}
                        showStatus={false}
                        onTaskUpdated={onTaskUpdated}
                        onTaskDeleted={onTaskDeleted}
                      />
                    </div>
                  )}
                </Draggable>
              ))}

              {droppableProvided.placeholder}

              {isCreating && (
                <div className="p-2 bg-background/50 rounded-md border-2 border-dashed border-primary/20 focus-within:border-primary/50 transition-all my-1">
                  {isSubmitting ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm">Creating...</span>
                    </div>
                  ) : (
                    <input
                      ref={inputRef}
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={handleCreateTask}
                      onBlur={handleBlur}
                      placeholder="Task title..."
                      className="w-full bg-transparent px-2 py-1 border-none focus:outline-none text-sm"
                    />
                  )}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Droppable>

      {!isCreating && columnTasks.length > 0 && (
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setIsCreating(true)}
            disabled={isSubmitting}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add task
          </Button>
        </div>
      )}
    </Card>
  );
};

export default TaskColumn;
