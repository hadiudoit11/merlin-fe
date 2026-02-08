/**
 * Confluence-like Document API
 * Supports spaces, folders, and hierarchical pages
 */

import {
  Space,
  Folder,
  Page,
  PageTreeNode,
  RecentPage,
  PageTemplate,
  SearchResult,
} from '@/types/document';

const STORAGE_KEYS = {
  SPACES: 'merlin_docs_spaces',
  FOLDERS: 'merlin_docs_folders',
  PAGES: 'merlin_docs_pages',
  RECENT: 'merlin_docs_recent',
  STARRED: 'merlin_docs_starred',
};

// Default templates
const DEFAULT_TEMPLATES: PageTemplate[] = [
  {
    id: 'tpl-blank',
    name: 'Blank Page',
    description: 'Start from scratch',
    icon: '📄',
    category: 'Basic',
    isGlobal: true,
    content: JSON.stringify({
      type: 'doc',
      content: [{ type: 'paragraph' }],
    }),
  },
  {
    id: 'tpl-meeting',
    name: 'Meeting Notes',
    description: 'Capture meeting discussions and action items',
    icon: '📝',
    category: 'Meetings',
    isGlobal: true,
    content: JSON.stringify({
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Meeting Notes' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Date' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '[Enter date]' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Attendees' }] },
        { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '[Name]' }] }] }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Agenda' }] },
        { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '[Topic]' }] }] }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Discussion' }] },
        { type: 'paragraph' },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Action Items' }] },
        { type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: '[Action item]' }] }] }] },
      ],
    }),
  },
  {
    id: 'tpl-decision',
    name: 'Decision Document',
    description: 'Document decisions with context and rationale',
    icon: '⚖️',
    category: 'Planning',
    isGlobal: true,
    content: JSON.stringify({
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Decision: [Title]' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Status' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Draft / Proposed / Accepted / Deprecated' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Context' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'What is the issue that we are seeing that is motivating this decision?' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Options Considered' }] },
        { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Option 1: ...' }] }] }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Decision' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'What is the decision that was made?' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Consequences' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'What are the resulting effects of this decision?' }] },
      ],
    }),
  },
  {
    id: 'tpl-requirements',
    name: 'Requirements Document',
    description: 'Define project requirements and specifications',
    icon: '📋',
    category: 'Planning',
    isGlobal: true,
    content: JSON.stringify({
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Requirements: [Feature Name]' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Overview' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Brief description of the feature...' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Goals' }] },
        { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '[Goal 1]' }] }] }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'User Stories' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'As a [user], I want [action] so that [benefit].' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Functional Requirements' }] },
        { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '[Requirement]' }] }] }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Non-Functional Requirements' }] },
        { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '[Requirement]' }] }] }] },
      ],
    }),
  },
  {
    id: 'tpl-retrospective',
    name: 'Retrospective',
    description: 'Team retrospective with what went well, improvements, and actions',
    icon: '🔄',
    category: 'Meetings',
    isGlobal: true,
    content: JSON.stringify({
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Sprint Retrospective' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '✅ What Went Well' }] },
        { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph' }] }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '🔧 What Could Be Improved' }] },
        { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph' }] }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '💡 Action Items' }] },
        { type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph' }] }] },
      ],
    }),
  },
];

// Seed data
const SEED_SPACES: Space[] = [
  {
    id: 'space-eng',
    key: 'ENG',
    name: 'Engineering',
    description: 'Technical documentation and engineering resources',
    icon: '⚙️',
    color: '#8b5cf6',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    isPersonal: false,
  },
  {
    id: 'space-product',
    key: 'PROD',
    name: 'Product',
    description: 'Product requirements, roadmaps, and planning documents',
    icon: '🎯',
    color: '#06b6d4',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    isPersonal: false,
  },
  {
    id: 'space-team',
    key: 'TEAM',
    name: 'Team Wiki',
    description: 'Team processes, onboarding, and general knowledge base',
    icon: '👥',
    color: '#10b981',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    isPersonal: false,
  },
];

const SEED_FOLDERS: Folder[] = [
  { id: 'folder-arch', name: 'Architecture', spaceId: 'space-eng', order: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'folder-api', name: 'API Documentation', spaceId: 'space-eng', order: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'folder-guides', name: 'Developer Guides', spaceId: 'space-eng', order: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'folder-roadmap', name: 'Roadmap', spaceId: 'space-product', order: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'folder-specs', name: 'Specifications', spaceId: 'space-product', order: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'folder-onboard', name: 'Onboarding', spaceId: 'space-team', order: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'folder-process', name: 'Processes', spaceId: 'space-team', order: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const SEED_PAGES: Page[] = [
  {
    id: 'page-welcome',
    title: 'Welcome to Engineering',
    content: JSON.stringify({ type: 'doc', content: [{ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Welcome to Engineering' }] }, { type: 'paragraph', content: [{ type: 'text', text: 'This is the engineering team wiki. Here you will find all technical documentation, architecture decisions, and developer guides.' }] }] }),
    spaceId: 'space-eng',
    order: 0,
    status: 'published',
    version: 1,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    icon: '👋',
  },
  {
    id: 'page-arch-overview',
    title: 'Architecture Overview',
    content: JSON.stringify({ type: 'doc', content: [{ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'System Architecture' }] }, { type: 'paragraph', content: [{ type: 'text', text: 'Our system follows a microservices architecture with the following components...' }] }] }),
    spaceId: 'space-eng',
    folderId: 'folder-arch',
    order: 0,
    status: 'published',
    version: 3,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    icon: '🏗️',
  },
  {
    id: 'page-api-auth',
    title: 'Authentication API',
    content: JSON.stringify({ type: 'doc', content: [{ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Authentication API' }] }, { type: 'paragraph', content: [{ type: 'text', text: 'This document describes the authentication endpoints and flows.' }] }] }),
    spaceId: 'space-eng',
    folderId: 'folder-api',
    order: 0,
    status: 'published',
    version: 2,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    icon: '🔐',
  },
  {
    id: 'page-getting-started',
    title: 'Getting Started',
    content: JSON.stringify({ type: 'doc', content: [{ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Getting Started' }] }, { type: 'paragraph', content: [{ type: 'text', text: 'Follow these steps to set up your development environment...' }] }] }),
    spaceId: 'space-eng',
    folderId: 'folder-guides',
    order: 0,
    status: 'published',
    version: 1,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    icon: '🚀',
  },
  {
    id: 'page-roadmap-q1',
    title: 'Q1 2025 Roadmap',
    content: JSON.stringify({ type: 'doc', content: [{ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Q1 2025 Roadmap' }] }, { type: 'paragraph', content: [{ type: 'text', text: 'Our priorities for Q1 2025...' }] }] }),
    spaceId: 'space-product',
    folderId: 'folder-roadmap',
    order: 0,
    status: 'published',
    version: 5,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    icon: '🗺️',
  },
  {
    id: 'page-onboard-checklist',
    title: 'New Hire Checklist',
    content: JSON.stringify({ type: 'doc', content: [{ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'New Hire Checklist' }] }, { type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Set up development environment' }] }] }, { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Complete security training' }] }] }] }] }),
    spaceId: 'space-team',
    folderId: 'folder-onboard',
    order: 0,
    status: 'published',
    version: 2,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    icon: '✅',
  },
];

class DocsApiService {
  private getStorage<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    try {
      return JSON.parse(stored);
    } catch {
      return defaultValue;
    }
  }

  private setStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  private initializeData(): void {
    if (typeof window === 'undefined') return;

    // Initialize with seed data if empty
    if (!localStorage.getItem(STORAGE_KEYS.SPACES)) {
      this.setStorage(STORAGE_KEYS.SPACES, SEED_SPACES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.FOLDERS)) {
      this.setStorage(STORAGE_KEYS.FOLDERS, SEED_FOLDERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAGES)) {
      this.setStorage(STORAGE_KEYS.PAGES, SEED_PAGES);
    }
  }

  constructor() {
    this.initializeData();
  }

  // ============ Space Operations ============

  async listSpaces(): Promise<Space[]> {
    return this.getStorage<Space[]>(STORAGE_KEYS.SPACES, SEED_SPACES);
  }

  async getSpace(spaceId: string): Promise<Space | null> {
    const spaces = await this.listSpaces();
    return spaces.find(s => s.id === spaceId) || null;
  }

  async getSpaceByKey(key: string): Promise<Space | null> {
    const spaces = await this.listSpaces();
    return spaces.find(s => s.key.toLowerCase() === key.toLowerCase()) || null;
  }

  async createSpace(data: Omit<Space, 'id' | 'createdAt' | 'updatedAt'>): Promise<Space> {
    const spaces = await this.listSpaces();
    const newSpace: Space = {
      ...data,
      id: `space-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    spaces.push(newSpace);
    this.setStorage(STORAGE_KEYS.SPACES, spaces);
    return newSpace;
  }

  async updateSpace(spaceId: string, data: Partial<Space>): Promise<Space | null> {
    const spaces = await this.listSpaces();
    const index = spaces.findIndex(s => s.id === spaceId);
    if (index === -1) return null;

    spaces[index] = {
      ...spaces[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.setStorage(STORAGE_KEYS.SPACES, spaces);
    return spaces[index];
  }

  async deleteSpace(spaceId: string): Promise<boolean> {
    const spaces = await this.listSpaces();
    const filtered = spaces.filter(s => s.id !== spaceId);
    if (filtered.length === spaces.length) return false;

    this.setStorage(STORAGE_KEYS.SPACES, filtered);

    // Delete all folders and pages in this space
    const folders = await this.listFolders(spaceId);
    const pages = await this.listPages(spaceId);

    const allFolders = this.getStorage<Folder[]>(STORAGE_KEYS.FOLDERS, []);
    const allPages = this.getStorage<Page[]>(STORAGE_KEYS.PAGES, []);

    this.setStorage(STORAGE_KEYS.FOLDERS, allFolders.filter(f => f.spaceId !== spaceId));
    this.setStorage(STORAGE_KEYS.PAGES, allPages.filter(p => p.spaceId !== spaceId));

    return true;
  }

  // ============ Folder Operations ============

  async listFolders(spaceId?: string): Promise<Folder[]> {
    const folders = this.getStorage<Folder[]>(STORAGE_KEYS.FOLDERS, SEED_FOLDERS);
    if (spaceId) {
      return folders.filter(f => f.spaceId === spaceId).sort((a, b) => a.order - b.order);
    }
    return folders.sort((a, b) => a.order - b.order);
  }

  async getFolder(folderId: string): Promise<Folder | null> {
    const folders = this.getStorage<Folder[]>(STORAGE_KEYS.FOLDERS, []);
    return folders.find(f => f.id === folderId) || null;
  }

  async createFolder(data: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>): Promise<Folder> {
    const folders = this.getStorage<Folder[]>(STORAGE_KEYS.FOLDERS, []);
    const newFolder: Folder = {
      ...data,
      id: `folder-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    folders.push(newFolder);
    this.setStorage(STORAGE_KEYS.FOLDERS, folders);
    return newFolder;
  }

  async updateFolder(folderId: string, data: Partial<Folder>): Promise<Folder | null> {
    const folders = this.getStorage<Folder[]>(STORAGE_KEYS.FOLDERS, []);
    const index = folders.findIndex(f => f.id === folderId);
    if (index === -1) return null;

    folders[index] = {
      ...folders[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.setStorage(STORAGE_KEYS.FOLDERS, folders);
    return folders[index];
  }

  async deleteFolder(folderId: string): Promise<boolean> {
    const folders = this.getStorage<Folder[]>(STORAGE_KEYS.FOLDERS, []);
    const filtered = folders.filter(f => f.id !== folderId);
    if (filtered.length === folders.length) return false;

    this.setStorage(STORAGE_KEYS.FOLDERS, filtered);

    // Move pages in this folder to root
    const pages = this.getStorage<Page[]>(STORAGE_KEYS.PAGES, []);
    const updated = pages.map(p => p.folderId === folderId ? { ...p, folderId: undefined } : p);
    this.setStorage(STORAGE_KEYS.PAGES, updated);

    return true;
  }

  // ============ Page Operations ============

  async listPages(spaceId?: string, folderId?: string): Promise<Page[]> {
    const pages = this.getStorage<Page[]>(STORAGE_KEYS.PAGES, SEED_PAGES);
    let filtered = pages;

    if (spaceId) {
      filtered = filtered.filter(p => p.spaceId === spaceId);
    }
    if (folderId !== undefined) {
      filtered = filtered.filter(p => p.folderId === folderId);
    }

    return filtered.sort((a, b) => a.order - b.order);
  }

  async getPage(pageId: string): Promise<Page | null> {
    const pages = this.getStorage<Page[]>(STORAGE_KEYS.PAGES, []);
    const page = pages.find(p => p.id === pageId);
    if (!page) return null;

    // Build breadcrumbs
    const breadcrumbs = await this.getPageBreadcrumbs(page);

    // Get children
    const children = pages
      .filter(p => p.parentId === pageId)
      .sort((a, b) => a.order - b.order);

    return { ...page, breadcrumbs, children };
  }

  async getPageBreadcrumbs(page: Page): Promise<Page['breadcrumbs']> {
    const breadcrumbs: Page['breadcrumbs'] = [];

    // Add space
    const space = await this.getSpace(page.spaceId);
    if (space) {
      breadcrumbs.push({ id: space.id, title: space.name, type: 'space' });
    }

    // Add folder if exists
    if (page.folderId) {
      const folder = await this.getFolder(page.folderId);
      if (folder) {
        breadcrumbs.push({ id: folder.id, title: folder.name, type: 'folder' });
      }
    }

    // Add parent pages
    if (page.parentId) {
      const parentChain = await this.getParentChain(page.parentId);
      breadcrumbs.push(...parentChain.map(p => ({ id: p.id, title: p.title, type: 'page' as const })));
    }

    return breadcrumbs;
  }

  private async getParentChain(pageId: string): Promise<Page[]> {
    const chain: Page[] = [];
    const pages = this.getStorage<Page[]>(STORAGE_KEYS.PAGES, []);

    let current = pages.find(p => p.id === pageId);
    while (current) {
      chain.unshift(current);
      current = current.parentId ? pages.find(p => p.id === current!.parentId) : undefined;
    }

    return chain;
  }

  async createPage(data: Omit<Page, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<Page> {
    const pages = this.getStorage<Page[]>(STORAGE_KEYS.PAGES, []);
    const newPage: Page = {
      ...data,
      id: `page-${Date.now()}`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    pages.push(newPage);
    this.setStorage(STORAGE_KEYS.PAGES, pages);
    return newPage;
  }

  async updatePage(pageId: string, data: Partial<Page>): Promise<Page | null> {
    const pages = this.getStorage<Page[]>(STORAGE_KEYS.PAGES, []);
    const index = pages.findIndex(p => p.id === pageId);
    if (index === -1) return null;

    const currentPage = pages[index];
    pages[index] = {
      ...currentPage,
      ...data,
      version: data.content !== currentPage.content ? currentPage.version + 1 : currentPage.version,
      updatedAt: new Date().toISOString(),
    };
    this.setStorage(STORAGE_KEYS.PAGES, pages);
    return pages[index];
  }

  async deletePage(pageId: string): Promise<boolean> {
    const pages = this.getStorage<Page[]>(STORAGE_KEYS.PAGES, []);

    // Get all descendant pages
    const toDelete = new Set<string>([pageId]);
    const findDescendants = (id: string) => {
      pages.filter(p => p.parentId === id).forEach(p => {
        toDelete.add(p.id);
        findDescendants(p.id);
      });
    };
    findDescendants(pageId);

    const filtered = pages.filter(p => !toDelete.has(p.id));
    if (filtered.length === pages.length) return false;

    this.setStorage(STORAGE_KEYS.PAGES, filtered);
    return true;
  }

  async movePage(pageId: string, target: { spaceId?: string; folderId?: string; parentId?: string; order?: number }): Promise<Page | null> {
    return this.updatePage(pageId, target);
  }

  // ============ Tree Operations ============

  async getPageTree(spaceId: string): Promise<PageTreeNode[]> {
    const folders = await this.listFolders(spaceId);
    const pages = await this.listPages(spaceId);

    const buildTree = (parentId?: string, folderId?: string): PageTreeNode[] => {
      const nodes: PageTreeNode[] = [];

      // Add folders at this level
      if (!parentId) {
        const folderNodes = folders
          .filter(f => f.parentId === folderId)
          .map(f => ({
            id: f.id,
            title: f.name,
            type: 'folder' as const,
            children: buildTree(undefined, f.id),
            hasChildren: pages.some(p => p.folderId === f.id) || folders.some(sf => sf.parentId === f.id),
          }));
        nodes.push(...folderNodes);
      }

      // Add pages at this level
      const pageNodes = pages
        .filter(p => p.parentId === parentId && p.folderId === folderId)
        .map(p => ({
          id: p.id,
          title: p.title,
          type: 'page' as const,
          icon: p.icon,
          children: buildTree(p.id, folderId),
          hasChildren: pages.some(cp => cp.parentId === p.id),
        }));
      nodes.push(...pageNodes);

      return nodes;
    };

    // Build tree for root level (no folder)
    const rootPages = pages
      .filter(p => !p.folderId && !p.parentId)
      .map(p => ({
        id: p.id,
        title: p.title,
        type: 'page' as const,
        icon: p.icon,
        children: buildTree(p.id, undefined),
        hasChildren: pages.some(cp => cp.parentId === p.id),
      }));

    // Build tree for each folder
    const folderNodes = folders
      .filter(f => !f.parentId)
      .map(f => ({
        id: f.id,
        title: f.name,
        type: 'folder' as const,
        children: [
          ...folders
            .filter(sf => sf.parentId === f.id)
            .map(sf => ({
              id: sf.id,
              title: sf.name,
              type: 'folder' as const,
              children: buildTree(undefined, sf.id),
              hasChildren: pages.some(p => p.folderId === sf.id),
            })),
          ...pages
            .filter(p => p.folderId === f.id && !p.parentId)
            .map(p => ({
              id: p.id,
              title: p.title,
              type: 'page' as const,
              icon: p.icon,
              children: buildTree(p.id, f.id),
              hasChildren: pages.some(cp => cp.parentId === p.id),
            })),
        ],
        hasChildren: pages.some(p => p.folderId === f.id) || folders.some(sf => sf.parentId === f.id),
      }));

    return [...folderNodes, ...rootPages];
  }

  // ============ Recent & Starred ============

  async getRecentPages(limit: number = 10): Promise<RecentPage[]> {
    const recent = this.getStorage<RecentPage[]>(STORAGE_KEYS.RECENT, []);
    return recent.slice(0, limit);
  }

  async addToRecent(pageId: string): Promise<void> {
    const page = await this.getPage(pageId);
    if (!page) return;

    const space = await this.getSpace(page.spaceId);
    if (!space) return;

    const recent = this.getStorage<RecentPage[]>(STORAGE_KEYS.RECENT, []);
    const filtered = recent.filter(r => r.id !== pageId);

    filtered.unshift({
      id: page.id,
      title: page.title,
      spaceId: space.id,
      spaceKey: space.key,
      spaceName: space.name,
      viewedAt: new Date().toISOString(),
      icon: page.icon,
    });

    this.setStorage(STORAGE_KEYS.RECENT, filtered.slice(0, 50));
  }

  async getStarredPages(): Promise<Page[]> {
    const starred = this.getStorage<string[]>(STORAGE_KEYS.STARRED, []);
    const pages = this.getStorage<Page[]>(STORAGE_KEYS.PAGES, []);
    return pages.filter(p => starred.includes(p.id));
  }

  async toggleStar(pageId: string): Promise<boolean> {
    const starred = this.getStorage<string[]>(STORAGE_KEYS.STARRED, []);
    const index = starred.indexOf(pageId);

    if (index === -1) {
      starred.push(pageId);
    } else {
      starred.splice(index, 1);
    }

    this.setStorage(STORAGE_KEYS.STARRED, starred);
    return index === -1;
  }

  async isStarred(pageId: string): Promise<boolean> {
    const starred = this.getStorage<string[]>(STORAGE_KEYS.STARRED, []);
    return starred.includes(pageId);
  }

  // ============ Templates ============

  async getTemplates(spaceId?: string): Promise<PageTemplate[]> {
    const globalTemplates = DEFAULT_TEMPLATES.filter(t => t.isGlobal);
    // Could add space-specific templates here
    return globalTemplates;
  }

  // ============ Search ============

  async search(query: string, spaceId?: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    const spaces = await this.listSpaces();
    const pages = this.getStorage<Page[]>(STORAGE_KEYS.PAGES, []);

    // Search spaces
    spaces
      .filter(s => !spaceId || s.id === spaceId)
      .filter(s => s.name.toLowerCase().includes(lowerQuery) || s.description?.toLowerCase().includes(lowerQuery))
      .forEach(s => {
        results.push({
          id: s.id,
          type: 'space',
          title: s.name,
          excerpt: s.description,
          updatedAt: s.updatedAt,
        });
      });

    // Search pages
    pages
      .filter(p => !spaceId || p.spaceId === spaceId)
      .filter(p => {
        const titleMatch = p.title.toLowerCase().includes(lowerQuery);
        let contentMatch = false;
        try {
          const content = JSON.parse(p.content);
          contentMatch = JSON.stringify(content).toLowerCase().includes(lowerQuery);
        } catch {
          contentMatch = p.content.toLowerCase().includes(lowerQuery);
        }
        return titleMatch || contentMatch;
      })
      .forEach(p => {
        const space = spaces.find(s => s.id === p.spaceId);
        results.push({
          id: p.id,
          type: 'page',
          title: p.title,
          spaceKey: space?.key,
          spaceName: space?.name,
          updatedAt: p.updatedAt,
        });
      });

    return results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
}

// Export singleton
export const docsApi = new DocsApiService();
