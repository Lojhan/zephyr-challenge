import { FileText, Zap } from 'lucide-react';
import { SearchBar } from './SearchBar';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header className="flex items-center justify-between h-12 px-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sm">Zephyr Docs Viewer</span>
        <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-secondary">
          MF
        </span>
      </div>
      <SearchBar value={searchQuery} onChange={onSearchChange} />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <FileText className="h-3.5 w-3.5" />
        <span>Module Federation</span>
      </div>
    </header>
  );
}
