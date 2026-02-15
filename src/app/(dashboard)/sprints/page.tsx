'use client';

import { Zap } from 'lucide-react';
import { ComingSoon } from '@/components/ComingSoon';

export default function SprintsPage() {
  return (
    <ComingSoon
      title="Sprint Cockpit"
      description="Your live dashboard for sprint health, standups, and team capacity."
      icon={Zap}
      accentColor="#ffe66d"
      features={[
        'Real-time velocity tracking',
        'Burndown chart visualization',
        'At-risk items highlighting',
        'Team capacity overview',
        'One-click standup notes',
      ]}
    />
  );
}
