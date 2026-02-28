'use client';

/**
 * Test page for SkillsQuickConnect component
 * Access at: http://localhost:3001/test-skills
 */

import { useState } from 'react';
import { SkillsQuickConnect, SkillConfig } from '@/components/agent/SkillsQuickConnect';
import { SkillProvider } from '@/types/skills';

export default function TestSkillsPage() {
  const [config, setConfig] = useState<SkillConfig>({});
  const [testMode, setTestMode] = useState<'real' | 'jira' | 'both'>('real');

  const getInitialConnected = (): SkillProvider[] | undefined => {
    if (testMode === 'real') return undefined;
    if (testMode === 'jira') return ['jira'];
    if (testMode === 'both') return ['jira', 'confluence'];
    return undefined;
  };

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">SkillsQuickConnect QA Test</h1>

        {/* Test Mode Selector */}
        <div className="p-4 border rounded-lg bg-muted/30">
          <h2 className="font-semibold mb-2">Test Mode</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setTestMode('real')}
              className={`px-3 py-1 rounded text-sm ${testMode === 'real' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
            >
              Real API
            </button>
            <button
              onClick={() => setTestMode('jira')}
              className={`px-3 py-1 rounded text-sm ${testMode === 'jira' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
            >
              Mock: Jira Connected
            </button>
            <button
              onClick={() => setTestMode('both')}
              className={`px-3 py-1 rounded text-sm ${testMode === 'both' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
            >
              Mock: Both Connected
            </button>
          </div>
        </div>

        {/* Component Under Test */}
        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-4">Component: SkillsQuickConnect</h2>
          <SkillsQuickConnect
            key={testMode} // Force remount on mode change
            initialConnected={getInitialConnected()}
            onConfigChanged={setConfig}
            onSkillsChanged={(skills) => console.log('Skills changed:', skills)}
          />
        </div>

        {/* Config Output */}
        <div className="p-4 border rounded-lg bg-muted/30">
          <h2 className="font-semibold mb-2">Config Output (onConfigChanged)</h2>
          <pre className="text-xs bg-background p-2 rounded overflow-auto">
            {JSON.stringify(config, null, 2) || '{}'}
          </pre>
        </div>

        {/* Expected Behavior */}
        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">Expected Behavior</h2>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li><strong>Real API:</strong> Shows loading, then Connect buttons (or connected if logged in with skills)</li>
            <li><strong>Mock Jira:</strong> Jira shows green checkmark + text input, Confluence shows Connect button</li>
            <li><strong>Mock Both:</strong> Both show green checkmark + text input</li>
            <li>Typing in text input should update Config Output above</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
