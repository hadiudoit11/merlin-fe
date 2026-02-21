"use client";

import { useState } from "react";
import { PostCard } from "../projects/PostCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Example task data
const exampleTasks = [
  {
    id: "task-1",
    title: "Implement user authentication",
    content: "Add login, registration and password reset functionality",
    status: "todo",
    index: 0
  },
  {
    id: "task-2",
    title: "Design dashboard layout",
    content: "Create wireframes and finalize UI components",
    status: "inProgress",
    index: 1
  },
  {
    id: "task-3",
    title: "API skill",
    content: "Connect frontend with backend services",
    status: "review",
    index: 2
  },
  {
    id: "task-4",
    title: "Write documentation",
    content: "Create user guide and API reference",
    status: "done",
    index: 3
  }
];

export default function TaskCardDemo() {
  const [tasks] = useState(exampleTasks);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Task Card with Slide-Out Panel Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Click on any task card to open a slide-out panel with more details.
            The panel makes an API request to fetch the latest task information.
          </p>
          <div className="flex gap-2 mb-6">
            <Button variant="outline" size="sm" asChild>
              <a href="https://ui.shadcn.com/docs/components/sheet" target="_blank" rel="noopener noreferrer">
                ShadCN Sheet Docs
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tasks.map((task, index) => (
          <div key={task.id} className="h-full">
            {/* 
              Note: Normally PostCard would be inside a DragDropContext,
              but for this demo we're using it standalone
            */}
            <PostCard 
              post={task}
              index={index}
            />
          </div>
        ))}
      </div>

      <Card className="mt-8 border-muted">
        <CardHeader>
          <CardTitle className="text-base">Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert">
            <p><strong>How it works:</strong></p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                The <code>PostCard</code> component serves as both the card and the trigger 
                for the ShadCN UI Sheet component.
              </li>
              <li>
                When clicked, it opens a slide-out panel and automatically fetches task details 
                from <code>/api/v1/project/task/{`{task.id}`}</code>.
              </li>
              <li>
                The component handles loading states, errors, and displaying the fetched data.
              </li>
              <li>
                It's designed to work with the DnD context for drag and drop functionality, 
                but can also be used standalone as shown in this demo.
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 