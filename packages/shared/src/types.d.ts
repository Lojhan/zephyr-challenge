export interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'folder';
    children?: FileNode[];
}
export interface ContentItem {
    path: string;
    title: string;
    content: string;
}
export interface FileExplorerProps {
    files: FileNode[];
    selectedPath: string;
    onSelect: (path: string) => void;
    searchQuery: string;
}
export interface MarkdownViewerProps {
    content: string;
    filename: string;
}
//# sourceMappingURL=types.d.ts.map