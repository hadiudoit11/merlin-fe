# Typequest Implementation Plan

## Executive Summary

This document outlines the comprehensive implementation plan to transform Merlin-fe into the full Typequest vision - a Product Manager's Command Center that visualizes the entire agile development lifecycle.

**Current State:** ~70% complete core features
**Target State:** Full product management platform with integrations, timeline, and AI-powered workflows

---

## Gap Analysis: Vision vs Current State

### Currently Complete (Green)

| Feature | Status | Notes |
|---------|--------|-------|
| Infinite Canvas | Complete | Pan/zoom, grid, snap-to-grid |
| Node System | Complete | 13 node types, drag-drop, resize |
| Connection Lines | Complete | SVG paths with anchors |
| Rich-Text Documents | Complete | Tiptap with full toolbar |
| Kanban Task Board | Complete | Drag-drop, filtering |
| OKR Dashboard | Complete | Metrics, progress bars, charts |
| Agent Builder | Complete | Multi-step wizard |
| Organization Management | Complete | Users, roles, invites |
| Authentication | Complete | NextAuth, Auth0, Google |
| Real-Time Collaboration | Complete | Liveblocks (optional) |
| Theme System | Complete | Light/dark mode |

### Partially Complete (Yellow)

| Feature | Current State | Gap |
|---------|---------------|-----|
| Confluence Integration | Types + API skeleton | Need full sync UI, page editor |
| Documents Page | Space browser | Need page hierarchy editor |
| API Tokens Page | Route exists | Need UI for generating tokens |
| Billing Page | Route exists | Need Stripe integration |
| Roles Permissions | List view | Need matrix editor |

### Missing (Red) - From Vision

| Feature | Priority | Complexity |
|---------|----------|------------|
| **Dashboard Home** | High | Medium |
| **Timeline View** | High | High |
| **Sprint Cockpit** | High | High |
| **Meeting Intelligence Hub** | Medium | High |
| **Decision Log** | Medium | Medium |
| **Stakeholder Map** | Medium | Medium |
| **Research Repository** | Medium | High |
| **Roadmap Canvas** | High | Medium |
| **Integration Command Center** | High | Medium |
| **AI Strategy Advisor** | Medium | High |
| **Canvas Templates Gallery** | Low | Low |
| **Jira Integration** | High | High |
| **Slack Integration** | Medium | Medium |
| **Linear Integration** | Low | Medium |

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Goal:** Complete core missing pages and fix partial implementations

#### 1.1 Dashboard Home (`/home`)
**Priority: HIGH** | Complexity: Medium

Current: Redirects to /canvas
Target: Rich dashboard with widgets

```
┌─────────────────────────────────────────────────────────────┐
│  Good morning, [User]!                                      │
│  Here's what needs your attention today.                    │
├─────────────────┬───────────────────────────────────────────┤
│  RECENT CANVASES│  TASKS DUE TODAY                          │
│  ┌───┐ ┌───┐    │  ☐ Review PRD for Q1 launch              │
│  │ A │ │ B │    │  ☐ Update metrics dashboard              │
│  └───┘ └───┘    │  ☐ Respond to stakeholder feedback       │
├─────────────────┼───────────────────────────────────────────┤
│  UPCOMING       │  TEAM ACTIVITY                            │
│  MEETINGS       │                                           │
│  10:00 Standup  │  Sarah created "Mobile App PRD"          │
│  14:00 Sprint   │  Mike moved Task to Done                 │
│  Review         │  Alex commented on OKR                    │
├─────────────────┴───────────────────────────────────────────┤
│  QUICK ACTIONS                                              │
│  [+ New Canvas] [+ New Task] [+ New Doc] [Import Meeting]  │
└─────────────────────────────────────────────────────────────┘
```

Components to create:
- `DashboardHome.tsx` - Main page component
- `RecentCanvasesWidget.tsx` - 3-4 recent canvases
- `TasksDueTodayWidget.tsx` - Today's tasks
- `UpcomingMeetingsWidget.tsx` - Calendar integration
- `TeamActivityFeed.tsx` - Recent activity
- `QuickActionsBar.tsx` - Common actions

API needed:
- `GET /api/v1/dashboard/summary` - Aggregated dashboard data

#### 1.2 API Tokens Page (`/settings/api-tokens`)
**Priority: HIGH** | Complexity: Low

Current: Empty route
Target: Token management UI

Features:
- Generate new API tokens
- List existing tokens (masked)
- Revoke tokens
- Copy to clipboard
- Token permissions (read, write, admin)
- Integration with MCP setup

Components:
- `APITokensPage.tsx`
- `TokenList.tsx`
- `CreateTokenDialog.tsx`
- `TokenPermissions.tsx`

#### 1.3 Integration Command Center (`/integrations`)
**Priority: HIGH** | Complexity: Medium

Current: Scattered integration UIs
Target: Unified integration hub

```
┌─────────────────────────────────────────────────────────────┐
│  INTEGRATIONS                          [+ Connect New]      │
├─────────────────────────────────────────────────────────────┤
│  CONNECTED                                                  │
│  ┌──────────────────┐ ┌──────────────────┐                 │
│  │ 🔵 Jira          │ │ 📄 Confluence    │                 │
│  │ Healthy • 2m ago │ │ Syncing • 1m ago │                 │
│  │ 47 issues synced │ │ 12 spaces        │                 │
│  │ [Settings] [Logs]│ │ [Settings] [Logs]│                 │
│  └──────────────────┘ └──────────────────┘                 │
│                                                             │
│  AVAILABLE                                                  │
│  ┌──────────────────┐ ┌──────────────────┐                 │
│  │ 💬 Slack         │ │ 📹 Zoom          │                 │
│  │ Not connected    │ │ Not connected    │                 │
│  │ [Connect]        │ │ [Connect]        │                 │
│  └──────────────────┘ └──────────────────┘                 │
├─────────────────────────────────────────────────────────────┤
│  DATA FLOW VISUALIZATION                                    │
│  Zoom → Transcripts → Tasks → Canvas                       │
│  Jira → Issues ←→ Tasks                                    │
│  Confluence → Docs → Canvas Nodes                          │
└─────────────────────────────────────────────────────────────┘
```

Components:
- `IntegrationsPage.tsx`
- `IntegrationCard.tsx` - Status, health, actions
- `IntegrationSetupDialog.tsx` - OAuth flow
- `IntegrationLogs.tsx` - Sync history
- `DataFlowDiagram.tsx` - Visual data flow

---

### Phase 2: Agile Lifecycle (Week 3-4)
**Goal:** Add timeline and sprint management

#### 2.1 Timeline View (`/timeline`)
**Priority: HIGH** | Complexity: High

Purpose: Horizontal timeline showing initiative lifecycle stages

```
┌─────────────────────────────────────────────────────────────┐
│  TIMELINE                    Q1 2024 ◀ ● ▶ Q2 2024         │
├─────────────────────────────────────────────────────────────┤
│         │ Discovery │ Definition │ Design │ Dev │ Launch │  │
│  ───────┼───────────┼────────────┼────────┼─────┼────────┼  │
│  Mobile │ ████████  │            │        │     │        │  │
│  App    │ ████████  │            │        │     │        │  │
│  ───────┼───────────┼────────────┼────────┼─────┼────────┼  │
│  API    │           │ ████████████████████│     │        │  │
│  v2     │           │ ████████████████████│     │        │  │
│  ───────┼───────────┼────────────┼────────┼─────┼────────┼  │
│  Auth   │           │            │ ████████████████████  │  │
│  Rewrite│           │            │ ████████████████████  │  │
└─────────────────────────────────────────────────────────────┘
```

Components:
- `TimelinePage.tsx` - Main view
- `TimelineHeader.tsx` - Date navigation, zoom
- `TimelineRow.tsx` - Single initiative row
- `TimelineStage.tsx` - Stage block (draggable)
- `TimelineLegend.tsx` - Stage color legend
- `InitiativeDetailPanel.tsx` - Slide-out details

Features:
- Drag initiatives between stages
- Zoom in/out (week/month/quarter view)
- Filter by team, status, owner
- Click to jump to canvas
- Dependencies (arrows between items)

Data Model:
```typescript
interface Initiative {
  id: number;
  name: string;
  description: string;
  canvas_id: number;
  objective_node_id?: number;
  current_stage: 'discovery' | 'definition' | 'design' | 'development' | 'testing' | 'launch';
  stage_history: StageTransition[];
  start_date: string;
  target_date?: string;
  owner_id: number;
  team_id?: number;
  dependencies: number[]; // Other initiative IDs
}

interface StageTransition {
  from_stage: string;
  to_stage: string;
  timestamp: string;
  user_id: number;
}
```

API:
- `GET /api/v1/initiatives/` - List all initiatives
- `POST /api/v1/initiatives/` - Create initiative
- `PUT /api/v1/initiatives/{id}/stage` - Move to stage
- `GET /api/v1/initiatives/timeline` - Timeline data with date ranges

#### 2.2 Sprint Cockpit (`/sprints`)
**Priority: HIGH** | Complexity: High

Purpose: Live sprint dashboard for standups and sprint health

```
┌─────────────────────────────────────────────────────────────┐
│  SPRINT COCKPIT            Sprint 24 • Jan 15 - Jan 29     │
│                            [◀ Previous] [Next ▶]           │
├──────────────────────┬──────────────────────────────────────┤
│  VELOCITY            │  BURNDOWN                            │
│  ████████████ 34pts  │  ╲                                   │
│  Target: 40pts       │   ╲___                               │
│  Trend: ↑ 12%        │       ╲___                           │
├──────────────────────┼──────────────────────────────────────┤
│  AT RISK (3)         │  TEAM CAPACITY                       │
│  🔴 API endpoint     │  Sarah   ████████░░ 80%              │
│     blocked 2d       │  Mike    ██████████ 100%             │
│  🟡 Design review    │  Alex    ██████░░░░ 60% (PTO)       │
│     waiting 1d       │  Jordan  ████████░░ 80%              │
├──────────────────────┴──────────────────────────────────────┤
│  STANDUP VIEW                                   [Copy]      │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ IN PROGRESS                                             ││
│  │ • API endpoint refactor (Mike) - blocked by DevOps     ││
│  │ • Mobile auth flow (Sarah) - on track                  ││
│  │ DONE YESTERDAY                                          ││
│  │ • Landing page redesign (Alex)                         ││
│  │ UP NEXT                                                 ││
│  │ • Integration tests (Jordan)                           ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

Components:
- `SprintCockpitPage.tsx`
- `SprintSelector.tsx` - Sprint navigation
- `VelocityCard.tsx` - Current velocity vs target
- `BurndownChart.tsx` - Recharts burndown
- `AtRiskItems.tsx` - Blocked/waiting items
- `TeamCapacity.tsx` - Member capacity bars
- `StandupView.tsx` - Formatted standup notes
- `SprintGoals.tsx` - Sprint objectives

Data Sources:
- Tasks (from Jira sync or manual)
- Team members (organization)
- Sprint definitions (new model)

---

### Phase 3: Intelligence Layer (Week 5-6)
**Goal:** Add meeting intelligence and decision tracking

#### 3.1 Meeting Intelligence Hub (`/meetings`)
**Priority: MEDIUM** | Complexity: High

Purpose: Central place for meeting insights and action items

```
┌─────────────────────────────────────────────────────────────┐
│  MEETINGS                               [Import Meeting]    │
├─────────────────────────────────────────────────────────────┤
│  UPCOMING                                                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 📹 Sprint Planning          Today 2:00 PM              ││
│  │    Suggested Topics:                                    ││
│  │    • Review blocked items from Sprint 23               ││
│  │    • Capacity planning for Q1 launch                   ││
│  │    [Join Meeting] [Add Agenda Item]                    ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  RECENT MEETINGS                        [Filter] [Search]   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 📹 Product Review           Yesterday                   ││
│  │    📊 Meeting ROI: 8.5/10 (4 decisions, 3 action items)││
│  │    Key Decisions:                                       ││
│  │    • Approved mobile app scope                         ││
│  │    • Delayed API v2 to Q2                              ││
│  │    Action Items: [View 3 tasks created]                ││
│  │    [View Transcript] [View Summary]                    ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 💬 Design Sync               2 days ago                 ││
│  │    📊 Meeting ROI: 6.0/10 (1 decision, 5 action items) ││
│  │    ...                                                  ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  MEETING ANALYTICS                                          │
│  Total Meetings This Month: 24                              │
│  Avg ROI Score: 7.2/10                                     │
│  Action Items Created: 47 (38 completed)                   │
│  Time in Meetings: 18.5 hours                              │
└─────────────────────────────────────────────────────────────┘
```

Components:
- `MeetingsPage.tsx`
- `UpcomingMeetings.tsx` - Calendar integration
- `MeetingCard.tsx` - Meeting summary card
- `MeetingDetail.tsx` - Full meeting view
- `MeetingTranscript.tsx` - Transcript viewer
- `MeetingROIScore.tsx` - ROI calculation
- `MeetingAnalytics.tsx` - Monthly stats
- `AgendaSuggestions.tsx` - AI-powered suggestions

Meeting ROI Formula:
```
ROI = (decisions_made * 2 + action_items_created * 1.5 + blockers_resolved * 2)
      / (duration_minutes / 15)
      * attendance_quality_factor
```

#### 3.2 Decision Log (`/decisions`)
**Priority: MEDIUM** | Complexity: Medium

Purpose: Chronological log of all product decisions

```
┌─────────────────────────────────────────────────────────────┐
│  DECISION LOG                      [+ Record Decision]      │
├─────────────────────────────────────────────────────────────┤
│  FILTER: [All] [This Month] [My Decisions] [Needs Review]  │
├─────────────────────────────────────────────────────────────┤
│  Jan 15, 2024                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ✅ Approved mobile app scope for Q1                     ││
│  │    Made by: Sarah Chen • In: Product Review             ││
│  │    Linked to: [Mobile App OKR]                         ││
│  │    Alternatives considered:                             ││
│  │    • Full feature parity (rejected: too ambitious)     ││
│  │    • MVP only (rejected: not enough value)             ││
│  │    [View Context] [Flag for Review]                    ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ⏸️ Delayed API v2 to Q2 (NEEDS REVIEW)                  ││
│  │    Made by: Mike Johnson • In: Product Review           ││
│  │    ⚠️ Review suggested: 30 days since decision         ││
│  │    [Review Now] [Snooze]                               ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  Jan 10, 2024                                               │
│  ...                                                        │
└─────────────────────────────────────────────────────────────┘
```

Data Model:
```typescript
interface Decision {
  id: number;
  title: string;
  description: string;
  outcome: 'approved' | 'rejected' | 'deferred' | 'needs_review';
  made_by: number; // user_id
  made_in: 'meeting' | 'async' | 'document';
  source_id?: number; // meeting_id, document_id, etc.
  linked_nodes: number[]; // canvas node IDs
  alternatives: Alternative[];
  created_at: string;
  review_date?: string;
  tags: string[];
}

interface Alternative {
  title: string;
  rejected_reason: string;
}
```

---

### Phase 4: Advanced Features (Week 7-8)
**Goal:** Add research, roadmaps, and advanced AI

#### 4.1 Roadmap Canvas (`/roadmap`)
**Priority: HIGH** | Complexity: Medium

Special canvas view optimized for roadmap planning

```
┌─────────────────────────────────────────────────────────────┐
│  ROADMAP: Q1 2024                  [Share] [Export] [Edit] │
├─────────────────────────────────────────────────────────────┤
│     NOW (Jan)     │    NEXT (Feb)    │    LATER (Mar+)    │
├───────────────────┼──────────────────┼────────────────────┤
│  ┌─────────────┐  │  ┌────────────┐  │  ┌──────────────┐  │
│  │ Mobile App  │  │  │ API v2     │  │  │ AI Features  │  │
│  │ Launch      │  │  │            │  │  │              │  │
│  │ 🔴 At Risk  │  │  │ 🟢 On Track│  │  │ 🔵 Planned   │  │
│  │ ████████░░  │  │  │ ██████░░░░ │  │  │ ░░░░░░░░░░  │  │
│  └─────────────┘  │  └────────────┘  │  └──────────────┘  │
│  ┌─────────────┐  │  ┌────────────┐  │                    │
│  │ Auth        │  │  │ Analytics  │  │                    │
│  │ Rewrite     │  │  │ Dashboard  │  │                    │
│  │ 🟢 On Track │  │  │ 🟡 Blocked │  │                    │
│  │ ██████████  │  │  │ ████░░░░░░ │  │                    │
│  └─────────────┘  │  └────────────┘  │                    │
├───────────────────┴──────────────────┴────────────────────┤
│  CAPACITY: Team at 85% capacity  │  DEPENDENCIES: 3 items │
└─────────────────────────────────────────────────────────────┘
```

Features:
- Now/Next/Later columns (draggable)
- Status indicators (on track, at risk, blocked)
- Progress bars from linked OKRs
- Capacity indicator
- Dependency visualization
- Stakeholder visibility filter
- Export to image/PDF

#### 4.2 Research Repository (`/research`)
**Priority: MEDIUM** | Complexity: High

Central hub for user research

```
┌─────────────────────────────────────────────────────────────┐
│  RESEARCH                              [Import] [+ Study]   │
├─────────────────────────────────────────────────────────────┤
│  INSIGHTS OVERVIEW                                          │
│  47 Insights from 23 Studies • 156 Interview Hours         │
├─────────────────────────────────────────────────────────────┤
│  TOP PATTERNS                          Evidence Strength    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 🔥 Users want mobile access              ████████ 12   ││
│  │    Linked to: [Mobile App Problem]                      ││
│  ├─────────────────────────────────────────────────────────┤│
│  │ 📊 Dashboard is confusing                 ██████░░ 8    ││
│  │    Linked to: [Analytics Redesign]                      ││
│  ├─────────────────────────────────────────────────────────┤│
│  │ ⏱️ Onboarding takes too long             █████░░░ 6    ││
│  │    Not linked to any initiative                        ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  RECENT STUDIES                                             │
│  📹 User Interviews - Mobile App (Jan 2024) • 8 sessions   │
│  📋 Survey - NPS Q4 (Dec 2023) • 234 responses             │
│  🧪 Usability Test - Checkout (Nov 2023) • 5 sessions      │
└─────────────────────────────────────────────────────────────┘
```

Data Model:
```typescript
interface ResearchStudy {
  id: number;
  name: string;
  type: 'interview' | 'survey' | 'usability_test' | 'analytics' | 'other';
  description: string;
  session_count: number;
  participant_count: number;
  created_at: string;
  insights: Insight[];
  raw_data_url?: string; // Link to Dovetail, Grain, etc.
}

interface Insight {
  id: number;
  study_id: number;
  title: string;
  description: string;
  evidence_count: number;
  evidence_quotes: string[];
  tags: string[];
  linked_nodes: number[]; // Canvas node IDs
  created_at: string;
}
```

#### 4.3 AI Strategy Advisor (Enhanced Agent)
**Priority: MEDIUM** | Complexity: High

Enhanced AI that understands full canvas context

New capabilities:
1. **Suggest Missing Key Results** - Analyze objectives, suggest KRs based on industry benchmarks
2. **Identify Conflicting Priorities** - Detect resource conflicts, timeline overlaps
3. **Recommend Metrics** - Suggest metrics based on node type and content
4. **Generate Weekly Summaries** - Auto-create strategy updates
5. **Competitive Analysis** - Compare strategy to market trends

Implementation:
- Extend `CanvasAgentPanel.tsx` with new tools
- Add MCP tools for strategy analysis
- Create prompt templates for each capability
- Add canvas context serialization

---

### Phase 5: Integrations (Week 9-10)
**Goal:** Complete external tool integrations

#### 5.1 Jira Integration
**Priority: HIGH** | Complexity: High

Features:
- OAuth connection flow
- Two-way issue sync
- Create issues from canvas
- Import epics as objectives
- Status mapping
- Sprint sync
- JQL query import

Implementation:
- Complete `/lib/jira-api.ts`
- Add Jira components to integrations page
- Implement webhook handlers (backend)
- Create issue-to-node mapping

#### 5.2 Slack Integration
**Priority: MEDIUM** | Complexity: Medium

Features:
- OAuth connection
- Post canvas updates to channels
- Create tasks from messages
- Receive notifications
- Thread-to-decision linking

#### 5.3 Zoom Integration (Complete)
**Priority: COMPLETE** | Already implemented

Current state:
- OAuth flow
- Recording import
- Transcript processing
- Task extraction

Improvements needed:
- Auto-import setting
- Better transcript UI
- Meeting suggestions based on canvas

---

## Database Migrations Needed

### New Tables

```sql
-- Initiatives (for timeline)
CREATE TABLE initiatives (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  canvas_id INTEGER REFERENCES canvases(id),
  objective_node_id INTEGER REFERENCES nodes(id),
  current_stage VARCHAR(50) NOT NULL DEFAULT 'discovery',
  start_date DATE,
  target_date DATE,
  owner_id INTEGER REFERENCES users(id),
  organization_id INTEGER REFERENCES organizations(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Stage transitions
CREATE TABLE stage_transitions (
  id SERIAL PRIMARY KEY,
  initiative_id INTEGER REFERENCES initiatives(id),
  from_stage VARCHAR(50),
  to_stage VARCHAR(50) NOT NULL,
  user_id INTEGER REFERENCES users(id),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Decisions
CREATE TABLE decisions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  outcome VARCHAR(50) NOT NULL,
  made_by INTEGER REFERENCES users(id),
  made_in VARCHAR(50),
  source_id INTEGER,
  review_date DATE,
  organization_id INTEGER REFERENCES organizations(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Decision alternatives
CREATE TABLE decision_alternatives (
  id SERIAL PRIMARY KEY,
  decision_id INTEGER REFERENCES decisions(id),
  title VARCHAR(255),
  rejected_reason TEXT
);

-- Decision node links
CREATE TABLE decision_nodes (
  decision_id INTEGER REFERENCES decisions(id),
  node_id INTEGER REFERENCES nodes(id),
  PRIMARY KEY (decision_id, node_id)
);

-- Research studies
CREATE TABLE research_studies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  session_count INTEGER DEFAULT 0,
  participant_count INTEGER DEFAULT 0,
  raw_data_url TEXT,
  organization_id INTEGER REFERENCES organizations(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insights
CREATE TABLE insights (
  id SERIAL PRIMARY KEY,
  study_id INTEGER REFERENCES research_studies(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  evidence_count INTEGER DEFAULT 0,
  evidence_quotes JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insight node links
CREATE TABLE insight_nodes (
  insight_id INTEGER REFERENCES insights(id),
  node_id INTEGER REFERENCES nodes(id),
  PRIMARY KEY (insight_id, node_id)
);

-- Meetings (for meeting intelligence)
CREATE TABLE meetings (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  source VARCHAR(50) NOT NULL, -- 'zoom', 'google_meet', 'manual'
  external_id VARCHAR(255),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  duration_minutes INTEGER,
  transcript TEXT,
  summary TEXT,
  key_points JSONB DEFAULT '[]',
  roi_score DECIMAL(3,1),
  organization_id INTEGER REFERENCES organizations(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Meeting decisions (link decisions to meetings)
ALTER TABLE decisions ADD COLUMN meeting_id INTEGER REFERENCES meetings(id);

-- Sprints
CREATE TABLE sprints (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  goal TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  velocity_target INTEGER,
  velocity_actual INTEGER,
  status VARCHAR(50) DEFAULT 'planning',
  organization_id INTEGER REFERENCES organizations(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sprint tasks
ALTER TABLE tasks ADD COLUMN sprint_id INTEGER REFERENCES sprints(id);
ALTER TABLE tasks ADD COLUMN story_points INTEGER;
```

---

## API Endpoints Needed

### Dashboard
- `GET /api/v1/dashboard/summary` - Aggregated dashboard data

### Initiatives (Timeline)
- `GET /api/v1/initiatives/` - List initiatives
- `POST /api/v1/initiatives/` - Create initiative
- `GET /api/v1/initiatives/{id}` - Get initiative
- `PUT /api/v1/initiatives/{id}` - Update initiative
- `PUT /api/v1/initiatives/{id}/stage` - Move to stage
- `GET /api/v1/initiatives/timeline` - Timeline view data

### Decisions
- `GET /api/v1/decisions/` - List decisions
- `POST /api/v1/decisions/` - Create decision
- `GET /api/v1/decisions/{id}` - Get decision
- `PUT /api/v1/decisions/{id}` - Update decision
- `POST /api/v1/decisions/{id}/link/{node_id}` - Link to node

### Research
- `GET /api/v1/research/studies` - List studies
- `POST /api/v1/research/studies` - Create study
- `GET /api/v1/research/studies/{id}` - Get study
- `GET /api/v1/research/insights` - List insights
- `POST /api/v1/research/insights` - Create insight
- `POST /api/v1/research/insights/{id}/link/{node_id}` - Link to node

### Meetings
- `GET /api/v1/meetings/` - List meetings
- `POST /api/v1/meetings/` - Create meeting
- `GET /api/v1/meetings/{id}` - Get meeting
- `GET /api/v1/meetings/upcoming` - Upcoming meetings
- `POST /api/v1/meetings/{id}/suggest-agenda` - AI agenda suggestions

### Sprints
- `GET /api/v1/sprints/` - List sprints
- `POST /api/v1/sprints/` - Create sprint
- `GET /api/v1/sprints/{id}` - Get sprint
- `GET /api/v1/sprints/{id}/burndown` - Burndown data
- `GET /api/v1/sprints/current` - Current sprint

---

## Component Hierarchy

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── home/page.tsx             # NEW: Dashboard home
│   │   ├── timeline/page.tsx         # NEW: Timeline view
│   │   ├── sprints/page.tsx          # NEW: Sprint cockpit
│   │   ├── meetings/page.tsx         # NEW: Meeting intelligence
│   │   ├── decisions/page.tsx        # NEW: Decision log
│   │   ├── research/page.tsx         # NEW: Research repository
│   │   ├── roadmap/page.tsx          # NEW: Roadmap canvas
│   │   ├── integrations/page.tsx     # NEW: Integration hub
│   │   └── settings/
│   │       └── api-tokens/page.tsx   # FIX: Implement UI
│
├── components/
│   ├── dashboard/                    # NEW
│   │   ├── DashboardHome.tsx
│   │   ├── RecentCanvasesWidget.tsx
│   │   ├── TasksDueTodayWidget.tsx
│   │   ├── UpcomingMeetingsWidget.tsx
│   │   ├── TeamActivityFeed.tsx
│   │   └── QuickActionsBar.tsx
│   │
│   ├── timeline/                     # NEW
│   │   ├── TimelinePage.tsx
│   │   ├── TimelineHeader.tsx
│   │   ├── TimelineRow.tsx
│   │   ├── TimelineStage.tsx
│   │   ├── TimelineLegend.tsx
│   │   └── InitiativeDetailPanel.tsx
│   │
│   ├── sprints/                      # NEW
│   │   ├── SprintCockpitPage.tsx
│   │   ├── SprintSelector.tsx
│   │   ├── VelocityCard.tsx
│   │   ├── BurndownChart.tsx
│   │   ├── AtRiskItems.tsx
│   │   ├── TeamCapacity.tsx
│   │   ├── StandupView.tsx
│   │   └── SprintGoals.tsx
│   │
│   ├── meetings/                     # NEW
│   │   ├── MeetingsPage.tsx
│   │   ├── UpcomingMeetings.tsx
│   │   ├── MeetingCard.tsx
│   │   ├── MeetingDetail.tsx
│   │   ├── MeetingTranscript.tsx
│   │   ├── MeetingROIScore.tsx
│   │   ├── MeetingAnalytics.tsx
│   │   └── AgendaSuggestions.tsx
│   │
│   ├── decisions/                    # NEW
│   │   ├── DecisionLog.tsx
│   │   ├── DecisionCard.tsx
│   │   ├── DecisionDetail.tsx
│   │   ├── RecordDecisionDialog.tsx
│   │   └── AlternativesList.tsx
│   │
│   ├── research/                     # NEW
│   │   ├── ResearchPage.tsx
│   │   ├── StudyCard.tsx
│   │   ├── InsightCard.tsx
│   │   ├── PatternList.tsx
│   │   ├── EvidenceStrength.tsx
│   │   └── ImportStudyDialog.tsx
│   │
│   ├── roadmap/                      # NEW
│   │   ├── RoadmapCanvas.tsx
│   │   ├── RoadmapColumn.tsx
│   │   ├── RoadmapCard.tsx
│   │   ├── CapacityIndicator.tsx
│   │   └── DependencyArrows.tsx
│   │
│   └── integrations/                 # NEW
│       ├── IntegrationsPage.tsx
│       ├── IntegrationCard.tsx
│       ├── IntegrationSetupDialog.tsx
│       ├── IntegrationLogs.tsx
│       └── DataFlowDiagram.tsx
│
├── hooks/                            # NEW
│   ├── useInitiatives.ts
│   ├── useDecisions.ts
│   ├── useResearch.ts
│   ├── useMeetings.ts
│   └── useSprints.ts
│
├── lib/                              # NEW/EXTEND
│   ├── initiatives-api.ts
│   ├── decisions-api.ts
│   ├── research-api.ts
│   ├── meetings-api.ts
│   └── sprints-api.ts
│
└── types/                            # NEW/EXTEND
    ├── initiative.ts
    ├── decision.ts
    ├── research.ts
    ├── meeting.ts
    └── sprint.ts
```

---

## Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Dashboard Home | High | Low | 1 |
| Integration Hub | High | Medium | 2 |
| API Tokens Page | Medium | Low | 3 |
| Timeline View | High | High | 4 |
| Sprint Cockpit | High | High | 5 |
| Roadmap Canvas | High | Medium | 6 |
| Decision Log | Medium | Medium | 7 |
| Meeting Intelligence | Medium | High | 8 |
| Research Repository | Medium | High | 9 |
| Jira Integration | High | High | 10 |
| Slack Integration | Medium | Medium | 11 |
| AI Strategy Advisor | Medium | High | 12 |

---

## Success Metrics

### User Engagement
- Daily active users on canvas
- Avg time spent per session
- Nodes created per canvas
- Tasks completed rate

### Product Health
- Integration connection rate
- Meeting import adoption
- Decision log usage
- Research insight links

### Business Impact
- Time to first canvas creation
- Team adoption rate
- Feature utilization breadth
- User retention (30-day)

---

## Next Steps

1. **Immediate (This Week)**
   - Implement Dashboard Home page
   - Implement API Tokens page
   - Create Integration Hub skeleton

2. **Short Term (Next 2 Weeks)**
   - Timeline view MVP
   - Sprint cockpit MVP
   - Jira OAuth connection

3. **Medium Term (Month 2)**
   - Meeting intelligence
   - Decision log
   - Full Jira sync

4. **Long Term (Month 3+)**
   - Research repository
   - AI Strategy Advisor
   - Linear/GitHub integrations

---

*Last Updated: February 2024*
*Version: 1.0*
