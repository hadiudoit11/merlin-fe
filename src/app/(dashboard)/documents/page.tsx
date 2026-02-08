'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Plus,
  Search,
  Clock,
  Star,
  Folder,
  FileText,
  ChevronRight,
  MoreVertical,
  Settings,
  Trash2,
  Archive,
  Users,
  Lock,
  Globe,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { docsApi } from '@/lib/docs-api';
import { Space, Page, RecentPage } from '@/types/document';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const SPACE_ICONS = ['📁', '⚙️', '🎯', '👥', '📊', '🚀', '💡', '📝', '🔧', '🎨', '📈', '🏠'];
const SPACE_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#84cc16'];

function SpaceCard({ space, onDelete }: { space: Space; onDelete: (id: string) => void }) {
  return (
    <motion.div variants={itemVariants}>
      <Link href={`/documents/spaces/${space.key.toLowerCase()}`}>
        <Card className="group hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 cursor-pointer h-full">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${space.color}20` }}
              >
                {space.icon || '📁'}
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
                  <DropdownMenuItem asChild>
                    <Link href={`/documents/spaces/${space.key.toLowerCase()}/settings`}>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(space.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg group-hover:text-violet-600 transition-colors">
                  {space.name}
                </CardTitle>
                <Badge variant="outline" className="text-xs font-mono">
                  {space.key}
                </Badge>
              </div>
              <CardDescription className="mt-1 line-clamp-2">
                {space.description || 'No description'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {space.isPersonal ? (
                <div className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Personal
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Team
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(space.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function RecentPageItem({ page }: { page: RecentPage }) {
  return (
    <Link
      href={`/documents/spaces/${page.spaceKey.toLowerCase()}/pages/${page.id}`}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-sm shrink-0">
        {page.icon || '📄'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate group-hover:text-violet-600 transition-colors">
          {page.title}
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span className="font-mono">{page.spaceKey}</span>
          <span>·</span>
          <span>{page.spaceName}</span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

function StarredPageItem({ page }: { page: Page & { spaceName?: string; spaceKey?: string } }) {
  return (
    <Link
      href={`/documents/spaces/${page.spaceId}/pages/${page.id}`}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-sm shrink-0">
        {page.icon || '⭐'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate group-hover:text-violet-600 transition-colors">
          {page.title}
        </div>
        <div className="text-xs text-muted-foreground">
          {page.spaceName || 'Unknown space'}
        </div>
      </div>
      <Star className="h-4 w-4 text-amber-500" />
    </Link>
  );
}

export default function DocumentsPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);
  const [starredPages, setStarredPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSpace, setNewSpace] = useState({
    name: '',
    key: '',
    description: '',
    icon: '📁',
    color: '#8b5cf6',
    isPersonal: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [spacesData, recentData, starredData] = await Promise.all([
        docsApi.listSpaces(),
        docsApi.getRecentPages(5),
        docsApi.getStarredPages(),
      ]);
      setSpaces(spacesData);
      setRecentPages(recentData);
      setStarredPages(starredData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSpace = async () => {
    if (!newSpace.name.trim() || !newSpace.key.trim()) return;

    try {
      const space = await docsApi.createSpace({
        name: newSpace.name,
        key: newSpace.key.toUpperCase(),
        description: newSpace.description,
        icon: newSpace.icon,
        color: newSpace.color,
        isPersonal: newSpace.isPersonal,
      });
      setSpaces((prev) => [...prev, space]);
      setShowCreateDialog(false);
      setNewSpace({
        name: '',
        key: '',
        description: '',
        icon: '📁',
        color: '#8b5cf6',
        isPersonal: false,
      });
    } catch (err) {
      console.error('Failed to create space:', err);
    }
  };

  const handleDeleteSpace = async (spaceId: string) => {
    if (!confirm('Are you sure you want to delete this space and all its pages?')) return;

    try {
      await docsApi.deleteSpace(spaceId);
      setSpaces((prev) => prev.filter((s) => s.id !== spaceId));
    } catch (err) {
      console.error('Failed to delete space:', err);
    }
  };

  const filteredSpaces = spaces.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-5 w-32 mt-3" />
                <Skeleton className="h-4 w-48 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground mt-1">
            Organize knowledge in spaces, folders, and pages
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Space
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Space</DialogTitle>
              <DialogDescription>
                A space is a container for organizing related pages and folders
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <div className="flex flex-wrap gap-2">
                    {SPACE_ICONS.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setNewSpace((prev) => ({ ...prev, icon }))}
                        className={`h-10 w-10 rounded-lg flex items-center justify-center text-lg border-2 transition-colors ${
                          newSpace.icon === icon
                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30'
                            : 'border-transparent hover:bg-muted'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {SPACE_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewSpace((prev) => ({ ...prev, color }))}
                      className={`h-8 w-8 rounded-full transition-all ${
                        newSpace.color === color ? 'ring-2 ring-offset-2 ring-violet-500' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="name">Space Name</Label>
                  <Input
                    id="name"
                    placeholder="Engineering"
                    value={newSpace.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const key = name
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, '')
                        .slice(0, 5);
                      setNewSpace((prev) => ({ ...prev, name, key: prev.key || key }));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key">Key</Label>
                  <Input
                    id="key"
                    placeholder="ENG"
                    maxLength={5}
                    className="font-mono uppercase"
                    value={newSpace.key}
                    onChange={(e) =>
                      setNewSpace((prev) => ({
                        ...prev,
                        key: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What is this space for?"
                  rows={2}
                  value={newSpace.description}
                  onChange={(e) => setNewSpace((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="personal"
                  checked={newSpace.isPersonal}
                  onChange={(e) => setNewSpace((prev) => ({ ...prev, isPersonal: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="personal" className="text-sm font-normal">
                  Personal space (only visible to you)
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateSpace}
                disabled={!newSpace.name.trim() || !newSpace.key.trim()}
              >
                Create Space
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search spaces..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Quick Access */}
      {(recentPages.length > 0 || starredPages.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Tabs defaultValue="recent" className="w-full">
            <TabsList>
              <TabsTrigger value="recent" className="gap-2">
                <Clock className="h-4 w-4" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="starred" className="gap-2">
                <Star className="h-4 w-4" />
                Starred
              </TabsTrigger>
            </TabsList>
            <TabsContent value="recent" className="mt-4">
              {recentPages.length > 0 ? (
                <Card>
                  <CardContent className="p-2">
                    {recentPages.map((page) => (
                      <RecentPageItem key={page.id} page={page} />
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <p className="text-muted-foreground text-sm">No recent pages</p>
              )}
            </TabsContent>
            <TabsContent value="starred" className="mt-4">
              {starredPages.length > 0 ? (
                <Card>
                  <CardContent className="p-2">
                    {starredPages.map((page) => (
                      <StarredPageItem key={page.id} page={page} />
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <p className="text-muted-foreground text-sm">No starred pages</p>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      )}

      {/* Spaces Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Folder className="h-5 w-5" />
          Spaces
          <Badge variant="secondary">{filteredSpaces.length}</Badge>
        </h2>

        {filteredSpaces.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Folder className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery ? 'No spaces found' : 'No spaces yet'}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'Create your first space to start organizing documents'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Space
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredSpaces.map((space) => (
              <SpaceCard key={space.id} space={space} onDelete={handleDeleteSpace} />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
