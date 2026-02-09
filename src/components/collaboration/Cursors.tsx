'use client';

import { memo } from 'react';
import { isLiveblocksEnabled, useOthers } from '@/lib/liveblocks.config';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Displays cursors for all other users in the room.
 * Each cursor shows the user's name and has their unique color.
 */
export function Cursors() {
  // Return null early if Liveblocks isn't configured
  if (!isLiveblocksEnabled) {
    return null;
  }

  return <CursorsInner />;
}

function CursorsInner() {
  const others = useOthers();

  return (
    <AnimatePresence>
      {others.map(({ connectionId, presence, info }) => {
        if (!presence?.cursor) return null;

        return (
          <Cursor
            key={connectionId}
            x={presence.cursor.x}
            y={presence.cursor.y}
            name={info?.name || presence.user?.name || 'Anonymous'}
            color={info?.color || presence.user?.color || '#888888'}
          />
        );
      })}
    </AnimatePresence>
  );
}


interface CursorProps {
  x: number;
  y: number;
  name: string;
  color: string;
}

const Cursor = memo(function Cursor({ x, y, name, color }: CursorProps) {
  return (
    <motion.div
      className="pointer-events-none absolute z-[9999]"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      style={{
        left: 0,
        top: 0,
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {/* Cursor arrow SVG */}
      <svg
        width="24"
        height="36"
        viewBox="0 0 24 36"
        fill="none"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
      >
        <path
          d="M5.65376 12.4553L0.354688 0.9375L21.9925 12.8832L11.8498 14.8298L5.65376 12.4553Z"
          fill={color}
        />
        <path
          d="M11.8498 14.8298L5.65376 12.4553L0.354688 0.9375L21.9925 12.8832L11.8498 14.8298Z"
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>

      {/* Name label */}
      <motion.div
        className="absolute left-4 top-4 px-2 py-1 rounded-md text-xs font-medium text-white whitespace-nowrap"
        style={{ backgroundColor: color }}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {name}
      </motion.div>
    </motion.div>
  );
});

/**
 * Hook to track and broadcast cursor position.
 * Use this in your canvas component.
 */
export function useCursorTracking() {
  // This will be implemented in the canvas component
  // to update presence with cursor position
}
