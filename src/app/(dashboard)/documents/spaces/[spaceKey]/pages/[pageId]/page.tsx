'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import LinkExtension from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CharacterCount from '@tiptap/extension-character-count';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Bold,
  Italic,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Highlighter,
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
  Save,
  Cloud,
  CloudOff,
  MoreVertical,
  Star,
  StarOff,
  Trash2,
  Clock,
  ChevronRight,
  FileText,
  Plus,
  Settings,
  History,
  Share2,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PageTree } from '@/components/docs/PageTree';
import { docsApi } from '@/lib/docs-api';
import { Space, Page, PageTreeNode, PageBreadcrumb } from '@/types/document';

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  tooltip: string;
}

function ToolbarButton({ onClick, isActive, disabled, children, tooltip }: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={onClick}
          disabled={disabled}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  if (!editor) return null;

  const handleSetLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setShowLinkDialog(false);
    setLinkUrl('');
  };

  const handleSetImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
    }
    setShowImageDialog(false);
    setImageUrl('');
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-0.5 p-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-wrap">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          tooltip="Undo"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          tooltip="Redo"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          tooltip="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          tooltip="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          tooltip="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          tooltip="Highlight"
        >
          <Highlighter className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          tooltip="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          tooltip="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          tooltip="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          tooltip="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          tooltip="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          tooltip="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          tooltip="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          tooltip="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive('taskList')}
          tooltip="Task List"
        >
          <CheckSquare className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          tooltip="Quote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton onClick={() => setShowLinkDialog(true)} isActive={editor.isActive('link')} tooltip="Add Link">
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => setShowImageDialog(true)} tooltip="Add Image">
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>

        <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Link</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSetLink()}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLinkDialog(false)}>Cancel</Button>
              <Button onClick={handleSetLink}>Add Link</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Image</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSetImage()}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImageDialog(false)}>Cancel</Button>
              <Button onClick={handleSetImage}>Add Image</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

interface PageEditorProps {
  params: Promise<{ spaceKey: string; pageId: string }>;
}

export default function PageEditor({ params }: PageEditorProps) {
  const { spaceKey, pageId } = use(params);
  const router = useRouter();

  const [space, setSpace] = useState<Space | null>(null);
  const [page, setPage] = useState<Page | null>(null);
  const [pageTree, setPageTree] = useState<PageTreeNode[]>([]);
  const [pageTitle, setPageTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      LinkExtension.configure({ openOnClick: false }),
      Image,
      CharacterCount.configure({ limit: 100000 }),
    ],
    content: '',
    onUpdate: () => {
      setHasUnsavedChanges(true);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[500px] px-8 py-6',
      },
    },
  });

  useEffect(() => {
    loadPage();
  }, [pageId, spaceKey]);

  useEffect(() => {
    if (editor && page) {
      try {
        const content = JSON.parse(page.content);
        editor.commands.setContent(content, false);
      } catch {
        editor.commands.setContent(page.content, false);
      }
      setHasUnsavedChanges(false);
    }
  }, [editor, page]);

  const loadPage = async () => {
    try {
      setIsLoading(true);
      const spaceData = await docsApi.getSpaceByKey(spaceKey);
      if (!spaceData) {
        router.push('/documents');
        return;
      }
      setSpace(spaceData);

      const [pageData, treeData, starred] = await Promise.all([
        docsApi.getPage(pageId),
        docsApi.getPageTree(spaceData.id),
        docsApi.isStarred(pageId),
      ]);

      if (!pageData) {
        router.push(`/documents/spaces/${spaceKey}`);
        return;
      }

      setPage(pageData);
      setPageTitle(pageData.title);
      setPageTree(treeData);
      setIsStarred(starred);

      // Add to recent
      docsApi.addToRecent(pageId);
    } catch (err) {
      console.error('Failed to load page:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const savePage = useCallback(async () => {
    if (!editor || !page) return;

    try {
      setIsSaving(true);
      const content = JSON.stringify(editor.getJSON());
      await docsApi.updatePage(page.id, {
        title: pageTitle,
        content,
      });
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Failed to save page:', err);
    } finally {
      setIsSaving(false);
    }
  }, [editor, page, pageTitle]);

  // Auto-save
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timeout = setTimeout(() => {
      savePage();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [hasUnsavedChanges, savePage]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        savePage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [savePage]);

  const handleToggleStar = async () => {
    const newStarred = await docsApi.toggleStar(pageId);
    setIsStarred(newStarred);
  };

  const handleDelete = async () => {
    if (!page) return;
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      await docsApi.deletePage(page.id);
      router.push(`/documents/spaces/${spaceKey}`);
    } catch (err) {
      console.error('Failed to delete page:', err);
    }
  };

  const handleCreateChildPage = () => {
    router.push(`/documents/spaces/${spaceKey}?createPage=true&parentId=${pageId}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] -m-4 md:-m-6">
        <div className="w-64 border-r p-4 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    );
  }

  if (!space || !page) return null;

  const wordCount = editor?.storage.characterCount.words() || 0;
  const charCount = editor?.storage.characterCount.characters() || 0;

  return (
    <div className="flex h-[calc(100vh-10rem)] -m-4 md:-m-6">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <Link
            href={`/documents/spaces/${spaceKey}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {space.name}
          </Link>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 border-b">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={handleCreateChildPage}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Child Page
            </Button>
          </div>
          <PageTree nodes={pageTree} spaceKey={spaceKey} />
        </ScrollArea>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-background">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {page.breadcrumbs?.map((crumb, index) => (
              <React.Fragment key={crumb.id}>
                {index > 0 && <ChevronRight className="h-3 w-3" />}
                <Link
                  href={
                    crumb.type === 'space'
                      ? `/documents/spaces/${spaceKey}`
                      : `/documents/spaces/${spaceKey}/pages/${crumb.id}`
                  }
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.title}
                </Link>
              </React.Fragment>
            ))}
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{page.title}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Save status */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
              {isSaving ? (
                <>
                  <Cloud className="h-4 w-4 animate-pulse" />
                  <span>Saving...</span>
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <CloudOff className="h-4 w-4" />
                  <span>Unsaved</span>
                </>
              ) : lastSaved ? (
                <>
                  <Cloud className="h-4 w-4 text-green-500" />
                  <span>Saved</span>
                </>
              ) : null}
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleToggleStar}>
                    {isStarred ? (
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isStarred ? 'Unstar' : 'Star'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button variant="outline" size="sm" onClick={savePage} disabled={isSaving || !hasUnsavedChanges}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <History className="h-4 w-4 mr-2" />
                  Version History
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Comments
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Page
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Title */}
        <div className="px-8 py-4 border-b">
          <div className="flex items-center gap-3 max-w-4xl mx-auto">
            <span className="text-3xl">{page.icon || '📄'}</span>
            <Input
              value={pageTitle}
              onChange={(e) => {
                setPageTitle(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 px-0 h-auto"
              placeholder="Untitled"
            />
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground max-w-4xl mx-auto mt-2 pl-12">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(page.updatedAt).toLocaleDateString()}
            </span>
            <span>v{page.version}</span>
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
            {page.status === 'draft' && <Badge variant="outline">Draft</Badge>}
          </div>
        </div>

        {/* Toolbar */}
        <EditorToolbar editor={editor} />

        {/* Editor Content */}
        <ScrollArea className="flex-1 bg-background">
          <div className="max-w-4xl mx-auto">
            <EditorContent editor={editor} />
          </div>
        </ScrollArea>

        {/* Child Pages */}
        {page.children && page.children.length > 0 && (
          <div className="border-t p-4 bg-muted/30">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Child Pages
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {page.children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/documents/spaces/${spaceKey}/pages/${child.id}`}
                    className="flex items-center gap-2 p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors"
                  >
                    <span>{child.icon || '📄'}</span>
                    <span className="text-sm font-medium truncate">{child.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
