'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Plus,
  Search,
  Settings,
  FileText,
  FolderPlus,
  Clock,
  ChevronRight,
  MoreVertical,
  Edit,
  Trash2,
  Star,
  StarOff,
  Copy,
  Move,
  Filter,
  SortAsc,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageTree } from '@/components/docs/PageTree';
import { docsApi } from '@/lib/docs-api';
import { Space, Page, Folder, PageTreeNode, PageTemplate } from '@/types/document';

const PAGE_ICONS = ['📄', '📝', '📋', '📑', '🗒️', '📓', '📔', '📕', '📗', '📘', '📙', '📚', '🎯', '💡', '⭐', '🚀', '🔧', '📊'];

interface SpacePageProps {
  params: Promise<{ spaceKey: string }>;
}

export default function SpacePage({ params }: SpacePageProps) {
  const { spaceKey } = use(params);
  const router = useRouter();

  const [space, setSpace] = useState<Space | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [pageTree, setPageTree] = useState<PageTreeNode[]>([]);
  const [templates, setTemplates] = useState<PageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('updated');

  // Create dialogs
  const [showCreatePageDialog, setShowCreatePageDialog] = useState(false);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [createContext, setCreateContext] = useState<{ parentId?: string; folderId?: string }>({});
  const [newPage, setNewPage] = useState({ title: '', icon: '📄', templateId: '' });
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    loadSpace();
  }, [spaceKey]);

  const loadSpace = async () => {
    try {
      setIsLoading(true);
      const spaceData = await docsApi.getSpaceByKey(spaceKey);
      if (!spaceData) {
        router.push('/documents');
        return;
      }

      setSpace(spaceData);

      const [pagesData, foldersData, treeData, templatesData] = await Promise.all([
        docsApi.listPages(spaceData.id),
        docsApi.listFolders(spaceData.id),
        docsApi.getPageTree(spaceData.id),
        docsApi.getTemplates(spaceData.id),
      ]);

      setPages(pagesData);
      setFolders(foldersData);
      setPageTree(treeData);
      setTemplates(templatesData);
    } catch (err) {
      console.error('Failed to load space:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePage = async () => {
    if (!space || !newPage.title.trim()) return;

    try {
      const template = templates.find((t) => t.id === newPage.templateId);
      const page = await docsApi.createPage({
        title: newPage.title,
        content: template?.content || JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] }),
        spaceId: space.id,
        folderId: createContext.folderId,
        parentId: createContext.parentId,
        icon: newPage.icon,
        order: pages.length,
        status: 'draft',
      });

      // Navigate to the new page
      router.push(`/documents/spaces/${spaceKey}/pages/${page.id}`);
      setShowCreatePageDialog(false);
      setNewPage({ title: '', icon: '📄', templateId: '' });
      setCreateContext({});
    } catch (err) {
      console.error('Failed to create page:', err);
    }
  };

  const handleCreateFolder = async () => {
    if (!space || !newFolderName.trim()) return;

    try {
      await docsApi.createFolder({
        name: newFolderName,
        spaceId: space.id,
        parentId: createContext.folderId,
        order: folders.length,
      });

      setShowCreateFolderDialog(false);
      setNewFolderName('');
      setCreateContext({});
      loadSpace();
    } catch (err) {
      console.error('Failed to create folder:', err);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page and all its child pages?')) return;

    try {
      await docsApi.deletePage(pageId);
      loadSpace();
    } catch (err) {
      console.error('Failed to delete page:', err);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder? Pages inside will be moved to the root level.')) return;

    try {
      await docsApi.deleteFolder(folderId);
      loadSpace();
    } catch (err) {
      console.error('Failed to delete folder:', err);
    }
  };

  const handleToggleStar = async (pageId: string) => {
    await docsApi.toggleStar(pageId);
    loadSpace();
  };

  const openCreatePageDialog = (parentId?: string, folderId?: string) => {
    setCreateContext({ parentId, folderId });
    setShowCreatePageDialog(true);
  };

  const openCreateFolderDialog = (parentId?: string) => {
    setCreateContext({ folderId: parentId });
    setShowCreateFolderDialog(true);
  };

  const filteredPages = pages
    .filter((p) => !p.parentId && !p.folderId)
    .filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)]">
        <div className="w-64 border-r p-4 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-2/3" />
        </div>
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!space) return null;

  return (
    <div className="flex h-[calc(100vh-10rem)] -m-4 md:-m-6">
      {/* Sidebar - Page Tree */}
      <div className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center text-xl"
              style={{ backgroundColor: `${space.color}20` }}
            >
              {space.icon || '📁'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold truncate">{space.name}</h2>
              <p className="text-xs text-muted-foreground font-mono">{space.key}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/documents/spaces/${spaceKey}/settings`}>
                    <Settings className="h-4 w-4 mr-2" />
                    Space Settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="p-2 border-b space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => openCreatePageDialog()}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => openCreateFolderDialog()}
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <PageTree
            nodes={pageTree}
            spaceKey={spaceKey}
            onCreatePage={openCreatePageDialog}
            onCreateFolder={openCreateFolderDialog}
            onDelete={(id, type) => {
              if (type === 'page') handleDeletePage(id);
              else handleDeleteFolder(id);
            }}
          />
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/documents" className="hover:text-foreground">
                Documents
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{space.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pages..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">Last Updated</SelectItem>
                  <SelectItem value="created">Date Created</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          {/* Welcome/Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl font-bold mb-2">{space.name}</h1>
            {space.description && (
              <p className="text-muted-foreground">{space.description}</p>
            )}
          </motion.div>

          {/* Pages */}
          {filteredPages.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery ? 'No pages found' : 'No pages yet'}
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchQuery
                    ? 'Try adjusting your search'
                    : 'Create your first page to get started'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => openCreatePageDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Page
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPages.map((page, index) => (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/documents/spaces/${spaceKey}/pages/${page.id}`}>
                    <Card className="group hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 cursor-pointer h-full">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{page.icon || '📄'}</span>
                            <div>
                              <CardTitle className="text-base group-hover:text-violet-600 transition-colors">
                                {page.title}
                              </CardTitle>
                              {page.status === 'draft' && (
                                <Badge variant="outline" className="mt-1 text-xs">
                                  Draft
                                </Badge>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleToggleStar(page.id)}>
                                {page.isStarred ? (
                                  <>
                                    <StarOff className="h-4 w-4 mr-2" />
                                    Unstar
                                  </>
                                ) : (
                                  <>
                                    <Star className="h-4 w-4 mr-2" />
                                    Star
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Move className="h-4 w-4 mr-2" />
                                Move
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDeletePage(page.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(page.updatedAt).toLocaleDateString()}
                          {page.version > 1 && (
                            <>
                              <span>·</span>
                              <span>v{page.version}</span>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                {filteredPages.map((page) => (
                  <Link
                    key={page.id}
                    href={`/documents/spaces/${spaceKey}/pages/${page.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors border-b last:border-b-0"
                  >
                    <span className="text-xl">{page.icon || '📄'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{page.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {new Date(page.updatedAt).toLocaleDateString()}
                        {page.status === 'draft' && (
                          <>
                            <span>·</span>
                            <Badge variant="outline" className="text-xs">
                              Draft
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </ScrollArea>
      </div>

      {/* Create Page Dialog */}
      <Dialog open={showCreatePageDialog} onOpenChange={setShowCreatePageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
            <DialogDescription>
              Create a new page in {space.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {PAGE_ICONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setNewPage((prev) => ({ ...prev, icon }))}
                    className={`h-10 w-10 rounded-lg flex items-center justify-center text-lg border-2 transition-colors ${
                      newPage.icon === icon
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30'
                        : 'border-transparent hover:bg-muted'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                placeholder="Enter page title..."
                value={newPage.title}
                onChange={(e) => setNewPage((prev) => ({ ...prev, title: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePage()}
              />
            </div>

            {templates.length > 0 && (
              <div className="space-y-2">
                <Label>Template (optional)</Label>
                <Select
                  value={newPage.templateId}
                  onValueChange={(value) => setNewPage((prev) => ({ ...prev, templateId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Start from blank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Blank Page</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.icon} {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreatePageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePage} disabled={!newPage.title.trim()}>
              Create Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog open={showCreateFolderDialog} onOpenChange={setShowCreateFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Organize your pages into folders
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                placeholder="Enter folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateFolderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
