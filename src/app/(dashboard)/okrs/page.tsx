'use client';

import { Target } from 'lucide-react';
import { ComingSoon } from '@/components/ComingSoon';

export default function OKRsPage() {
  return (
    <ComingSoon
      title="OKR Dashboard"
      description="Track objectives and key results across your organization with real-time progress."
      icon={Target}
      accentColor="#ffe66d"
      features={[
        'Hierarchical OKR visualization',
        'Auto-calculated progress from linked metrics',
        'Confidence level tracking',
        'Check-in reminders and history',
        'Alignment mapping across teams',
      ]}
    />
  );
}
