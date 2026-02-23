'use client';

/**
 * WorkflowTrackerPanel
 *
 * Slide-out right panel showing the 9-stage product development pipeline
 * for projects linked to the current canvas. Lets users advance stages,
 * view and action pending change proposals inline.
 *
 * Usage:
 *   <WorkflowTrackerPanel
 *     isOpen={isOpen}
 *     onClose={() => setOpen(false)}
 *     canvasId={canvasId}
 *   />
 */

import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  ChevronRight,
  ChevronDown,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  GitBranch,
  FolderOpen,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  workflowApi,
  WORKFLOW_STAGES,
  WorkflowStageKey,
  ProjectResponse,
  ProjectWithDetailsResponse,
  ChangeProposalResponse,
} from '@/lib/workflow-api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SEVERITY_STYLES: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

function stageIndex(key: WorkflowStageKey): number {
  return WORKFLOW_STAGES.findIndex((s) => s.key === key);
}

function nextStage(current: WorkflowStageKey): WorkflowStageKey | null {
  const idx = stageIndex(current);
  if (idx === -1 || idx === WORKFLOW_STAGES.length - 1) return null;
  return WORKFLOW_STAGES[idx + 1].key;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StageDot({ state }: { state: 'past' | 'current' | 'future' }) {
  if (state === 'past') {
    return (
      <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
        <Check className="h-3.5 w-3.5 text-white" />
      </div>
    );
  }
  if (state === 'current') {
    return (
      <div className="relative shrink-0">
        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    );
  }
  return (
    <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 shrink-0" />
  );
}

function ProposalRow({
  proposal,
  onApprove,
  onReject,
}: {
  proposal: ChangeProposalResponse;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = async () => {
    setLoading('approve');
    try {
      await onApprove(proposal.id);
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    setLoading('reject');
    try {
      await onReject(proposal.id);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-start gap-2 py-2">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium leading-tight truncate">{proposal.title}</p>
        <span
          className={cn(
            'inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded',
            SEVERITY_STYLES[proposal.severity] || SEVERITY_STYLES.low
          )}
        >
          {proposal.severity}
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
          onClick={handleApprove}
          disabled={loading !== null}
          title="Approve"
        >
          {loading === 'approve' ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
          onClick={handleReject}
          disabled={loading !== null}
          title="Reject"
        >
          {loading === 'reject' ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <XCircle className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

interface WorkflowTrackerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  canvasId: number;
}

export function WorkflowTrackerPanel({
  isOpen,
  onClose,
  canvasId,
}: WorkflowTrackerPanelProps) {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [projectDetails, setProjectDetails] = useState<ProjectWithDetailsResponse | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [advancingStage, setAdvancingStage] = useState(false);
  const [proposalsOpen, setProposalsOpen] = useState(true);

  // Fetch project list when panel opens
  useEffect(() => {
    if (!isOpen) return;
    setLoadingProjects(true);
    workflowApi
      .listProjects(canvasId)
      .then((data) => {
        setProjects(data);
        if (data.length > 0 && selectedProjectId === null) {
          setSelectedProjectId(data[0].id);
        }
      })
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoadingProjects(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, canvasId]);

  // Fetch project details when selection changes
  const loadDetails = useCallback(
    (projectId: number) => {
      setLoadingDetails(true);
      workflowApi
        .getProjectDetails(projectId)
        .then(setProjectDetails)
        .catch(() => toast.error('Failed to load project details'))
        .finally(() => setLoadingDetails(false));
    },
    []
  );

  useEffect(() => {
    if (selectedProjectId !== null) {
      loadDetails(selectedProjectId);
    }
  }, [selectedProjectId, loadDetails]);

  const handleAdvanceStage = async () => {
    if (!projectDetails) return;
    const next = nextStage(projectDetails.current_stage);
    if (!next) return;

    setAdvancingStage(true);
    try {
      await workflowApi.transitionStage(projectDetails.id, next);
      toast.success(`Moved to ${WORKFLOW_STAGES.find((s) => s.key === next)?.label}`);
      loadDetails(projectDetails.id);
    } catch {
      toast.error('Failed to advance stage');
    } finally {
      setAdvancingStage(false);
    }
  };

  const handleApprove = async (proposalId: number) => {
    try {
      await workflowApi.approveProposal(proposalId);
      toast.success('Proposal approved');
      if (selectedProjectId !== null) loadDetails(selectedProjectId);
    } catch {
      toast.error('Failed to approve proposal');
    }
  };

  const handleReject = async (proposalId: number) => {
    try {
      await workflowApi.rejectProposal(proposalId, 'Rejected via Workflow panel');
      toast.success('Proposal rejected');
      if (selectedProjectId !== null) loadDetails(selectedProjectId);
    } catch {
      toast.error('Failed to reject proposal');
    }
  };

  const currentStageIdx = projectDetails
    ? stageIndex(projectDetails.current_stage)
    : -1;

  const nextStageMeta = projectDetails
    ? WORKFLOW_STAGES.find((s) => s.key === nextStage(projectDetails.current_stage))
    : null;

  const pendingProposals = (projectDetails?.pending_proposals ?? []).filter(
    (p) => p.status === 'pending' || p.status === 'under_review'
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className={cn(
        'fixed top-0 right-0 h-screen w-80 bg-background border-l border-border shadow-2xl z-[70]',
        'transition-transform duration-200 ease-out flex flex-col',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-teal-500" />
          <span className="font-semibold text-sm">Workflow</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={() => {
              if (selectedProjectId !== null) loadDetails(selectedProjectId);
            }}
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Project selector */}
      {loadingProjects ? (
        <div className="px-4 py-3 border-b border-border shrink-0">
          <div className="h-9 rounded-md bg-muted animate-pulse" />
        </div>
      ) : projects.length === 0 ? (
        <div className="px-4 py-6 flex flex-col items-center gap-2 text-center text-muted-foreground border-b border-border shrink-0">
          <FolderOpen className="h-8 w-8 opacity-40" />
          <p className="text-xs">No projects on this canvas yet.</p>
          <p className="text-xs">Ask the Merlin agent to create a project.</p>
        </div>
      ) : projects.length > 1 ? (
        <div className="px-4 py-3 border-b border-border shrink-0">
          <Select
            value={String(selectedProjectId ?? '')}
            onValueChange={(v) => setSelectedProjectId(Number(v))}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="px-4 py-2.5 border-b border-border shrink-0">
          <p className="text-xs text-muted-foreground">Project</p>
          <p className="text-sm font-medium truncate">{projects[0]?.name}</p>
        </div>
      )}

      {/* Main content */}
      <ScrollArea className="flex-1">
        {loadingDetails ? (
          <div className="px-4 py-6 space-y-3">
            {WORKFLOW_STAGES.map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="h-4 flex-1 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : projectDetails ? (
          <div className="py-4">
            {/* Stage stepper */}
            <div className="px-4 mb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Stages
              </p>
            </div>
            <div className="px-4 space-y-0.5">
              <AnimatePresence initial={false}>
                {WORKFLOW_STAGES.map((stage, i) => {
                  const state =
                    i < currentStageIdx
                      ? 'past'
                      : i === currentStageIdx
                      ? 'current'
                      : 'future';
                  return (
                    <motion.div
                      key={stage.key}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.15 }}
                      className={cn(
                        'flex items-center gap-3 px-2 py-2 rounded-lg transition-colors',
                        state === 'current' && 'bg-primary/5',
                        state === 'past' && 'opacity-70'
                      )}
                    >
                      {/* Connector line above (except first) */}
                      <div className="flex flex-col items-center">
                        <StageDot state={state} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className={cn(
                            'text-sm',
                            state === 'current' && 'font-semibold text-primary',
                            state === 'past' && 'text-muted-foreground line-through',
                            state === 'future' && 'text-muted-foreground'
                          )}
                        >
                          {stage.label}
                        </span>
                      </div>
                      {state === 'current' && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 shrink-0 bg-primary/10 text-primary border-primary/20"
                        >
                          Current
                        </Badge>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Advance stage button */}
            {nextStageMeta && (
              <div className="px-4 mt-4">
                <Button
                  className="w-full gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0"
                  onClick={handleAdvanceStage}
                  disabled={advancingStage}
                >
                  {advancingStage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  Advance to {nextStageMeta.label}
                </Button>
              </div>
            )}

            {currentStageIdx === WORKFLOW_STAGES.length - 1 && (
              <div className="px-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 rounded-lg px-3 py-2">
                  <Check className="h-4 w-4" />
                  <span>All stages complete</span>
                </div>
              </div>
            )}

            <Separator className="my-4" />

            {/* Pending change proposals */}
            <div className="px-4">
              <button
                className="flex items-center gap-2 w-full text-left mb-2"
                onClick={() => setProposalsOpen((p) => !p)}
              >
                {proposalsOpen ? (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Pending Changes
                </span>
                {pendingProposals.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="text-[10px] px-1.5 py-0 h-4 ml-auto"
                  >
                    {pendingProposals.length}
                  </Badge>
                )}
              </button>

              <AnimatePresence>
                {proposalsOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    {pendingProposals.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">
                        No pending change proposals.
                      </p>
                    ) : (
                      <div className="divide-y divide-border">
                        {pendingProposals.map((proposal) => (
                          <ProposalRow
                            key={proposal.id}
                            proposal={proposal}
                            onApprove={handleApprove}
                            onReject={handleReject}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Artifacts section */}
            {projectDetails.artifacts.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="px-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Documents
                  </p>
                  <div className="space-y-1">
                    {projectDetails.artifacts.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-2 text-xs text-muted-foreground py-1"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                        <span className="truncate flex-1">{a.name}</span>
                        <span className="text-[10px] uppercase shrink-0 opacity-60">
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : projects.length > 0 ? (
          <div className="px-4 py-6 flex items-center justify-center text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading...
          </div>
        ) : null}
      </ScrollArea>
    </div>
  );
}
