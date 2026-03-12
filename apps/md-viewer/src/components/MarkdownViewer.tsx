import type { MarkdownViewerProps } from '@zephyr-challenge/shared';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { CodeBlock } from './CodeBlock';
import { FileText } from 'lucide-react';

export default function MarkdownViewer({ content, filename }: MarkdownViewerProps) {
  return (
    <article>
      <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{filename}</span>
      </div>
      <div className="prose">
        <Markdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            code({ className, children, ...props }) {
              const isInline = !className;
              if (isInline) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
              return (
                <CodeBlock className={className}>
                  {String(children).replace(/\n$/, '')}
                </CodeBlock>
              );
            },
            pre({ children }) {
              // CodeBlock handles its own <pre> wrapper
              return <>{children}</>;
            },
          }}
        >
          {content}
        </Markdown>
      </div>
    </article>
  );
}
