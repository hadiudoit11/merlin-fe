'use client';

import { ReactNode, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { isLiveblocksEnabled, RoomProvider, getUserColor } from '@/lib/liveblocks.config';
import { Loader2 } from 'lucide-react';

// Only import Liveblocks components if enabled
let ClientSideSuspense: any = null;
let LiveMap: any = null;
let LiveList: any = null;

if (isLiveblocksEnabled) {
  ClientSideSuspense = require('@liveblocks/react').ClientSideSuspense;
  LiveMap = require('@liveblocks/client').LiveMap;
  LiveList = require('@liveblocks/client').LiveList;
}

interface CollaborationRoomProps {
  roomId: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wrapper component that provides real-time collaboration context.
 * Use this to wrap any page/component that needs multi-user collaboration.
 * If Liveblocks is not configured, it just renders children directly.
 *
 * @example
 * <CollaborationRoom roomId={`canvas-${canvasId}`}>
 *   <Canvas />
 * </CollaborationRoom>
 */
export function CollaborationRoom({
  roomId,
  children,
  fallback,
}: CollaborationRoomProps) {
  const { data: session } = useSession();

  // If Liveblocks is not configured, just render children
  if (!isLiveblocksEnabled) {
    return <>{children}</>;
  }

  // Generate user info from session
  const userInfo = useMemo(() => {
    const userId = session?.user?.email || 'anonymous';
    return {
      id: userId,
      info: {
        name: session?.user?.name || 'Anonymous',
        email: session?.user?.email || '',
        avatar: session?.user?.image || undefined,
        color: getUserColor(userId),
      },
    };
  }, [session]);

  // Initial presence state
  const initialPresence = useMemo(
    () => ({
      cursor: null,
      selectedNodeIds: [],
      user: userInfo.info,
      currentView: 'canvas' as const,
    }),
    [userInfo]
  );

  const defaultFallback = (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Connecting to collaboration session...
        </span>
      </div>
    </div>
  );

  return (
    <RoomProvider
      id={roomId}
      initialPresence={initialPresence}
      initialStorage={{
        // Initial empty storage - will be populated when canvas loads
        nodes: new LiveMap(),
        connections: new LiveList([]),
        documents: new LiveMap(),
      }}
    >
      <ClientSideSuspense fallback={fallback || defaultFallback}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
