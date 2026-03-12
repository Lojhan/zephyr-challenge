import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '../lib/utils';

interface CodeBlockProps {
  children: string;
  className?: string;
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const language = className?.replace('language-', '') || '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      {language && (
        <div className="absolute top-2 left-3 text-[10px] uppercase tracking-wider text-muted-foreground/60">
          {language}
        </div>
      )}
      <button
        onClick={handleCopy}
        className={cn(
          'absolute top-2 right-2 p-1.5 rounded-md transition-all',
          'opacity-0 group-hover:opacity-100',
          'bg-secondary/80 hover:bg-secondary text-foreground/70 hover:text-foreground',
        )}
        aria-label="Copy code"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-400" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
      <pre className={cn('!mt-0', language && 'pt-8')}>
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}
