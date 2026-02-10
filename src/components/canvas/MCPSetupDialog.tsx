'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Copy,
  Check,
  Download,
  ExternalLink,
  Key,
  Terminal,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface MCPSetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  canvasId?: number;
}

export function MCPSetupDialog({ isOpen, onClose, canvasId }: MCPSetupDialogProps) {
  const { data: session } = useSession();
  const [copied, setCopied] = useState<string | null>(null);
  // For MCP instructions, always use production URL (Claude connects from outside)
  const mcpApiUrl = 'https://merlin-j5sk.onrender.com';

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const pipCommand = 'pip install mcp httpx';

  const claudeCodeCommand = `claude mcp add typequest \\
  --env TYPEQUEST_API_URL=${mcpApiUrl} \\
  --env TYPEQUEST_API_TOKEN=YOUR_TOKEN_HERE \\
  -- python mcp_server_api.py`;

  const claudeDesktopConfig = `{
  "mcpServers": {
    "typequest": {
      "command": "python",
      "args": ["path/to/mcp_server_api.py"],
      "env": {
        "TYPEQUEST_API_URL": "${mcpApiUrl}",
        "TYPEQUEST_API_TOKEN": "YOUR_TOKEN_HERE"
      }
    }
  }
}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            Connect Claude to This Canvas
          </DialogTitle>
          <DialogDescription>
            Use the Model Context Protocol (MCP) to let Claude manage your canvases directly
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Step 0: Get API Token */}
          <Alert className="border-primary/30 bg-primary/5">
            <Key className="h-4 w-4" />
            <AlertTitle>First, get an API Token</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                You need an API token to authenticate Claude with your account.
              </p>
              <a
                href="/settings/api-tokens"
                className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
              >
                Go to API Tokens page
                <ExternalLink className="h-3 w-3" />
              </a>
            </AlertDescription>
          </Alert>

          {/* Step 1: Download MCP Server */}
          <div>
            <Label className="text-sm font-medium">1. Download the MCP Server</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Save this Python file to your computer
            </p>
            <a
              href="/mcp_server_api.py"
              download="mcp_server_api.py"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download mcp_server_api.py
            </a>
          </div>

          {/* Step 2: Install Dependencies */}
          <div>
            <Label className="text-sm font-medium">2. Install Dependencies</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Run this in your terminal (requires Python 3.10+)
            </p>
            <div className="flex gap-2">
              <pre className="flex-1 p-3 bg-muted rounded-md text-xs overflow-x-auto">
                {pipCommand}
              </pre>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(pipCommand, 'pip')}
              >
                {copied === 'pip' ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Step 3: Claude Code Setup */}
          <div>
            <Label className="text-sm font-medium">3. Add to Claude Code</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Run this in the folder where you saved mcp_server_api.py (replace YOUR_TOKEN_HERE)
            </p>
            <div className="flex gap-2">
              <pre className="flex-1 p-3 bg-muted rounded-md text-xs overflow-x-auto whitespace-pre-wrap">
                {claudeCodeCommand}
              </pre>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(claudeCodeCommand, 'claude-code')}
              >
                {copied === 'claude-code' ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Step 4: Claude Desktop (Alternative) */}
          <div>
            <Label className="text-sm font-medium">4. Or Configure Claude Desktop</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Add to ~/Library/Application Support/Claude/claude_desktop_config.json
            </p>
            <div className="flex gap-2">
              <pre className="flex-1 p-3 bg-muted rounded-md text-xs overflow-x-auto">
                {claudeDesktopConfig}
              </pre>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(claudeDesktopConfig, 'claude-desktop')}
              >
                {copied === 'claude-desktop' ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* What Claude Can Do */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="font-medium mb-2">What Claude can do with MCP:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Create and manage canvases</li>
              <li>Add nodes (docs, objectives, key results, metrics)</li>
              <li>Connect nodes to build OKR hierarchies</li>
              <li>Create and update tasks</li>
              <li>Build complete OKR structures automatically</li>
            </ul>
          </div>

          {/* Learn More */}
          <div className="text-center pt-2">
            <a
              href="https://docs.anthropic.com/en/docs/claude-code"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Learn more about MCP
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
