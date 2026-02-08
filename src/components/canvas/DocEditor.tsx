'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Underline from '@tiptap/extension-underline';
import CharacterCount from '@tiptap/extension-character-count';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  CheckSquare,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Highlighter,
  Code,
  Undo,
  Redo,
  X,
  Minus,
  Plus,
  MoreHorizontal,
  Bot,
  Sparkles,
} from 'lucide-react';
import { DocAgentPanel } from './DocAgentPanel';
import { cn } from '@/lib/utils';
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

interface DocEditorProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onClose: () => void;
}

function MenuButton({
  onClick,
  active,
  disabled,
  children,
  tooltip,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  tooltip: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8',
            active && 'bg-accent text-accent-foreground'
          )}
          onClick={onClick}
          disabled={disabled}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const addLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex items-center gap-0.5 flex-wrap px-4 py-2 border-b bg-background sticky top-0 z-10">
        {/* Undo/Redo */}
        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          tooltip="Undo (Cmd+Z)"
        >
          <Undo className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          tooltip="Redo (Cmd+Shift+Z)"
        >
          <Redo className="h-4 w-4" />
        </MenuButton>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Text Style Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-3 gap-1">
              {editor.isActive('heading', { level: 1 }) ? 'Heading 1' :
               editor.isActive('heading', { level: 2 }) ? 'Heading 2' :
               editor.isActive('heading', { level: 3 }) ? 'Heading 3' :
               'Normal'}
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
              Normal text
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
              <Heading1 className="h-4 w-4 mr-2" /> Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
              <Heading2 className="h-4 w-4 mr-2" /> Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
              <Heading3 className="h-4 w-4 mr-2" /> Heading 3
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Text formatting */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          tooltip="Bold (Cmd+B)"
        >
          <Bold className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          tooltip="Italic (Cmd+I)"
        >
          <Italic className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          tooltip="Underline (Cmd+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          tooltip="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          tooltip="Inline code"
        >
          <Code className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive('highlight')}
          tooltip="Highlight"
        >
          <Highlighter className="h-4 w-4" />
        </MenuButton>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Alignment */}
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          tooltip="Align left"
        >
          <AlignLeft className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          tooltip="Align center"
        >
          <AlignCenter className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          tooltip="Align right"
        >
          <AlignRight className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          active={editor.isActive({ textAlign: 'justify' })}
          tooltip="Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </MenuButton>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Lists */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          tooltip="Bullet list"
        >
          <List className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          tooltip="Numbered list"
        >
          <ListOrdered className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          active={editor.isActive('taskList')}
          tooltip="Checklist"
        >
          <CheckSquare className="h-4 w-4" />
        </MenuButton>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Insert */}
        <MenuButton onClick={addLink} active={editor.isActive('link')} tooltip="Insert link">
          <LinkIcon className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={addImage} tooltip="Insert image">
          <ImageIcon className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={addTable} tooltip="Insert table">
          <TableIcon className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          tooltip="Quote"
        >
          <Quote className="h-4 w-4" />
        </MenuButton>
      </div>
    </TooltipProvider>
  );
}

export function DocEditor({
  title,
  content,
  onTitleChange,
  onContentChange,
  onClose,
}: DocEditorProps) {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [localTitle, setLocalTitle] = useState(title);
  const [isAgentPanelOpen, setIsAgentPanelOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your document...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer hover:text-primary/80',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-muted-foreground/20 p-2',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-muted-foreground/20 p-2 bg-muted font-semibold',
        },
      }),
      Underline,
      CharacterCount,
    ],
    content: content || '<p></p>',
    onUpdate: ({ editor }) => {
      // Debounce content updates
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onContentChange(editor.getHTML());
      }, 300);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] px-4 py-6',
      },
    },
  });

  // Handle title changes
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalTitle(e.target.value);
    },
    []
  );

  const handleTitleBlur = useCallback(() => {
    if (localTitle !== title) {
      onTitleChange(localTitle);
    }
  }, [localTitle, title, onTitleChange]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const characterCount = editor?.storage.characterCount.characters() || 0;
  const wordCount = editor?.storage.characterCount.words() || 0;

  // Handle applying agent suggestions
  const handleApplySuggestion = useCallback((suggestion: { suggestedText: string; type: string }) => {
    if (!editor) return;

    if (suggestion.type === 'addition') {
      // Add content at the end
      editor.chain().focus().insertContentAt(editor.state.doc.content.size - 1, suggestion.suggestedText).run();
    } else if (suggestion.type === 'rewrite') {
      // For rewrite, we'd need more context about what to replace
      // For now, append as a suggestion
      editor.chain().focus().insertContentAt(editor.state.doc.content.size - 1, `\n\n${suggestion.suggestedText}`).run();
    }
  }, [editor]);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b bg-background">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          <Input
            value={localTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            placeholder="Untitled Document"
            className="text-xl font-semibold border-none shadow-none focus-visible:ring-0 max-w-md"
          />
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {wordCount} words &middot; {characterCount} characters
          </span>
          <Button
            variant={isAgentPanelOpen ? "default" : "outline"}
            size="sm"
            onClick={() => setIsAgentPanelOpen(!isAgentPanelOpen)}
            className="gap-2"
          >
            <Bot className="h-4 w-4" />
            <Sparkles className="h-3 w-3" />
            AI Assistant
          </Button>
          <Button onClick={onClose}>
            Done
          </Button>
        </div>
      </header>

      {/* Toolbar */}
      <EditorToolbar editor={editor} />

      {/* Main content area - adjusts when agent panel is open */}
      <div className={cn(
        "flex-1 overflow-auto transition-all duration-300",
        isAgentPanelOpen && "mr-[400px]"
      )}>
        <div className="max-w-4xl mx-auto">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Status bar */}
      <footer className={cn(
        "px-4 py-2 border-t text-xs text-muted-foreground flex items-center justify-between transition-all duration-300",
        isAgentPanelOpen && "mr-[400px]"
      )}>
        <span>Press Escape to close</span>
        <span>Auto-saved</span>
      </footer>

      {/* Agent Panel */}
      <DocAgentPanel
        isOpen={isAgentPanelOpen}
        onClose={() => setIsAgentPanelOpen(false)}
        documentContent={editor?.getHTML() || content}
        documentTitle={localTitle}
        onApplySuggestion={handleApplySuggestion}
      />
    </div>
  );
}
