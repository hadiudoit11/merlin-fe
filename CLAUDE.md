# CLAUDE.md - Merlin Frontend

## Session Context & Task Log Instructions

**Purpose**: This file serves as persistent context across terminal/session restarts. Claude should always read this file at the start of a session to understand the current state of work.

### Rules for Claude
1. **Task Logging**: Maintain a running log in `TASK_LOG.md` at the project root. For each task, record:
   - What the task is
   - Why it's being done (reasoning/motivation)
   - Current status (pending, in-progress, completed, blocked)
   - Any decisions made and their rationale
2. **Update on completion**: When a task is finished, mark it as completed in `TASK_LOG.md` with a brief summary of what was done.
3. **Context preservation**: Before ending a session or when wrapping up work, update `TASK_LOG.md` so the next session has full context.
4. **Decision log**: Record architectural decisions, trade-offs, and rationale in `TASK_LOG.md`.
5. **Blockers & open questions**: Note anything blocked or needing user input in `TASK_LOG.md`.
6. **Always read `TASK_LOG.md` at the start of a session** to understand current state of work.

---

Miro-style infinite canvas for product management with draggable nodes, rich-text documents, and skill connectors.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS + shadcn/ui + Radix primitives
- **Canvas**: Custom infinite canvas with dnd-kit for drag/drop
- **Rich Text**: Tiptap editor (Google Docs-like experience)
- **State**: React Context + hooks (consider Zustand for canvas state)
- **API Client**: Axios + TanStack Query

## Development Commands

```bash
npm install                    # Install dependencies
npm run dev                    # Start dev server (port 3000)
npm run build                  # Production build
npm run lint                   # ESLint
```

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/           # Protected dashboard routes
│   │   ├── canvas/            # Canvas list and detail pages
│   │   │   ├── page.tsx       # Canvas list view
│   │   │   └── [id]/page.tsx  # Canvas editor view
│   │   ├── home/              # Dashboard home
│   │   ├── projects/          # Project management
│   │   └── ...
│   ├── user/                  # Auth pages
│   └── layout.tsx
├── components/
│   ├── ui/                    # 40+ shadcn/ui primitives
│   ├── canvas/                # Infinite canvas components
│   │   ├── Canvas.tsx         # Main canvas with pan/zoom
│   │   ├── CanvasNode.tsx     # Draggable node component
│   │   ├── CanvasConnections.tsx  # SVG connection lines
│   │   ├── CanvasToolbar.tsx  # Zoom controls
│   │   ├── CanvasContextMenu.tsx  # Right-click add node
│   │   ├── DocNode.tsx        # Tiptap rich-text editor node
│   │   └── index.ts
│   ├── main/
│   │   └── tip-tap.tsx        # Standalone Tiptap editor
│   ├── tasks/
│   │   ├── TaskBoard.tsx      # Kanban board container
│   │   ├── TaskColumn.tsx     # Droppable column
│   │   ├── TaskCard.tsx       # Draggable task card
│   │   ├── TaskDetail.tsx     # Edit sheet
│   │   ├── TaskStats.tsx      # Statistics display
│   │   └── index.ts
│   └── ...
├── hooks/
│   ├── useCanvas.ts           # Canvas state, nodes, connections
│   ├── useLocalStorage.tsx    # Persist state
│   └── ...
├── lib/
│   ├── canvas-api.ts          # Canvas API client (canvasApi)
│   ├── utils.ts               # cn() utility
│   └── ...
└── types/
    ├── canvas.ts              # Canvas, Node, Connection types
    └── ...
```

## Core Concepts

### Canvas
- Infinite pan/zoom canvas (like Miro/Figma)
- Grid background with snap-to-grid option
- Minimap for navigation

### Nodes
Draggable elements on the canvas. Types include:
- **Doc Node**: Rich-text editor (Tiptap) - scrollable content within node
- **Skill Node**: Connect external services
- **Webhook Node**: HTTP webhook endpoints
- **API Node**: REST/GraphQL API calls
- **MCP Node**: Model Context Protocol server connections

### Tasks
Action items extracted from meetings or created manually. Features:
- **Kanban Board**: Drag-and-drop between status columns (To Do, In Progress, Done)
- **Task Cards**: Display title, priority, due date, assignee
- **Task Detail**: Sheet slideout for editing
- **Node Linking**: Tasks can be linked to canvas nodes
- **Multi-source**: Tasks from Zoom meetings, Jira sync, manual creation

Components in `src/components/tasks/`:
- `TaskBoard.tsx` - Full Kanban board with drag-and-drop (@hello-pangea/dnd)
- `TaskColumn.tsx` - Droppable column with inline task creation
- `TaskCard.tsx` - Draggable task card with detail sheet
- `TaskDetail.tsx` - Sheet slideout for task editing
- `TaskStats.tsx` - Progress bar and statistics

### OKRs & Metrics
- Company-level objectives and key results
- Metrics dashboard with real-time data
- Visual hierarchy on canvas

## API Endpoints (Backend)

Base URL: `http://localhost:8000/api/v1/`

- `GET/POST /canvases/` - List/create canvases
- `GET/PUT/DELETE /canvases/{id}/` - Canvas CRUD
- `GET/POST /nodes/` - List/create nodes
- `GET/PUT/DELETE /nodes/{id}/` - Node CRUD
- `POST /nodes/{id}/connect/` - Connect nodes
- `GET/POST /okrs/` - OKR management
- `GET/POST /metrics/` - Company metrics
- `GET/POST /tasks/` - List/create tasks
- `GET/PUT/DELETE /tasks/{id}/` - Task CRUD
- `GET /tasks/stats` - Task statistics
- `POST /tasks/{id}/link/{node_id}` - Link task to node

## Environment Variables

```bash
# Mock API mode for UI development (no backend needed)
NEXT_PUBLIC_USE_MOCK_API=true   # 'true' = localStorage, 'false' = real backend

NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

## API Layer

The app uses a unified API layer (`src/lib/api.ts`) that switches between:

- **Mock Mode** (`NEXT_PUBLIC_USE_MOCK_API=true`): Uses localStorage for persistence. Perfect for UI development without a backend.
- **Real Mode** (`NEXT_PUBLIC_USE_MOCK_API=false`): Connects to the FastAPI backend.

```typescript
import { api, isMockMode } from '@/lib/api';

// Works the same regardless of mode
const canvases = await api.listCanvases();
const node = await api.createNode({ ... });
```

## Workflow Feature Testing

The workflow panel on canvas pages manages product development stages.

### How to Test Workflow UI

1. **Start both services:**
   ```bash
   # Terminal 1 - Backend (Merlin/)
   uvicorn app.main:app --reload

   # Terminal 2 - Frontend (Merlin-fe/)
   npm run dev
   ```

2. **Navigate to a canvas page:**
   - Go to `http://localhost:3000/canvas/[id]`
   - The workflow panel should appear in the right sidebar

3. **Test workflow stages:**
   - View current stage indicator
   - Click "Advance Stage" button to progress through stages
   - Stages progress: `research → prd_review → ux_review → engineering → qa → launch_prep → launched → retrospective`

4. **Test project creation:**
   - Click "Create Project" on a canvas
   - Fill in project details
   - Project should appear in workflow panel

### Workflow Panel Location
- Canvas page right sidebar: `src/components/canvas/WorkflowPanel.tsx`
- Creation panel: `src/components/canvas/panels/CreationPanel.tsx`

### Common Issues
- **Panel loading forever**: Check browser console for 401/403 errors (auth issue) or 500 errors (backend issue)
- **Projects not showing**: Verify user owns the canvas or is member of canvas organization
- **Stage advance fails**: Check backend logs for validation errors

### Backend Endpoints Used
- `GET /api/v1/projects/?canvas_id=X` - List projects on canvas
- `GET /api/v1/projects/{id}/details` - Project with artifacts and transitions
- `POST /api/v1/projects/{id}/transitions` - Advance stage
