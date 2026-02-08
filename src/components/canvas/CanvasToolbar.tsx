'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Hand,
  MousePointer,
  Grid3X3,
} from 'lucide-react';
import { Viewport } from '@/types/canvas';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CanvasToolbarProps {
  viewport: Viewport;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}

export function CanvasToolbar({
  viewport,
  onZoomIn,
  onZoomOut,
  onResetView,
}: CanvasToolbarProps) {
  const zoomPercentage = Math.round(viewport.zoom * 100);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg shadow-lg p-1">
        {/* Zoom controls */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom out</TooltipContent>
        </Tooltip>

        <div className="w-16 text-center text-sm font-medium tabular-nums">
          {zoomPercentage}%
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom in</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onResetView}>
              <Maximize className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reset view</TooltipContent>
        </Tooltip>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
        <span className="font-medium">Alt+Drag</span> to pan &middot;{' '}
        <span className="font-medium">Scroll</span> to zoom
      </div>
    </TooltipProvider>
  );
}
