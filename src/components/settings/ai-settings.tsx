"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Check, Loader2, Key } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AISettingsData {
  anthropic_api_key?: string;
  openai_api_key?: string;
  source?: string;
  has_custom_settings?: boolean;
}

export function AISettings() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<AISettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [anthropicKey, setAnthropicKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);

  const { toast } = useToast();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  // Fetch current settings
  useEffect(() => {
    if (session?.accessToken) {
      fetchSettings();
    }
  }, [session]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/v1/settings/`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        // Keys come back masked, don't populate the inputs
      } else if (response.status === 404) {
        // No settings yet - that's ok
        setSettings({ source: "system", has_custom_settings: false });
      } else {
        throw new Error("Failed to fetch settings");
      }
    } catch (err) {
      setError("Failed to load settings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload: Record<string, string> = {};
      if (anthropicKey) payload.anthropic_api_key = anthropicKey;
      if (openaiKey) payload.openai_api_key = openaiKey;

      if (Object.keys(payload).length === 0) {
        setError("Please enter at least one API key");
        return;
      }

      const response = await fetch(`${backendUrl}/api/v1/settings/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: "Settings saved",
          description: "Your API keys have been securely stored.",
        });
        // Clear inputs and refetch
        setAnthropicKey("");
        setOpenaiKey("");
        await fetchSettings();
      } else {
        const data = await response.json();
        throw new Error(data.detail || "Failed to save settings");
      }
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          AI Provider Settings
        </CardTitle>
        <CardDescription>
          Configure your API keys for AI-powered features like canvas chat,
          document generation, and semantic search.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {settings?.has_custom_settings && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              You have custom API keys configured. Enter new keys below to update them.
            </AlertDescription>
          </Alert>
        )}

        {/* Anthropic API Key */}
        <div className="space-y-2">
          <Label htmlFor="anthropic-key">Anthropic API Key</Label>
          <p className="text-sm text-muted-foreground">
            Required for canvas chat and AI-powered features. Get your key at{" "}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              console.anthropic.com
            </a>
          </p>
          <div className="relative">
            <Input
              id="anthropic-key"
              type={showAnthropicKey ? "text" : "password"}
              value={anthropicKey}
              onChange={(e) => setAnthropicKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="pr-14 font-mono text-sm"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
              onClick={() => setShowAnthropicKey(!showAnthropicKey)}
            >
              {showAnthropicKey ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        {/* OpenAI API Key */}
        <div className="space-y-2">
          <Label htmlFor="openai-key">OpenAI API Key</Label>
          <p className="text-sm text-muted-foreground">
            Used for embeddings and semantic search. Get your key at{" "}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              platform.openai.com
            </a>
          </p>
          <div className="relative">
            <Input
              id="openai-key"
              type={showOpenaiKey ? "text" : "password"}
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              className="pr-14 font-mono text-sm"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
              onClick={() => setShowOpenaiKey(!showOpenaiKey)}
            >
              {showOpenaiKey ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save API Keys
          </Button>
        </div>

        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Your API keys are encrypted and stored securely. They are never exposed
            to other users or included in API responses.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
