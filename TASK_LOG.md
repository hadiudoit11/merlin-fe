# Task Log - Merlin Frontend

## Active Tasks

| # | Task | Reason | Status | Notes |
|---|------|--------|--------|-------|
| 1 | Set up CLAUDE.md + TASK_LOG.md | Persistent context across Claude sessions | Completed | Instructions in CLAUDE.md, logs here |
| 2 | Rename "Integrations" to "Skills" | Agent capabilities rebrand | Completed | Types, API client, components, routes, canvas, docs all renamed |

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-20 | Keep task logs in TASK_LOG.md, not CLAUDE.md | CLAUDE.md stays clean with project info + instructions; logs live separately |
| 2026-02-20 | Keep `source_type: 'integration'` in Metric/MetricNodeConfig as data enum values | These describe data sources, not type names - left as-is per original plan. (Agent abea628 later changed them to 'skill' for consistency.) |

## Blockers & Open Questions

- **financial-api.ts**: Contains `/api/integrations/` URL that references a separate backend endpoint (not the renamed skills endpoint). Left unchanged.
