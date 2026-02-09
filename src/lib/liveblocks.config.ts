import { createClient, Client } from "@liveblocks/client";
import { createRoomContext, createLiveblocksContext } from "@liveblocks/react";

// Check if Liveblocks is configured
export const isLiveblocksEnabled = !!process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

// Create the Liveblocks client only if API key is present
const client: Client | null = isLiveblocksEnabled
  ? createClient({
      publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
      throttle: 16, // ~60fps for smooth cursor movement
    })
  : null;

// Types for presence (what each user broadcasts to others)
export type Presence = {
  // Cursor position on canvas
  cursor: { x: number; y: number } | null;
  // Currently selected node IDs
  selectedNodeIds: number[];
  // User info
  user: {
    name: string;
    email: string;
    avatar?: string;
    color: string;
  };
  // Current view (which canvas/doc they're viewing)
  currentView: "canvas" | "document";
  // If in document view, which node
  documentNodeId?: number;
};

// Types for storage (shared state synced via CRDT)
export type Storage = {
  // Canvas nodes as a LiveMap for real-time sync
  nodes: LiveMap<string, LiveObject<CanvasNodeData>>;
  // Connections between nodes
  connections: LiveList<ConnectionData>;
  // Document contents (for Tiptap collaboration)
  documents: LiveMap<string, LiveObject<DocumentData>>;
};

// Node data structure for Liveblocks storage
export type CanvasNodeData = {
  id: number;
  name: string;
  node_type: string;
  content: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  z_index: number;
  is_locked: boolean;
  is_collapsed: boolean;
};

// Connection data structure
export type ConnectionData = {
  id: number;
  source_node_id: number;
  target_node_id: number;
  source_anchor?: string;
  target_anchor?: string;
  connection_type: string;
};

// Document data for collaborative editing
export type DocumentData = {
  nodeId: number;
  // Yjs document state is handled separately via Liveblocks Yjs provider
};

// User metadata stored in Liveblocks
export type UserMeta = {
  id: string;
  info: {
    name: string;
    email: string;
    avatar?: string;
    color: string;
  };
};

// Room event types (for broadcasting events)
export type RoomEvent =
  | { type: "NODE_CREATED"; nodeId: number }
  | { type: "NODE_DELETED"; nodeId: number }
  | { type: "NODE_UPDATED"; nodeId: number }
  | { type: "CONNECTION_CREATED"; connectionId: number }
  | { type: "CONNECTION_DELETED"; connectionId: number }
  | { type: "CURSOR_CLICK"; position: { x: number; y: number } };

// Import Liveblocks types
import type { LiveMap, LiveObject, LiveList } from "@liveblocks/client";

// Create room context with typed hooks (only if client is configured)
const roomContext = client
  ? createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client)
  : null;

const liveblocksContext = client ? createLiveblocksContext(client) : null;

// Export hooks - they will throw if used without Liveblocks configured
export const RoomProvider = roomContext?.RoomProvider ?? (() => { throw new Error("Liveblocks not configured"); });
export const useRoom = roomContext?.useRoom ?? (() => { throw new Error("Liveblocks not configured"); });
export const useMyPresence = roomContext?.useMyPresence ?? (() => { throw new Error("Liveblocks not configured"); });
export const useUpdateMyPresence = roomContext?.useUpdateMyPresence ?? (() => { throw new Error("Liveblocks not configured"); });
export const useOthers = roomContext?.useOthers ?? (() => { throw new Error("Liveblocks not configured"); });
export const useOthersMapped = roomContext?.useOthersMapped ?? (() => { throw new Error("Liveblocks not configured"); });
export const useOthersConnectionIds = roomContext?.useOthersConnectionIds ?? (() => { throw new Error("Liveblocks not configured"); });
export const useOther = roomContext?.useOther ?? (() => { throw new Error("Liveblocks not configured"); });
export const useSelf = roomContext?.useSelf ?? (() => { throw new Error("Liveblocks not configured"); });
export const useBroadcastEvent = roomContext?.useBroadcastEvent ?? (() => { throw new Error("Liveblocks not configured"); });
export const useEventListener = roomContext?.useEventListener ?? (() => { throw new Error("Liveblocks not configured"); });
export const useStorage = roomContext?.useStorage ?? (() => { throw new Error("Liveblocks not configured"); });
export const useMutation = roomContext?.useMutation ?? (() => { throw new Error("Liveblocks not configured"); });
export const useStatus = roomContext?.useStatus ?? (() => { throw new Error("Liveblocks not configured"); });
export const useLostConnectionListener = roomContext?.useLostConnectionListener ?? (() => { throw new Error("Liveblocks not configured"); });

// Create Liveblocks context for global features
export const LiveblocksProvider = liveblocksContext?.LiveblocksProvider ?? (() => { throw new Error("Liveblocks not configured"); });
export const useInboxNotifications = liveblocksContext?.useInboxNotifications ?? (() => { throw new Error("Liveblocks not configured"); });
export const useUnreadInboxNotificationsCount = liveblocksContext?.useUnreadInboxNotificationsCount ?? (() => { throw new Error("Liveblocks not configured"); });

// Helper to generate consistent user colors
export function getUserColor(userId: string): string {
  const colors = [
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#FFE66D", // Yellow
    "#95E1D3", // Mint
    "#A66CFF", // Purple
    "#FF9F43", // Orange
    "#54A0FF", // Blue
    "#5F27CD", // Indigo
    "#00D2D3", // Cyan
    "#FF6B81", // Pink
  ];

  // Generate consistent color based on user ID
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
