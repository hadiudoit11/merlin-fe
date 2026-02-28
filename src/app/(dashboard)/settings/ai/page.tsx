"use client";

import { AISettings } from "@/components/settings/ai-settings";

export default function AISettingsPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">AI Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your API keys for AI-powered features
        </p>
      </div>

      <AISettings />
    </div>
  );
}
