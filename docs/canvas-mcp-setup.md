# Canvas MCP Server Setup

An MCP (Model Context Protocol) server that allows Claude Desktop or Claude Code to control your Merlin Canvas through natural language.

## Overview

The MCP server acts as a bridge between Claude and your canvas backend API. Claude can create nodes, connect them, build OKR structures, and manage your canvases entirely through conversation.

## Installation

```bash
cd canvas-mcp
npm install
npm run build
```

## Claude Desktop Configuration

1. Make sure your Merlin backend is running at `http://localhost:8000`

2. Edit Claude Desktop's config file:

| Platform | Config Path |
|----------|-------------|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |

3. Add this configuration:

```json
{
  "mcpServers": {
    "canvas": {
      "command": "node",
      "args": ["/Users/banegryphon/Documents/GitHub/Merlin-fe/canvas-mcp/dist/index.js"],
      "env": {
        "CANVAS_API_URL": "http://localhost:8000/api/v1"
      }
    }
  }
}
```

4. Restart Claude Desktop

## Available Tools

| Tool | Description |
|------|-------------|
| `list_canvases` | List all available canvases |
| `get_canvas` | Get details of a canvas including all nodes and connections |
| `create_canvas` | Create a new canvas with name and optional description |
| `create_node` | Create a node on a canvas |
| `update_node` | Update a node's name or content |
| `delete_node` | Delete a node from the canvas |
| `connect_nodes` | Create a connection between two nodes |
| `delete_connection` | Remove a connection |
| `create_okr_structure` | Create a complete OKR with problem, objective, and key results |

## Node Types

The following node types are available:

| Type | Description |
|------|-------------|
| `problem` | Problem statement - the "why" |
| `objective` | OKR objective |
| `keyresult` | Key result tied to an objective |
| `metric` | Measurable metric |
| `doc` | Rich text document |
| `agent` | AI agent node |
| `webhook` | Webhook integration |
| `api` | API integration |
| `mcp` | MCP server connection |
| `integration` | Generic integration |
| `custom` | Custom node type |

## Connection Rules

The canvas enforces these connection rules:

- `problem` → can connect to everything except `objective` and `metric`
- `objective` → `keyresult`
- `keyresult` → `metric`
- Other node types have no restrictions

## Example Conversations

Once configured, you can talk to Claude naturally:

### Basic Operations
- "List all my canvases"
- "Create a new canvas called 'Q1 Planning'"
- "Show me what's on canvas 1"

### Creating Nodes
- "Add a problem statement about customer churn on canvas 1"
- "Create an objective to reduce churn by 25%"
- "Add three key results for tracking churn reduction"

### Building Relationships
- "Connect node 5 to node 6"
- "Link the problem to the objective"

### Compound Operations
- "Create an OKR structure on canvas 1 with:
  - Problem: High customer churn rate
  - Objective: Reduce churn by 25% in Q1
  - Key Results: Improve onboarding completion to 80%, Reduce support tickets by 30%, Increase NPS to 50"

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CANVAS_API_URL` | `http://localhost:8000/api/v1` | Backend API URL |

## Development

Run in development mode with hot reload:
```bash
npm run dev
```

Build for production:
```bash
npm run build
npm start
```

## Architecture

```
Claude Desktop/Code
        │
        │ MCP Protocol (stdio)
        ▼
   canvas-mcp server
        │
        │ HTTP REST API
        ▼
  Merlin Backend (Django)
        │
        ▼
     Database
```

## Troubleshooting

### Server not connecting
- Verify the Merlin backend is running: `curl http://localhost:8000/api/v1/canvases/`
- Check the path in your Claude Desktop config is correct

### Claude can't find tools
- Restart Claude Desktop after config changes
- Check for JSON syntax errors in the config file

### API errors
- Ensure `CANVAS_API_URL` points to the correct backend
- Check backend logs for error details

### Permission errors
- Make sure the `dist/index.js` file exists (run `npm run build`)
- Verify node has execute permissions

## File Structure

```
canvas-mcp/
├── src/
│   └── index.ts      # MCP server implementation
├── dist/
│   └── index.js      # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```
