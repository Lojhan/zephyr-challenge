import MarkdownViewer from './components/MarkdownViewer';

const sampleContent = `# Sample Markdown

This is the **MD Viewer** remote running standalone.

## Features

- GitHub Flavored Markdown
- Syntax highlighting
- Tables, lists, blockquotes

\`\`\`typescript
const greeting = "Hello from MD Viewer!";
console.log(greeting);
\`\`\`

> This component is exposed via Module Federation and consumed by the shell host.
`;

export default function App() {
  return (
    <div className="h-screen bg-background text-foreground p-8">
      <div className="text-xs text-muted-foreground mb-4 pb-2 border-b border-border">
        MD Viewer — Standalone
      </div>
      <MarkdownViewer content={sampleContent} filename="sample.md" />
    </div>
  );
}
