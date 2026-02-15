'use client';

import { Video } from 'lucide-react';
import { ComingSoon } from '@/components/ComingSoon';

export default function MeetingsPage() {
  return (
    <ComingSoon
      title="Meeting Intelligence"
      description="Never miss an action item. AI-powered meeting summaries and follow-ups."
      icon={Video}
      accentColor="#4ecdc4"
      features={[
        'Automatic transcription from Zoom, Teams, Meet',
        'AI-generated action items and decisions',
        'Link discussions to canvas nodes',
        'Search across all meetings',
        'Automated follow-up reminders',
      ]}
    />
  );
}
