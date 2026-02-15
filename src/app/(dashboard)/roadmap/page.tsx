'use client';

import { Map } from 'lucide-react';
import { ComingSoon } from '@/components/ComingSoon';

export default function RoadmapPage() {
  return (
    <ComingSoon
      title="Roadmap"
      description="Plan your product roadmap with Now, Next, and Later horizons."
      icon={Map}
      accentColor="#ff6b6b"
      features={[
        'Drag-and-drop between horizons',
        'Progress indicators from linked OKRs',
        'Capacity and dependency visualization',
        'Stakeholder visibility filters',
        'Export to image or PDF',
      ]}
    />
  );
}
