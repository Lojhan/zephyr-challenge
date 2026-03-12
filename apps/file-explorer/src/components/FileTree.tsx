import { useState, useMemo } from 'react';
import type { FileNode } from '@zephyr-challenge/shared';
import { FileTreeItem } from './FileTreeItem';

interface FileTreeProps {
  node: FileNode;
  selectedPath: string;
  onSelect: (path: string) => void;
  searchQuery: string;
  depth: number;
}

function nodeMatchesSearch(node: FileNode, query: string): boolean {
  if (!query) return true;
  const lower = query.toLowerCase();
  if (node.name.toLowerCase().includes(lower)) return true;
  if (node.children) {
    return node.children.some((child) => nodeMatchesSearch(child, lower));
  }
  return false;
}

export function FileTree({
  node,
  selectedPath,
  onSelect,
  searchQuery,
  depth,
}: FileTreeProps) {
  const [expanded, setExpanded] = useState(depth < 2);

  const isVisible = useMemo(
    () => nodeMatchesSearch(node, searchQuery),
    [node, searchQuery],
  );

  // Auto-expand when searching
  const isExpanded = searchQuery ? true : expanded;

  if (!isVisible) return null;

  const isFolder = node.type === 'folder';
  const isSelected = node.path === selectedPath;

  const handleClick = () => {
    if (isFolder) {
      setExpanded((prev) => !prev);
    } else {
      onSelect(node.path);
    }
  };

  return (
    <div role="treeitem" aria-expanded={isFolder ? isExpanded : undefined}>
      <FileTreeItem
        name={node.name}
        type={node.type}
        depth={depth}
        isExpanded={isExpanded}
        isSelected={isSelected}
        onClick={handleClick}
      />
      {isFolder && isExpanded && node.children && (
        <div role="group">
          {node.children.map((child) => (
            <FileTree
              key={child.path}
              node={child}
              selectedPath={selectedPath}
              onSelect={onSelect}
              searchQuery={searchQuery}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
