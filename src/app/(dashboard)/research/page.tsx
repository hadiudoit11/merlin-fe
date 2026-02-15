'use client';

import { FlaskConical } from 'lucide-react';
import { ComingSoon } from '@/components/ComingSoon';

export default function ResearchPage() {
  return (
    <ComingSoon
      title="Research Repository"
      description="Central hub for user research, insights, and evidence-based decisions."
      icon={FlaskConical}
      accentColor="#95e1d3"
      features={[
        'Import from Dovetail, Grain, and more',
        'Pattern detection across interviews',
        'Evidence strength indicators',
        'Link insights to problem nodes',
        'Tag and categorize findings',
      ]}
    />
  );
}
