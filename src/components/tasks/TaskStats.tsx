"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
  Circle,
} from 'lucide-react';
import { TaskStats as TaskStatsType } from '@/types/task';

interface TaskStatsProps {
  stats: TaskStatsType;
}

const TaskStats: React.FC<TaskStatsProps> = ({ stats }) => {
  const completionRate = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  const statItems = [
    {
      label: 'Total',
      value: stats.total,
      icon: ListTodo,
      color: 'text-foreground',
    },
    {
      label: 'To Do',
      value: stats.pending,
      icon: Circle,
      color: 'text-gray-500',
    },
    {
      label: 'In Progress',
      value: stats.in_progress,
      icon: Clock,
      color: 'text-blue-500',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      color: 'text-green-500',
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      icon: AlertCircle,
      color: 'text-red-500',
    },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {statItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <item.icon className={`h-4 w-4 ${item.color}`} />
                <div className="text-sm">
                  <span className="font-medium">{item.value}</span>
                  <span className="text-muted-foreground ml-1">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Completion</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskStats;
