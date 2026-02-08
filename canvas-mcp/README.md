# Canvas MCP Server

An MCP (Model Context Protocol) server that allows Claude Desktop or Claude Code to control your Merlin Canvas through natural language.

## Setup

1. Install dependencies and build:
```bash
cd canvas-mcp
npm install
npm run build
```

2. Make sure your Merlin backend is running on `http://localhost:8000`

3. Configure Claude Desktop by editing your config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add this configuration:

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

Once connected, Claude can use these tools:

| Tool | Description |
|------|-------------|
| `list_canvases` | List all available canvases |
| `get_canvas` | Get details of a canvas including nodes and connections |
| `create_canvas` | Create a new canvas |
| `create_node` | Create a node (problem, objective, keyresult, metric, doc, agent, etc.) |
| `update_node` | Update a node's name or content |
| `delete_node` | Delete a node |
| `connect_nodes` | Create a connection between two nodes |
| `delete_connection` | Remove a connection |
| `create_okr_structure` | Create a complete OKR structure with problem, objective, and key results |

## Example Usage

Once configured, you can talk to Claude Desktop naturally:

- "List all my canvases"
- "Create a new canvas called 'Q1 Planning'"
- "Add a problem statement about customer churn"
- "Create an objective to reduce churn by 25%"
- "Add three key results for tracking churn reduction"
- "Connect the problem to the objective"

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CANVAS_API_URL` | `http://localhost:8000/api/v1` | Backend API URL |

## Development

Run in development mode with hot reload:
```bash
npm run dev
```

## Troubleshooting

1. **Server not connecting**: Make sure the Merlin backend is running
2. **Claude can't find tools**: Restart Claude Desktop after config changes
3. **API errors**: Check that `CANVAS_API_URL` points to the correct backend
