import { Search, X } from 'lucide-react';
import { Button } from './ui/button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative flex items-center">
      <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground/70" />
      <input
        type="text"
        placeholder="Search docs…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-72 rounded-md bg-card pl-8 pr-8 text-xs text-foreground border border-border/60 placeholder:text-muted-foreground/50 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 h-5 w-5 text-muted-foreground hover:text-foreground"
          onClick={() => onChange('')}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
