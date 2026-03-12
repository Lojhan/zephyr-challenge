import type { FileExplorerProps } from '@zephyr-challenge/shared';
import { FileTree } from './FileTree';

export default function FileExplorer({
  files,
  selectedPath,
  onSelect,
  searchQuery,
}: FileExplorerProps) {
  return (
    <nav className="py-1" role="tree" aria-label="File explorer">
      <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Explorer
      </div>
      {files.map((node) => (
        <FileTree
          key={node.path}
          node={node}
          selectedPath={selectedPath}
          onSelect={onSelect}
          searchQuery={searchQuery}
          depth={0}
        />
      ))}
    </nav>
  );
}
