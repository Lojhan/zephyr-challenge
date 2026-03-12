import { ChevronRight, File, Folder, FolderOpen } from "lucide-react";
import { cn } from "../lib/utils";

function humanizeName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\.[^/.]+$/, '')
    .replace(/^\w/, (c) => c.toUpperCase());
}

interface FileTreeItemProps {
  name: string;
  type: "file" | "folder";
  depth: number;
  isExpanded: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export function FileTreeItem({
  name,
  type,
  depth,
  isExpanded,
  isSelected,
  onClick,
}: FileTreeItemProps) {
  const isFolder = type === "folder";
  const paddingLeft = 8 + depth * 16;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 w-full py-[3px] pr-2 text-[13px] leading-[22px] cursor-pointer select-none",
        "hover:bg-accent/50 transition-colors",
        isSelected && "bg-primary/15 text-primary",
        !isSelected && "text-foreground/80",
      )}
      style={{ paddingLeft }}
    >
      {isFolder && (
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-150",
            isExpanded && "rotate-90",
          )}
        />
      )}
      {!isFolder && <span className="w-3.5 shrink-0" />}

      {isFolder ? (
        isExpanded ? (
          <FolderOpen className="h-4 w-4 shrink-0 text-blue-400" />
        ) : (
          <Folder className="h-4 w-4 shrink-0 text-blue-400" />
        )
      ) : (
        <File
          className={cn(
            'h-4 w-4 shrink-0',
            name.endsWith('.md') ? 'text-green-500' : 'text-muted-foreground',
          )}
        />
      )}

      <span className="truncate">{type === 'folder' ? humanizeName(name) : humanizeName(name)}</span>
    </button>
  );
}
