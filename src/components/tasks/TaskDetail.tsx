"use client";

import React, { useState, useEffect } from 'react';
import { format, formatDistance } from 'date-fns';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  CalendarIcon,
  UserIcon,
  ClockIcon,
  Trash2Icon,
  LinkIcon,
  ExternalLinkIcon,
} from 'lucide-react';
import { tasks } from '@/lib/task-api';
import {
  Task,
  TaskStatus,
  TaskPriority,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_SOURCE_LABELS,
} from '@/types/task';

interface TaskDetailProps {
  taskId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated?: () => void;
  onTaskDeleted?: () => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({
  taskId,
  open,
  onOpenChange,
  onTaskUpdated,
  onTaskDeleted,
}) => {
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assignee_name: '',
    assignee_email: '',
    due_date: '',
    tags: [] as string[],
  });

  // Fetch task details
  useEffect(() => {
    if (open && taskId) {
      fetchTaskDetails();
    }
  }, [open, taskId]);

  const fetchTaskDetails = async () => {
    if (!taskId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await tasks.getTask(taskId);
      setTask(data);

      setFormData({
        title: data.title || '',
        description: data.description || '',
        status: data.status,
        priority: data.priority,
        assignee_name: data.assignee_name || '',
        assignee_email: data.assignee_email || '',
        due_date: data.due_date ? format(new Date(data.due_date), 'yyyy-MM-dd') : '',
        tags: data.tags || [],
      });
    } catch (err) {
      console.error('Error fetching task details:', err);
      setError('Failed to load task details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveTask = async () => {
    if (!task || !taskId) return;

    setIsSaving(true);

    try {
      await tasks.updateTask(taskId, {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        assignee_name: formData.assignee_name || undefined,
        assignee_email: formData.assignee_email || undefined,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
        tags: formData.tags,
      });

      toast({
        title: 'Task updated',
        description: 'Your changes have been saved.',
      });

      if (onTaskUpdated) {
        onTaskUpdated();
      }

      await fetchTaskDetails();
    } catch (err) {
      console.error('Error updating task:', err);
      toast({
        title: 'Update failed',
        description: 'Could not save changes.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskId) return;

    setIsDeleting(true);

    try {
      await tasks.deleteTask(taskId);

      toast({
        title: 'Task deleted',
        description: 'The task has been removed.',
      });

      onOpenChange(false);

      if (onTaskDeleted) {
        onTaskDeleted();
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      toast({
        title: 'Delete failed',
        description: 'Could not delete the task.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Task Details</SheetTitle>
          <SheetDescription>View and edit task information</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="py-6 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : error ? (
          <div className="py-6">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchTaskDetails}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            {/* Task Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleSelectChange('priority', value)}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="due_date"
                  name="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Assignee */}
            <div className="space-y-2">
              <Label>Assignee</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  name="assignee_name"
                  placeholder="Name"
                  value={formData.assignee_name}
                  onChange={handleInputChange}
                />
                <Input
                  name="assignee_email"
                  placeholder="Email"
                  type="email"
                  value={formData.assignee_email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>

            {/* Task Metadata */}
            {task && (
              <div className="space-y-3 bg-muted/30 p-3 rounded-md mt-2">
                <h4 className="text-sm font-medium">Additional Information</h4>

                {/* Source */}
                <div className="text-sm flex items-center gap-2">
                  <span className="text-muted-foreground">Source:</span>
                  <Badge variant="outline">{TASK_SOURCE_LABELS[task.source]}</Badge>
                  {task.source_url && (
                    <a
                      href={task.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <ExternalLinkIcon className="h-3 w-3" />
                    </a>
                  )}
                </div>

                {/* Linked Nodes */}
                {task.linked_nodes.length > 0 && (
                  <div className="text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <LinkIcon className="h-3 w-3" /> Linked Nodes:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1 ml-4">
                      {task.linked_nodes.map((node) => (
                        <Badge key={node.id} variant="secondary">
                          {node.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Creation Date */}
                <div className="text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" /> Created:
                  </span>
                  <p className="ml-4">
                    {format(new Date(task.created_at), 'PP')}
                    <span className="text-xs text-muted-foreground ml-2">
                      ({formatDistance(new Date(task.created_at), new Date(), {
                        addSuffix: true,
                      })})
                    </span>
                  </p>
                </div>

                {/* Last Updated */}
                <div className="text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" /> Last updated:
                  </span>
                  <p className="ml-4 text-xs text-muted-foreground">
                    {formatDistance(new Date(task.updated_at), new Date(), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <SheetFooter className="pt-4 flex flex-col sm:flex-row justify-between gap-2">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDeleteTask}
            disabled={isLoading || isSaving || isDeleting}
            className="flex items-center gap-1"
          >
            <Trash2Icon className="h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleSaveTask}
              disabled={isLoading || isSaving || isDeleting}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default TaskDetail;
