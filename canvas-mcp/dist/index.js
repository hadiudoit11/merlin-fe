#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
// Configuration - can be overridden via environment variables
const API_BASE_URL = process.env.CANVAS_API_URL || "http://localhost:8000/api/v1";
// API Client
class CanvasAPIClient {
    baseUrl;
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API Error (${response.status}): ${error}`);
        }
        return response.json();
    }
    // Canvas operations
    async listCanvases() {
        return this.request("/canvases/");
    }
    async getCanvas(canvasId) {
        return this.request(`/canvases/${canvasId}/`);
    }
    async createCanvas(name, description) {
        return this.request("/canvases/", {
            method: "POST",
            body: JSON.stringify({ name, description }),
        });
    }
    // Node operations
    async listNodes(canvasId) {
        return this.request(`/nodes/?canvas_id=${canvasId}`);
    }
    async createNode(canvasId, nodeType, name, content, position) {
        return this.request("/nodes/", {
            method: "POST",
            body: JSON.stringify({
                canvas_id: canvasId,
                node_type: nodeType,
                name,
                content: content || "",
                position_x: position?.x || 100,
                position_y: position?.y || 100,
                width: 280,
                height: 150,
            }),
        });
    }
    async updateNode(nodeId, data) {
        return this.request(`/nodes/${nodeId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }
    async deleteNode(nodeId) {
        await this.request(`/nodes/${nodeId}`, {
            method: "DELETE",
        });
    }
    // Connection operations
    async createConnection(sourceNodeId, targetNodeId) {
        return this.request("/nodes/connections", {
            method: "POST",
            body: JSON.stringify({
                source_node_id: sourceNodeId,
                target_node_id: targetNodeId,
                connection_type: "default",
            }),
        });
    }
    async deleteConnection(connectionId) {
        await this.request(`/nodes/connections/${connectionId}`, {
            method: "DELETE",
        });
    }
}
// Define available tools
const TOOLS = [
    {
        name: "list_canvases",
        description: "List all available canvases",
        inputSchema: {
            type: "object",
            properties: {},
            required: [],
        },
    },
    {
        name: "get_canvas",
        description: "Get details of a specific canvas including all its nodes and connections",
        inputSchema: {
            type: "object",
            properties: {
                canvas_id: {
                    type: "number",
                    description: "The ID of the canvas to retrieve",
                },
            },
            required: ["canvas_id"],
        },
    },
    {
        name: "create_canvas",
        description: "Create a new canvas",
        inputSchema: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "Name of the canvas",
                },
                description: {
                    type: "string",
                    description: "Optional description of the canvas",
                },
            },
            required: ["name"],
        },
    },
    {
        name: "create_node",
        description: "Create a new node on a canvas. Node types include: problem (problem statement), objective, keyresult (key result), metric, doc (document), agent (AI agent)",
        inputSchema: {
            type: "object",
            properties: {
                canvas_id: {
                    type: "number",
                    description: "The ID of the canvas to add the node to",
                },
                node_type: {
                    type: "string",
                    enum: ["problem", "objective", "keyresult", "metric", "doc", "agent", "webhook", "api", "mcp", "integration", "custom"],
                    description: "Type of node to create",
                },
                name: {
                    type: "string",
                    description: "Name/title of the node",
                },
                content: {
                    type: "string",
                    description: "Content or description for the node",
                },
                position_x: {
                    type: "number",
                    description: "X position on the canvas (default: auto-positioned)",
                },
                position_y: {
                    type: "number",
                    description: "Y position on the canvas (default: auto-positioned)",
                },
            },
            required: ["canvas_id", "node_type", "name"],
        },
    },
    {
        name: "update_node",
        description: "Update an existing node's name or content",
        inputSchema: {
            type: "object",
            properties: {
                node_id: {
                    type: "number",
                    description: "The ID of the node to update",
                },
                name: {
                    type: "string",
                    description: "New name for the node",
                },
                content: {
                    type: "string",
                    description: "New content for the node",
                },
            },
            required: ["node_id"],
        },
    },
    {
        name: "delete_node",
        description: "Delete a node from the canvas",
        inputSchema: {
            type: "object",
            properties: {
                node_id: {
                    type: "number",
                    description: "The ID of the node to delete",
                },
            },
            required: ["node_id"],
        },
    },
    {
        name: "connect_nodes",
        description: "Create a connection between two nodes. Connection rules: problem→objective, objective→keyresult, keyresult→metric",
        inputSchema: {
            type: "object",
            properties: {
                source_node_id: {
                    type: "number",
                    description: "The ID of the source node",
                },
                target_node_id: {
                    type: "number",
                    description: "The ID of the target node",
                },
            },
            required: ["source_node_id", "target_node_id"],
        },
    },
    {
        name: "delete_connection",
        description: "Delete a connection between nodes",
        inputSchema: {
            type: "object",
            properties: {
                connection_id: {
                    type: "number",
                    description: "The ID of the connection to delete",
                },
            },
            required: ["connection_id"],
        },
    },
    {
        name: "create_okr_structure",
        description: "Create a complete OKR structure with a problem statement, objective, and key results",
        inputSchema: {
            type: "object",
            properties: {
                canvas_id: {
                    type: "number",
                    description: "The ID of the canvas",
                },
                problem: {
                    type: "string",
                    description: "The problem statement",
                },
                objective: {
                    type: "string",
                    description: "The objective to achieve",
                },
                key_results: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of key results (1-5 recommended)",
                },
            },
            required: ["canvas_id", "problem", "objective", "key_results"],
        },
    },
];
// Main server
async function main() {
    const client = new CanvasAPIClient(API_BASE_URL);
    const server = new Server({
        name: "canvas-mcp",
        version: "1.0.0",
    }, {
        capabilities: {
            tools: {},
        },
    });
    // List available tools
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return { tools: TOOLS };
    });
    // Handle tool calls
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        try {
            switch (name) {
                case "list_canvases": {
                    const canvases = await client.listCanvases();
                    return {
                        content: [
                            {
                                type: "text",
                                text: canvases.length > 0
                                    ? `Found ${canvases.length} canvas(es):\n\n${canvases
                                        .map((c) => `- **${c.name}** (ID: ${c.id})${c.description ? `: ${c.description}` : ""}`)
                                        .join("\n")}`
                                    : "No canvases found. Use create_canvas to create one.",
                            },
                        ],
                    };
                }
                case "get_canvas": {
                    const { canvas_id } = args;
                    const canvas = await client.getCanvas(canvas_id);
                    let response = `**${canvas.name}** (ID: ${canvas.id})\n\n`;
                    if (canvas.nodes && canvas.nodes.length > 0) {
                        response += `**Nodes (${canvas.nodes.length}):**\n`;
                        canvas.nodes.forEach((node) => {
                            response += `- [${node.node_type}] **${node.name}** (ID: ${node.id})`;
                            if (node.content) {
                                response += `: ${node.content.substring(0, 100)}${node.content.length > 100 ? "..." : ""}`;
                            }
                            response += "\n";
                        });
                    }
                    else {
                        response += "No nodes yet.\n";
                    }
                    if (canvas.connections && canvas.connections.length > 0) {
                        response += `\n**Connections (${canvas.connections.length}):**\n`;
                        canvas.connections.forEach((conn) => {
                            const source = canvas.nodes?.find((n) => n.id === conn.source_node_id);
                            const target = canvas.nodes?.find((n) => n.id === conn.target_node_id);
                            response += `- ${source?.name || conn.source_node_id} → ${target?.name || conn.target_node_id}\n`;
                        });
                    }
                    return { content: [{ type: "text", text: response }] };
                }
                case "create_canvas": {
                    const { name: canvasName, description } = args;
                    const canvas = await client.createCanvas(canvasName, description);
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Created canvas **${canvas.name}** (ID: ${canvas.id})`,
                            },
                        ],
                    };
                }
                case "create_node": {
                    const { canvas_id, node_type, name: nodeName, content, position_x, position_y } = args;
                    const position = position_x !== undefined && position_y !== undefined
                        ? { x: position_x, y: position_y }
                        : undefined;
                    const node = await client.createNode(canvas_id, node_type, nodeName, content, position);
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Created ${node_type} node: **${node.name}** (ID: ${node.id})`,
                            },
                        ],
                    };
                }
                case "update_node": {
                    const { node_id, name: nodeName, content } = args;
                    const updates = {};
                    if (nodeName)
                        updates.name = nodeName;
                    if (content)
                        updates.content = content;
                    const node = await client.updateNode(node_id, updates);
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Updated node: **${node.name}** (ID: ${node.id})`,
                            },
                        ],
                    };
                }
                case "delete_node": {
                    const { node_id } = args;
                    await client.deleteNode(node_id);
                    return {
                        content: [{ type: "text", text: `Deleted node ${node_id}` }],
                    };
                }
                case "connect_nodes": {
                    const { source_node_id, target_node_id } = args;
                    const connection = await client.createConnection(source_node_id, target_node_id);
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Created connection (ID: ${connection.id}): Node ${source_node_id} → Node ${target_node_id}`,
                            },
                        ],
                    };
                }
                case "delete_connection": {
                    const { connection_id } = args;
                    await client.deleteConnection(connection_id);
                    return {
                        content: [{ type: "text", text: `Deleted connection ${connection_id}` }],
                    };
                }
                case "create_okr_structure": {
                    const { canvas_id, problem, objective, key_results } = args;
                    // Create problem statement
                    const problemNode = await client.createNode(canvas_id, "problem", `Problem: ${problem}`, problem, { x: 100, y: 200 });
                    // Create objective
                    const objectiveNode = await client.createNode(canvas_id, "objective", `Objective: ${objective}`, objective, { x: 500, y: 200 });
                    // Connect problem to objective
                    await client.createConnection(problemNode.id, objectiveNode.id);
                    // Create key results
                    const krNodes = [];
                    for (let i = 0; i < key_results.length; i++) {
                        const kr = key_results[i];
                        const krNode = await client.createNode(canvas_id, "keyresult", `KR${i + 1}: ${kr}`, kr, { x: 900, y: 100 + i * 180 });
                        krNodes.push(krNode);
                        // Connect objective to key result
                        await client.createConnection(objectiveNode.id, krNode.id);
                    }
                    let response = `Created OKR structure on canvas ${canvas_id}:\n\n`;
                    response += `**Problem:** ${problem} (ID: ${problemNode.id})\n`;
                    response += `  ↓\n`;
                    response += `**Objective:** ${objective} (ID: ${objectiveNode.id})\n`;
                    response += `  ↓\n`;
                    response += `**Key Results:**\n`;
                    krNodes.forEach((kr, i) => {
                        response += `  ${i + 1}. ${key_results[i]} (ID: ${kr.id})\n`;
                    });
                    return { content: [{ type: "text", text: response }] };
                }
                default:
                    return {
                        content: [{ type: "text", text: `Unknown tool: ${name}` }],
                        isError: true,
                    };
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return {
                content: [{ type: "text", text: `Error: ${message}` }],
                isError: true,
            };
        }
    });
    // Start the server
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Canvas MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
