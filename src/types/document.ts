// Confluence-like Document System Types

export interface Space {
  id: string;
  key: string; // Short unique key like "PROJ", "ENG", "HR"
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  isPersonal?: boolean;
  isArchived?: boolean;
  permissions?: SpacePermissions;
  homePageId?: string;
}

export interface SpacePermissions {
  canView: boolean;
  canEdit: boolean;
  canAdmin: boolean;
}

export interface Folder {
  id: string;
  name: string;
  spaceId: string;
  parentId?: string; // For nested folders
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  title: string;
  content: string; // Tiptap JSON content
  spaceId: string;
  folderId?: string;
  parentId?: string; // For nested pages (child pages)
  order: number;
  status: 'draft' | 'published' | 'archived';
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  isStarred?: boolean;
  labels?: string[];
  coverImage?: string;
  icon?: string;

  // Computed/loaded fields
  children?: Page[];
  breadcrumbs?: PageBreadcrumb[];
  lastViewed?: string;
}

export interface PageBreadcrumb {
  id: string;
  title: string;
  type: 'space' | 'folder' | 'page';
}

export interface PageVersion {
  id: string;
  pageId: string;
  version: number;
  content: string;
  createdAt: string;
  createdBy?: string;
  message?: string;
}

export interface PageComment {
  id: string;
  pageId: string;
  content: string;
  createdAt: string;
  createdBy?: string;
  parentId?: string; // For replies
  isResolved?: boolean;
}

export interface RecentPage {
  id: string;
  title: string;
  spaceId: string;
  spaceKey: string;
  spaceName: string;
  viewedAt: string;
  icon?: string;
}

export interface PageTemplate {
  id: string;
  name: string;
  description?: string;
  content: string;
  icon?: string;
  category?: string;
  isGlobal?: boolean;
  spaceId?: string;
}

// Tree structure for sidebar navigation
export interface PageTreeNode {
  id: string;
  title: string;
  type: 'folder' | 'page';
  icon?: string;
  children?: PageTreeNode[];
  isExpanded?: boolean;
  hasChildren?: boolean;
}

// Search result types
export interface SearchResult {
  id: string;
  type: 'space' | 'page' | 'folder';
  title: string;
  excerpt?: string;
  spaceKey?: string;
  spaceName?: string;
  updatedAt: string;
  path?: string;
}

// Legacy type for backward compatibility with canvas doc nodes
export interface Document {
  id: number;
  name: string;
  content: string;
  canvasId: number;
  canvasName: string;
  nodeId: number;
  createdAt: string;
  updatedAt: string;
  author?: string;
  tags?: string[];
  wordCount?: number;
  isStarred?: boolean;
}
