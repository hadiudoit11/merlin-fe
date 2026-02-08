'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  FolderOpen,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  FolderPlus,
  FilePlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { PageTreeNode } from '@/types/document';

interface PageTreeProps {
  nodes: PageTreeNode[];
  spaceKey: string;
  onCreatePage?: (parentId?: string, folderId?: string) => void;
  onCreateFolder?: (parentId?: string) => void;
  onRename?: (id: string, type: 'page' | 'folder') => void;
  onDelete?: (id: string, type: 'page' | 'folder') => void;
}

interface TreeNodeProps {
  node: PageTreeNode;
  spaceKey: string;
  level: number;
  onCreatePage?: (parentId?: string, folderId?: string) => void;
  onCreateFolder?: (parentId?: string) => void;
  onRename?: (id: string, type: 'page' | 'folder') => void;
  onDelete?: (id: string, type: 'page' | 'folder') => void;
}

function TreeNode({
  node,
  spaceKey,
  level,
  onCreatePage,
  onCreateFolder,
  onRename,
  onDelete,
}: TreeNodeProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(level < 2);
  const [isHovered, setIsHovered] = useState(false);

  const isFolder = node.type === 'folder';
  const hasChildren = node.children && node.children.length > 0;
  const isActive = pathname?.includes(`/pages/${node.id}`);

  const href = isFolder
    ? `/documents/spaces/${spaceKey}?folder=${node.id}`
    : `/documents/spaces/${spaceKey}/pages/${node.id}`;

  const FolderIcon = isOpen ? FolderOpen : Folder;

  return (
    <div>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div
          className={cn(
            'group flex items-center gap-1 py-1 px-2 rounded-md transition-colors',
            isActive
              ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
              : 'hover:bg-muted/50'
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {(hasChildren || isFolder) && (
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0 hover:bg-transparent"
              >
                {isOpen ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            </CollapsibleTrigger>
          )}

          {!hasChildren && !isFolder && <div className="w-5" />}

          <Link
            href={href}
            className="flex items-center gap-2 flex-1 py-1 min-w-0"
          >
            {isFolder ? (
              <FolderIcon className="h-4 w-4 text-amber-500 shrink-0" />
            ) : (
              <span className="text-sm shrink-0">{node.icon || '📄'}</span>
            )}
            <span className="truncate text-sm">{node.title}</span>
          </Link>

          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {isFolder ? (
                      <>
                        <DropdownMenuItem
                          onClick={() => onCreatePage?.(undefined, node.id)}
                        >
                          <FilePlus className="h-4 w-4 mr-2" />
                          New Page
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onCreateFolder?.(node.id)}
                        >
                          <FolderPlus className="h-4 w-4 mr-2" />
                          New Subfolder
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => onCreatePage?.(node.id)}
                      >
                        <FilePlus className="h-4 w-4 mr-2" />
                        New Child Page
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onRename?.(node.id, node.type)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDelete?.(node.id, node.type)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {hasChildren && (
          <CollapsibleContent>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {node.children!.map((child) => (
                <TreeNode
                  key={child.id}
                  node={child}
                  spaceKey={spaceKey}
                  level={level + 1}
                  onCreatePage={onCreatePage}
                  onCreateFolder={onCreateFolder}
                  onRename={onRename}
                  onDelete={onDelete}
                />
              ))}
            </motion.div>
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}

export function PageTree({
  nodes,
  spaceKey,
  onCreatePage,
  onCreateFolder,
  onRename,
  onDelete,
}: PageTreeProps) {
  if (nodes.length === 0) {
    return (
      <div className="p-4 text-center">
        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-3">No pages yet</p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onCreatePage?.()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Page
        </Button>
      </div>
    );
  }

  return (
    <div className="py-2">
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          spaceKey={spaceKey}
          level={0}
          onCreatePage={onCreatePage}
          onCreateFolder={onCreateFolder}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
