import type { FileNode } from '@zephyr-challenge/shared';
import FileExplorer from './components/FileExplorer';

const sampleFiles: FileNode[] = [
  {
    name: 'docs',
    path: 'docs',
    type: 'folder',
    children: [
      { name: 'README.md', path: 'docs/README.md', type: 'file' },
      {
        name: 'getting-started',
        path: 'docs/getting-started',
        type: 'folder',
        children: [
          { name: 'introduction.md', path: 'docs/getting-started/introduction.md', type: 'file' },
        ],
      },
    ],
  },
];

export default function App() {
  return (
    <div className="h-screen bg-background text-foreground">
      <div className="p-2 border-b border-border text-xs text-muted-foreground">
        File Explorer — Standalone
      </div>
      <FileExplorer
        files={sampleFiles}
        selectedPath=""
        onSelect={(path) => console.log('Selected:', path)}
        searchQuery=""
      />
    </div>
  );
}
