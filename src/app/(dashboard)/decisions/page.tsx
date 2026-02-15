'use client';

import { GitBranch } from 'lucide-react';
import { ComingSoon } from '@/components/ComingSoon';

export default function DecisionsPage() {
  return (
    <ComingSoon
      title="Decision Log"
      description="Track all product decisions with context, alternatives, and outcomes."
      icon={GitBranch}
      accentColor="#4ecdc4"
      features={[
        'Chronological decision timeline',
        'Link decisions to canvas nodes',
        'Record alternatives considered',
        'Automatic review reminders',
        'Search and filter by tag or outcome',
      ]}
    />
  );
}
