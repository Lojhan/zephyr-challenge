import { useCallback, useMemo, useState } from 'react';
import type { FileExplorerProps, MarkdownViewerProps } from '@zephyr-challenge/shared';
import { Header } from './components/Header';
import { RemoteLoader } from './components/RemoteLoader';
import { SidebarFallback } from './components/SidebarFallback';
import { ContentFallback } from './components/ContentFallback';
import { ScrollArea } from './components/ui/scroll-area';
import { fileTree, getContent, searchContent } from './lib/content-registry';

const loadFileExplorer = () => import('file_explorer/FileExplorer');
const loadMarkdownViewer = () => import('md_viewer/MarkdownViewer');

export default function App() {
  const [selectedPath, setSelectedPath] = useState('docs/README.md');
  const [searchQuery, setSearchQuery] = useState('');

  const currentContent = useMemo(() => getContent(selectedPath), [selectedPath]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchContent(searchQuery);
  }, [searchQuery]);

  const handleFileSelect = useCallback((path: string) => {
    setSelectedPath(path);
    setSearchQuery('');
  }, []);

  const explorerProps: FileExplorerProps = {
    files: fileTree,
    selectedPath,
    onSelect: handleFileSelect,
    searchQuery,
  };

  const viewerProps: MarkdownViewerProps = {
    content: currentContent?.content || '# File Not Found\n\nSelect a file from the sidebar.',
    filename: currentContent?.title || 'Untitled',
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — File Explorer Remote */}
        <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0">
          {searchQuery && searchResults.length > 0 && (
            <div className="border-b border-border px-3 py-2">
              <p className="text-xs text-muted-foreground mb-1.5">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </p>
              <div className="space-y-0.5">
                {searchResults.map((item) => (
                  <button
                    type="button"
                    key={item.path}
                    onClick={() => handleFileSelect(item.path)}
                    className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-accent text-foreground truncate block"
                  >
                    {item.title}
                    <span className="text-muted-foreground ml-1">
                      — {item.path}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <ScrollArea className="flex-1">
            <RemoteLoader<FileExplorerProps>
              loader={loadFileExplorer}
              fallback={<SidebarFallback />}
              props={explorerProps}
            />
          </ScrollArea>
        </aside>

        {/* Main Content — MD Viewer Remote */}
        <main className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="max-w-4xl mx-auto py-8 px-8">
              <RemoteLoader<MarkdownViewerProps>
                loader={loadMarkdownViewer}
                fallback={<ContentFallback />}
                props={viewerProps}
              />
            </div>
          </ScrollArea>
        </main>
      </div>

      {/* Status bar */}
      <footer className="flex items-center justify-between h-6 px-3 border-t border-border bg-card text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
            file-explorer
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
            md-viewer
          </span>
        </div>
        <span>Zephyr Cloud — Module Federation</span>
      </footer>
    </div>
  );
}
