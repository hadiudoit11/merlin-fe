"use client";

import { ProjectPipelineTable } from "@/components/projects/ProjectPipelineTable";

export default function ProjectPipelinePage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Project Pipeline</h1>
        <p className="text-muted-foreground">
          Track all projects across workflow stages
        </p>
      </div>
      <ProjectPipelineTable />
    </div>
  );
}
