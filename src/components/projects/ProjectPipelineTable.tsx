"use client";

import { useEffect, useState } from "react";
import { Check, Circle, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { workflowApi, WORKFLOW_STAGES, ProjectResponse, WorkflowStageKey } from "@/lib/workflow-api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface ProjectWithStageIndex extends ProjectResponse {
  stageIndex: number;
}

export function ProjectPipelineTable() {
  const [projects, setProjects] = useState<ProjectWithStageIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all projects (no canvas filter)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/projects/`,
        {
          headers: {
            Authorization: `Bearer ${(await import("next-auth/react").then(m => m.getSession()))?.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data: ProjectResponse[] = await response.json();

      // Calculate stage index for each project
      const projectsWithIndex = data.map((project) => ({
        ...project,
        stageIndex: WORKFLOW_STAGES.findIndex((s) => s.key === project.current_stage),
      }));

      setProjects(projectsWithIndex);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const getStageStatus = (projectStageIndex: number, stageIndex: number) => {
    if (stageIndex < projectStageIndex) return "completed";
    if (stageIndex === projectStageIndex) return "current";
    return "pending";
  };

  const statusColors: Record<string, string> = {
    planning: "bg-blue-500/20 text-blue-400",
    active: "bg-green-500/20 text-green-400",
    on_hold: "bg-amber-500/20 text-amber-400",
    completed: "bg-emerald-500/20 text-emerald-400",
    cancelled: "bg-red-500/20 text-red-400",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-destructive">Error: {error}</p>
        <Button variant="outline" onClick={fetchProjects}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground">
        <p>No projects found</p>
        <p className="text-sm">Create a project from a canvas to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Project Pipeline</h2>
          <p className="text-sm text-muted-foreground">
            {projects.length} project{projects.length !== 1 ? "s" : ""} across all stages
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchProjects}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[200px] font-semibold">Project</TableHead>
                <TableHead className="w-[100px] font-semibold">Status</TableHead>
                {WORKFLOW_STAGES.map((stage, idx) => (
                  <TableHead
                    key={stage.key}
                    className="text-center min-w-[80px] font-semibold"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs">{stage.label}</span>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="truncate max-w-[180px]">{project.name}</span>
                      {project.canvas_id && (
                        <span className="text-xs text-muted-foreground">
                          Canvas #{project.canvas_id}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn("text-xs", statusColors[project.status])}
                    >
                      {project.status}
                    </Badge>
                  </TableCell>
                  {WORKFLOW_STAGES.map((stage, stageIdx) => {
                    const status = getStageStatus(project.stageIndex, stageIdx);
                    return (
                      <TableCell key={stage.key} className="text-center">
                        {status === "completed" && (
                          <div className="flex justify-center">
                            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                              <Check className="w-4 h-4 text-green-500" />
                            </div>
                          </div>
                        )}
                        {status === "current" && (
                          <div className="flex justify-center">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
                              <Circle className="w-3 h-3 text-white fill-white" />
                            </div>
                          </div>
                        )}
                        {status === "pending" && (
                          <div className="flex justify-center">
                            <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                              <Circle className="w-2 h-2 text-muted-foreground/30" />
                            </div>
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    {project.canvas_id && (
                      <Link href={`/canvas/${project.canvas_id}`}>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Stage Summary */}
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
        {WORKFLOW_STAGES.map((stage) => {
          const count = projects.filter((p) => p.current_stage === stage.key).length;
          return (
            <div
              key={stage.key}
              className={cn(
                "rounded-lg border p-3 text-center transition-colors",
                count > 0 ? "bg-primary/5 border-primary/20" : "bg-muted/30"
              )}
            >
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-xs text-muted-foreground truncate">{stage.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
