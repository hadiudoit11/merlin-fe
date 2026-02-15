'use client';

import { Calendar } from 'lucide-react';
import { ComingSoon } from '@/components/ComingSoon';

export default function TimelinePage() {
  return (
    <ComingSoon
      title="Timeline"
      description="Visualize the entire lifecycle of your initiatives from discovery to launch."
      icon={Calendar}
      accentColor="#4ecdc4"
      features={[
        'Drag initiatives between lifecycle stages',
        'Week, month, and quarter zoom levels',
        'Dependencies visualization',
        'Filter by team, status, and owner',
        'Click to jump to related canvas',
      ]}
    />
  );
}
