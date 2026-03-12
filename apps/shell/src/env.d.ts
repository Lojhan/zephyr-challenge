declare module 'file_explorer/FileExplorer' {
  import type { FC } from 'react';
  import type { FileExplorerProps } from '@zephyr-challenge/shared';
  const FileExplorer: FC<FileExplorerProps>;
  export default FileExplorer;
}

declare module 'md_viewer/MarkdownViewer' {
  import type { FC } from 'react';
  import type { MarkdownViewerProps } from '@zephyr-challenge/shared';
  const MarkdownViewer: FC<MarkdownViewerProps>;
  export default MarkdownViewer;
}

declare module '*.md' {
  const content: string;
  export default content;
}
