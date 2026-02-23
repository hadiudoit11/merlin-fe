/**
 * Unified API layer that switches between mock and real API based on environment.
 *
 * Set NEXT_PUBLIC_USE_MOCK_API=true in .env.local to use mock data (default for dev)
 * Set NEXT_PUBLIC_USE_MOCK_API=false to use real backend API
 */

import { canvasApi as realCanvasApi } from './canvas-api';
import { mockCanvasApi } from './canvas-mock';

// Check if we should use mock API
// Default to true if not specified (for easier frontend development)
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';

// Export the appropriate API based on environment
export const api = USE_MOCK_API ? mockCanvasApi : realCanvasApi;

// Also export a flag for components to check
export const isMockMode = USE_MOCK_API;

// Re-export types
export * from '@/types/canvas';

// Log which mode we're in (only in development)
if (typeof window !== 'undefined') {
  console.log(`🔧 Merlin API Mode: ${USE_MOCK_API ? 'MOCK (localStorage)' : 'REAL (backend)'}`);
  console.log(`🔧 NEXT_PUBLIC_USE_MOCK_API env value: "${process.env.NEXT_PUBLIC_USE_MOCK_API}"`);
}
