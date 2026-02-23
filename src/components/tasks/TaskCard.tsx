"use client";

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  CalendarIcon,
  CheckSquare,
  MessageSquare,
  Paperclip,
  Pencil,
} from 'lucide-react';
import { format, differenceInHours, isPast } from 'date-fns';
import {
  Task,
  TaskLabel,
  LABEL_COLORS,
  getChecklistProgress,
  isDueSoon,
  DUE_DATE_STYLES,
  LabelColor,
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
  showStatus = false,
  showSource = false,
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  // Get checklist progress
  const checklistProgress = task.checklists
    ? getChecklistProgress(task.checklists)
    : { completed: 0, total: 0 };

  // Determine due date styling
  const getDueDateStyle = () => {
    if (!task.due_date) return null;
    if (task.status === 'completed') return DUE_DATE_STYLES.complete;
    if (task.is_overdue || isPast(new Date(task.due_date))) return DUE_DATE_STYLES.overdue;
    if (isDueSoon(task.due_date)) return DUE_DATE_STYLES.dueSoon;
    return DUE_DATE_STYLES.normal;
  };

  const dueDateStyle = getDueDateStyle();

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Sample labels for demo (in real app, these come from task.labels)
  const labels: TaskLabel[] = task.labels || [];

  // Has cover?
  const hasCover = task.cover && task.cover.type === 'color';
  const coverColor = hasCover ? task.cover!.value : null;
  const isFullCover = hasCover && task.cover!.size === 'full';

  return (
    <>
      <div
        className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-700"
        onClick={() => setIsSheetOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Card Cover */}
        {coverColor && (
          <div
            className={`w-full ${isFullCover ? 'h-14' : 'h-8'}`}
            style={{ backgroundColor: coverColor }}
          />
        )}

        {/* Quick Edit Button */}
        {isHovered && (
          <button
            className="absolute top-2 right-2 p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-gray-200 dark:hover:bg-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              setIsSheetOpen(true);
            }}
          >
            <Pencil className="h-3 w-3 text-gray-600 dark:text-gray-300" />
          </button>
        )}

        <div className="p-3">
          {/* Labels */}
          {labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {labels.slice(0, 6).map((label) => (
                <div
                  key={label.id}
                  className="h-2 rounded-full min-w-[40px] transition-all hover:h-4 flex items-center justify-center"
                  style={{
                    backgroundColor: LABEL_COLORS[label.color as LabelColor]?.bg || '#dfe1e6',
                  }}
                  title={label.name || LABEL_COLORS[label.color as LabelColor]?.name}
                >
                  {/* Label name appears on hover - CSS handles this */}
                </div>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug mb-2">
            {task.title}
          </h3>

          {/* Badges Row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Due Date Badge */}
              {task.due_date && dueDateStyle && (
                <div
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium"
                  style={{
                    backgroundColor: dueDateStyle.bg,
                    color: dueDateStyle.text,
                  }}
                >
                  <CalendarIcon className="h-3 w-3" />
                  <span>{format(new Date(task.due_date), 'MMM d')}</span>
                </div>
              )}

              {/* Checklist Progress */}
              {checklistProgress.total > 0 && (
                <div
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                    checklistProgress.completed === checklistProgress.total
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  <CheckSquare className="h-3 w-3" />
                  <span>
                    {checklistProgress.completed}/{checklistProgress.total}
                  </span>
                </div>
              )}

              {/* Attachment Count */}
              {task.attachment_count && task.attachment_count > 0 && (
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                  <Paperclip className="h-3 w-3" />
                  <span>{task.attachment_count}</span>
                </div>
              )}

              {/* Comment Count */}
              {task.comment_count && task.comment_count > 0 && (
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                  <MessageSquare className="h-3 w-3" />
                  <span>{task.comment_count}</span>
                </div>
              )}

              {/* Priority Badge (subtle) */}
              {task.priority === 'urgent' && (
                <Badge className="text-xs px-1.5 py-0 bg-red-500 text-white">
                  !
                </Badge>
              )}
              {task.priority === 'high' && (
                <Badge className="text-xs px-1.5 py-0 bg-orange-500 text-white">
                  !!
                </Badge>
              )}
            </div>

            {/* Assignee Avatar */}
            {task.assignee_name && (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0"
                style={{
                  backgroundColor: task.assignee_avatar ? 'transparent' : '#0079bf',
                }}
                title={task.assignee_name}
              >
                {task.assignee_avatar ? (
                  <img
                    src={task.assignee_avatar}
                    alt={task.assignee_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(task.assignee_name)
                )}
              </div>
            )}
          </div>

          {/* Tags - Show only if no labels */}
          {labels.length === 0 && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.slice(0, 3).map((tag, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="text-xs px-1.5 py-0 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                >
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 3 && (
                <Badge
                  variant="secondary"
                  className="text-xs px-1.5 py-0 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                >
                  +{task.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

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
