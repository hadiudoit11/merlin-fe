'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  LayoutGrid,
  Trash2,
  MoreVertical,
  Sparkles,
  Clock,
  Users,
  FolderOpen,
  Search,
  Grid3X3,
  List,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockCanvasApi } from '@/lib/canvas-mock';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { api, isMockMode } from '@/lib/api';
import { Canvas } from '@/types/canvas';
import { formatDistanceToNow } from 'date-fns';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function CanvasSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
    </Card>
  );
}

export default function CanvasListPage() {
  const router = useRouter();
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCanvasName, setNewCanvasName] = useState('');
  const [newCanvasDescription, setNewCanvasDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadCanvases();
  }, []);

  const loadCanvases = async () => {
    try {
      setIsLoading(true);
      const data = await api.listCanvases();
      setCanvases(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load canvases');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCanvas = async () => {
    if (!newCanvasName.trim()) return;

    try {
      setIsCreating(true);
      const newCanvas = await api.createCanvas({
        name: newCanvasName,
        description: newCanvasDescription || undefined,
      });
      setCanvases((prev) => [...prev, newCanvas]);
      setIsCreateDialogOpen(false);
      setNewCanvasName('');
      setNewCanvasDescription('');
      router.push(`/canvas/${newCanvas.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create canvas');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCanvas = async (canvasId: number) => {
    if (!confirm('Are you sure you want to delete this canvas?')) return;

    try {
      await api.deleteCanvas(canvasId);
      setCanvases((prev) => prev.filter((c) => c.id !== canvasId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete canvas');
    }
  };

  const handleOpenCanvas = (canvasId: number) => {
    router.push(`/canvas/${canvasId}`);
  };

  const filteredCanvases = canvases.filter(
    (canvas) =>
      canvas.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      canvas.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 mb-8"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Your Canvases</h1>
              <p className="text-white/70">
                Infinite workspaces for product management and OKR tracking
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isMockMode && (
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  Mock Mode
                </Badge>
              )}

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-white text-violet-700 hover:bg-white/90 shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    New Canvas
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Canvas</DialogTitle>
                    <DialogDescription>
                      Create a new workspace to organize your product management
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Canvas Name</Label>
                      <Input
                        id="name"
                        placeholder="Q1 Product Strategy"
                        value={newCanvasName}
                        onChange={(e) => setNewCanvasName(e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (optional)</Label>
                      <Input
                        id="description"
                        placeholder="Planning for Q1 OKRs and initiatives"
                        value={newCanvasDescription}
                        onChange={(e) => setNewCanvasDescription(e.target.value)}
                        className="h-11"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateCanvas}
                      disabled={isCreating || !newCanvasName.trim()}
                      className="bg-gradient-to-r from-violet-600 to-purple-600"
                    >
                      {isCreating ? 'Creating...' : 'Create Canvas'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 max-w-md">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold text-white">{canvases.length}</div>
              <div className="text-sm text-white/70">Total Canvases</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold text-white">
                {canvases.filter((c) => {
                  const updated = new Date(c.updated_at);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return updated > weekAgo;
                }).length}
              </div>
              <div className="text-sm text-white/70">Active This Week</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-sm text-white/70">Shared</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-4 mb-6"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search canvases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6 border border-destructive/20"
        >
          {error}
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CanvasSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredCanvases.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mb-4">
                <FolderOpen className="h-8 w-8 text-violet-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? 'No matching canvases' : 'No canvases yet'}
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Create your first canvas to start organizing your product management'}
              </p>
              <div className="flex gap-3">
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Canvas
                </Button>
                {isMockMode && !searchQuery && (
                  <Button
                    variant="outline"
                    onClick={async () => {
                      await mockCanvasApi.seedDemoData();
                      loadCanvases();
                    }}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Load Demo Data
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Canvas Grid */}
      {!isLoading && filteredCanvases.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'flex flex-col gap-3'
          }
        >
          <AnimatePresence>
            {filteredCanvases.map((canvas) => (
              <motion.div
                key={canvas.id}
                variants={itemVariants}
                layout
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card
                  className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10 hover:border-violet-200 ${
                    viewMode === 'list' ? 'flex flex-row items-center' : ''
                  }`}
                  onClick={() => handleOpenCanvas(canvas.id)}
                >
                  <CardHeader
                    className={`${viewMode === 'list' ? 'flex-1 flex flex-row items-center gap-4 py-4' : ''}`}
                  >
                    {viewMode === 'grid' && (
                      <div className="flex items-start justify-between">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center group-hover:from-violet-200 group-hover:to-purple-200 transition-colors">
                          <LayoutGrid className="h-5 w-5 text-violet-600" />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCanvas(canvas.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}

                    {viewMode === 'list' && (
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center shrink-0">
                        <LayoutGrid className="h-5 w-5 text-violet-600" />
                      </div>
                    )}

                    <div className={viewMode === 'grid' ? 'mt-4' : 'flex-1 min-w-0'}>
                      <CardTitle className="text-lg line-clamp-1">{canvas.name}</CardTitle>
                      {canvas.description && (
                        <CardDescription className="line-clamp-2 mt-1">
                          {canvas.description}
                        </CardDescription>
                      )}
                    </div>

                    {viewMode === 'list' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCanvas(canvas.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </CardHeader>

                  {viewMode === 'grid' && (
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(canvas.updated_at), { addSuffix: true })}
                        </div>
                        {canvas.organization_id && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Shared
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}

                  {viewMode === 'list' && (
                    <div className="px-6 py-4 text-xs text-muted-foreground shrink-0">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(canvas.updated_at), { addSuffix: true })}
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
