"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, MoreHorizontal, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { tasks } from '@/lib/task-api';
import {
  Task,
  TaskStatus,
  TASK_STATUS_LABELS,
} from '@/types/task';
import TaskCard from './TaskCard';

// Trello-like column header colors
const COLUMN_COLORS: Record<TaskStatus, string> = {
  pending: '#dfe1e6',
  in_progress: '#0079bf',
  completed: '#61bd4f',
  cancelled: '#eb5a46',
};

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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  const handleCreateTask = async () => {
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
        duration: 2000,
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreateTask();
    }
    if (e.key === 'Escape') {
      setIsCreating(false);
      setNewTaskTitle('');
    }
  };

  return (
    <div className="flex-shrink-0 w-[75vw] sm:w-72 snap-center sm:snap-align-none flex flex-col bg-[#ebecf0] dark:bg-gray-800 rounded-xl max-h-[calc(100dvh-260px)] sm:max-h-[calc(100vh-200px)]">
      {/* Column Header */}
      <div className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {TASK_STATUS_LABELS[status]}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
              {columnTasks.length}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 md:h-7 md:w-7">
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsCreating(true)}>
                Add card
              </DropdownMenuItem>
              <DropdownMenuItem>Copy list</DropdownMenuItem>
              <DropdownMenuItem>Move all cards</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                Archive all cards
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Scrollable Card Area */}
      <Droppable droppableId={status} isDropDisabled={!isMounted}>
        {(droppableProvided, snapshot) => (
          <div
            className={`flex-1 overflow-y-auto px-2 pb-2 min-h-[100px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-gray-200/50 dark:bg-gray-700/50' : ''
            }`}
            ref={droppableProvided.innerRef}
            {...droppableProvided.droppableProps}
          >
            {columnTasks.length === 0 && !isCreating && !snapshot.isDraggingOver && (
              <div
                onClick={() => setIsCreating(true)}
                className="flex flex-col items-center justify-center h-20 text-center rounded-lg cursor-pointer hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <p className="text-sm text-gray-500 dark:text-gray-400">No cards</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Click to add one</p>
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
                    className={`mb-2 ${
                      dragSnapshot.isDragging
                        ? 'rotate-2 shadow-lg'
                        : ''
                    }`}
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

            {/* Inline Card Creation */}
            {isCreating && (
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-2 mb-2">
                {isSubmitting ? (
                  <div className="flex items-center justify-center p-3">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-gray-500">Creating...</span>
                  </div>
                ) : (
                  <>
                    <textarea
                      ref={inputRef}
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter a title for this card..."
                      className="w-full bg-transparent border-none focus:outline-none text-sm resize-none min-h-[60px] placeholder:text-gray-400"
                      rows={2}
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={handleCreateTask}
                        disabled={!newTaskTitle.trim()}
                        className="bg-[#0079bf] hover:bg-[#026aa7] text-white"
                      >
                        Add card
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => {
                          setIsCreating(false);
                          setNewTaskTitle('');
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </Droppable>

      {/* Add Card Button - Always visible at bottom */}
      {!isCreating && (
        <div className="p-2 pt-0">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-lg"
            onClick={() => setIsCreating(true)}
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add a card
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskColumn;
