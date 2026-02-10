"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Clock,
  Shield,
  Terminal,
  ExternalLink,
  AlertCircle,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface Token {
  id: number;
  name: string;
  token_prefix: string;
  scopes: string[];
  allowed_canvas_ids: number[] | null;
  is_active: boolean;
  last_used_at: string | null;
  use_count: number;
  created_at: string;
  expires_at: string | null;
}

interface Canvas {
  id: number;
  name: string;
}

interface NewTokenResponse {
  id: number;
  name: string;
  token: string;
  token_prefix: string;
  scopes: string[];
  created_at: string;
  expires_at: string | null;
}

export default function APITokensPage() {
  const { data: session } = useSession();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newToken, setNewToken] = useState<NewTokenResponse | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [tokenName, setTokenName] = useState("");
  const [expiresIn, setExpiresIn] = useState<string>("never");
  const [canvasAccess, setCanvasAccess] = useState<string>("all"); // "all" or "specific"
  const [selectedCanvasIds, setSelectedCanvasIds] = useState<number[]>([]);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  useEffect(() => {
    if (session?.accessToken) {
      fetchTokens();
      fetchCanvases();
    }
  }, [session]);

  const fetchCanvases = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/v1/canvases/`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCanvases(data);
      }
    } catch (err) {
      console.error("Failed to fetch canvases:", err);
    }
  };

  const fetchTokens = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/v1/tokens/`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTokens(data);
      }
    } catch (err) {
      console.error("Failed to fetch tokens:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createToken = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const body: {
        name: string;
        expires_in_days?: number;
        allowed_canvas_ids?: number[];
      } = {
        name: tokenName,
      };

      if (expiresIn !== "never") {
        body.expires_in_days = parseInt(expiresIn);
      }

      // Add canvas restrictions if specific canvases selected
      if (canvasAccess === "specific" && selectedCanvasIds.length > 0) {
        body.allowed_canvas_ids = selectedCanvasIds;
      }

      const response = await fetch(`${backendUrl}/api/v1/tokens/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data: NewTokenResponse = await response.json();
        setNewToken(data);
        fetchTokens();
        setTokenName("");
        setExpiresIn("never");
        setCanvasAccess("all");
        setSelectedCanvasIds([]);
      } else {
        const errData = await response.json();
        setError(errData.detail || "Failed to create token");
      }
    } catch (err) {
      setError("Failed to create token");
    } finally {
      setIsCreating(false);
    }
  };

  const revokeToken = async (tokenId: number) => {
    try {
      const response = await fetch(`${backendUrl}/api/v1/tokens/${tokenId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (response.ok) {
        fetchTokens();
      }
    } catch (err) {
      console.error("Failed to revoke token:", err);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const claudeCodeCommand = newToken
    ? `claude mcp add typequest \\
  --env TYPEQUEST_API_URL=${backendUrl} \\
  --env TYPEQUEST_API_TOKEN=${newToken.token} \\
  -- python mcp_server_api.py`
    : "";

  const claudeDesktopConfig = newToken
    ? `{
  "mcpServers": {
    "typequest": {
      "command": "python",
      "args": ["path/to/mcp_server_api.py"],
      "env": {
        "TYPEQUEST_API_URL": "${backendUrl}",
        "TYPEQUEST_API_TOKEN": "${newToken.token}"
      }
    }
  }
}`
    : "";

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">API Tokens</h1>
        <p className="text-gray-600 mt-1">
          Create tokens to connect Claude or other tools to your Typequest account
        </p>
      </div>

      {/* MCP Info Card */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
            <Terminal className="h-5 w-5" />
            Connect Claude to Typequest
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800">
          <p className="mb-3">
            Use the Model Context Protocol (MCP) to let Claude manage your canvases,
            nodes, and tasks directly. Create a token below to get started.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="/mcp_server_api.py"
              download="mcp_server_api.py"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download MCP Server
            </a>
            <a
              href="https://docs.anthropic.com/en/docs/claude-code"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
            >
              Learn more about MCP
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Create Token Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Create New Token</CardTitle>
          <CardDescription>
            Tokens are like passwords - keep them secret and revoke them if compromised
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="tokenName">Token Name</Label>
              <Input
                id="tokenName"
                placeholder="e.g., Claude Desktop, CI/CD Pipeline"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="w-40">
              <Label>Expires</Label>
              <Select value={expiresIn} onValueChange={setExpiresIn}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Canvas Access Control */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <Label className="text-sm font-medium">Canvas Access</Label>
            <p className="text-xs text-gray-500 mb-3">
              Limit which canvases this token can access
            </p>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="canvasAccess"
                  value="all"
                  checked={canvasAccess === "all"}
                  onChange={(e) => setCanvasAccess(e.target.value)}
                  className="w-4 h-4 text-[#ff6b6b]"
                />
                <span className="text-sm">All canvases</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="canvasAccess"
                  value="specific"
                  checked={canvasAccess === "specific"}
                  onChange={(e) => setCanvasAccess(e.target.value)}
                  className="w-4 h-4 text-[#ff6b6b]"
                />
                <span className="text-sm">Specific canvases only</span>
              </label>
            </div>

            {canvasAccess === "specific" && (
              <div className="space-y-2">
                {canvases.length === 0 ? (
                  <p className="text-xs text-gray-500">No canvases found. Create a canvas first.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {canvases.map((canvas) => (
                      <label
                        key={canvas.id}
                        className="flex items-center gap-2 p-2 border rounded hover:bg-white cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCanvasIds.includes(canvas.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCanvasIds([...selectedCanvasIds, canvas.id]);
                            } else {
                              setSelectedCanvasIds(selectedCanvasIds.filter(id => id !== canvas.id));
                            }
                          }}
                          className="w-4 h-4 rounded text-[#ff6b6b]"
                        />
                        <span className="text-sm truncate">{canvas.name}</span>
                      </label>
                    ))}
                  </div>
                )}
                {canvasAccess === "specific" && selectedCanvasIds.length === 0 && (
                  <p className="text-xs text-amber-600">Select at least one canvas</p>
                )}
              </div>
            )}
          </div>

          {/* Rate Limit Info */}
          <Alert className="border-gray-200 bg-gray-50">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-xs text-gray-600">
              <strong>Rate limits:</strong> 60 requests/minute, 500 requests/hour per token.
              Tokens have canvas-only scopes by default for security.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end">
            <Button
              onClick={createToken}
              disabled={
                !tokenName.trim() ||
                isCreating ||
                (canvasAccess === "specific" && selectedCanvasIds.length === 0)
              }
              className="bg-[#ff6b6b] hover:bg-[#ff5252]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Token
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* New Token Dialog */}
      <Dialog open={!!newToken} onOpenChange={() => setNewToken(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-green-600" />
              Token Created Successfully
            </DialogTitle>
            <DialogDescription>
              Copy your token now - you won&apos;t be able to see it again!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Token Value */}
            <div>
              <Label className="text-sm font-medium">Your API Token</Label>
              <div className="mt-1 flex gap-2">
                <code className="flex-1 p-3 bg-gray-900 text-green-400 rounded-md text-sm font-mono overflow-x-auto">
                  {newToken?.token}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(newToken?.token || "", "token")}
                >
                  {copied === "token" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Prerequisites */}
            <div>
              <Label className="text-sm font-medium">1. Install Dependencies</Label>
              <p className="text-xs text-gray-500 mb-1">
                Make sure you have Python 3.10+ and these packages:
              </p>
              <div className="mt-1 flex gap-2">
                <pre className="flex-1 p-3 bg-gray-100 rounded-md text-xs overflow-x-auto">
                  pip install mcp httpx
                </pre>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard("pip install mcp httpx", "pip")}
                >
                  {copied === "pip" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Claude Code Setup */}
            <div>
              <Label className="text-sm font-medium">2. Claude Code Setup</Label>
              <p className="text-xs text-gray-500 mb-1">
                Run this command in the folder where you saved mcp_server_api.py:
              </p>
              <div className="mt-1 flex gap-2">
                <pre className="flex-1 p-3 bg-gray-100 rounded-md text-xs overflow-x-auto whitespace-pre-wrap">
                  {claudeCodeCommand}
                </pre>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(claudeCodeCommand, "claude-code")}
                >
                  {copied === "claude-code" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Claude Desktop Setup */}
            <div>
              <Label className="text-sm font-medium">3. Claude Desktop Setup (Alternative)</Label>
              <p className="text-xs text-gray-500 mb-1">
                Add to ~/Library/Application Support/Claude/claude_desktop_config.json:
              </p>
              <div className="mt-1 flex gap-2">
                <pre className="flex-1 p-3 bg-gray-100 rounded-md text-xs overflow-x-auto">
                  {claudeDesktopConfig}
                </pre>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(claudeDesktopConfig, "claude-desktop")}
                >
                  {copied === "claude-desktop" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Alert>
              <Download className="h-4 w-4" />
              <AlertTitle>Download the MCP Server</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>
                  You&apos;ll need the <code className="text-xs bg-gray-100 px-1 rounded">mcp_server_api.py</code> file to connect Claude.
                </span>
                <a
                  href="/mcp_server_api.py"
                  download="mcp_server_api.py"
                  className="ml-4 inline-flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md hover:bg-gray-800 transition-colors"
                >
                  <Download className="h-3 w-3" />
                  Download
                </a>
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button onClick={() => setNewToken(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Existing Tokens */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Tokens</CardTitle>
          <CardDescription>
            {tokens.length} token{tokens.length !== 1 ? "s" : ""} created
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : tokens.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Key className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No tokens yet. Create one above to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tokens.map((token) => (
                <motion.div
                  key={token.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-full ${
                        token.is_active ? "bg-green-100" : "bg-gray-100"
                      }`}
                    >
                      <Key
                        className={`h-4 w-4 ${
                          token.is_active ? "text-green-600" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        {token.name}
                        {token.allowed_canvas_ids && (
                          <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                            {token.allowed_canvas_ids.length} canvas{token.allowed_canvas_ids.length !== 1 ? "es" : ""}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-3 flex-wrap">
                        <code className="bg-gray-100 px-1 rounded text-xs">
                          {token.token_prefix}...
                        </code>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {token.last_used_at
                            ? `Used ${formatDate(token.last_used_at)}`
                            : "Never used"}
                        </span>
                        {token.use_count > 0 && (
                          <span>{token.use_count} requests</span>
                        )}
                        <span className="text-xs text-gray-400">
                          {token.scopes.length} scopes
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {token.expires_at && (
                      <span className="text-xs text-gray-500">
                        Expires {formatDate(token.expires_at)}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (confirm(`Revoke token "${token.name}"? This cannot be undone.`)) {
                          revokeToken(token.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
