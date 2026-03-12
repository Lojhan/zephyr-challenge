import type { FileNode } from '@zephyr-challenge/shared';

// Lazy loaders — each .md is its own chunk, loaded on demand
const contentLoaders: Record<string, () => Promise<string>> = {
  'README.md': () => import('../../public/content/README.md').then(m => m.default),
  'architecture/README.md': () => import('../../public/content/architecture/README.md').then(m => m.default),
  'architecture/build-pipeline.md': () => import('../../public/content/architecture/build-pipeline.md').then(m => m.default),
  'architecture/content-addressed-storage.md': () => import('../../public/content/architecture/content-addressed-storage.md').then(m => m.default),
  'features/README.md': () => import('../../public/content/features/README.md').then(m => m.default),
  'features/versions-snapshots.md': () => import('../../public/content/features/versions-snapshots.md').then(m => m.default),
  'features/tags-environments.md': () => import('../../public/content/features/tags-environments.md').then(m => m.default),
  'features/environment-overrides.md': () => import('../../public/content/features/environment-overrides.md').then(m => m.default),
  'features/remote-dependencies.md': () => import('../../public/content/features/remote-dependencies.md').then(m => m.default),
  'features/ci-cd-integration.md': () => import('../../public/content/features/ci-cd-integration.md').then(m => m.default),
  'module-federation/README.md': () => import('../../public/content/module-federation/README.md').then(m => m.default),
  'module-federation/shared-dependencies.md': () => import('../../public/content/module-federation/shared-dependencies.md').then(m => m.default),
  'module-federation/import-maps.md': () => import('../../public/content/module-federation/import-maps.md').then(m => m.default),
  'deployment/README.md': () => import('../../public/content/deployment/README.md').then(m => m.default),
  'deployment/cloud-providers.md': () => import('../../public/content/deployment/cloud-providers.md').then(m => m.default),
  'deployment/error-handling.md': () => import('../../public/content/deployment/error-handling.md').then(m => m.default),
  'improvements/README.md': () => import('../../public/content/improvements/README.md').then(m => m.default),
  'improvements/performance-analysis.md': () => import('../../public/content/improvements/performance-analysis.md').then(m => m.default),
  'improvements/ecosystem-comparison.md': () => import('../../public/content/improvements/ecosystem-comparison.md').then(m => m.default),
};

// Cache resolved content to avoid re-fetching
const contentCache = new Map<string, string>();

const CONTENT_FILES = Object.keys(contentLoaders);

function buildFileTree(paths: string[]): FileNode[] {
  const nodeMap = new Map<string, FileNode>();

  for (const filePath of paths) {
    const parts = filePath.split('/');
    let currentPath = '';

    parts.forEach((part, index) => {
      currentPath = index === 0 ? part : `${currentPath}/${part}`;

      if (!nodeMap.has(currentPath)) {
        const isFile = index === parts.length - 1 && /\.(md|txt)$/.test(part);
        nodeMap.set(currentPath, {
          path: currentPath,
          type: isFile ? 'file' : 'folder',
          name: part,
          children: [],
        });
      }
    });
  }

  for (const [, node] of nodeMap) {
    if (node.type === 'folder') {
      node.children = Array.from(nodeMap.values()).filter((child) => {
        const childParts = child.path.split('/');
        const nodeParts = node.path.split('/');
        return (
          childParts.length === nodeParts.length + 1 &&
          child.path.startsWith(`${node.path}/`)
        );
      });
    }
  }

  return Array.from(nodeMap.values()).filter(
    (node) =>
      !Array.from(nodeMap.values()).some(
        (other) =>
          other.type === 'folder' && node.path.startsWith(`${other.path}/`),
      ),
  );
}

export const fileTree: FileNode[] = buildFileTree(CONTENT_FILES);

export async function getContent(filePath: string): Promise<string> {
  const cached = contentCache.get(filePath);
  if (cached) return cached;

  const loader = contentLoaders[filePath];
  if (!loader) return `# File Not Found\n\nCould not load \`${filePath}\`.`;

  const content = await loader();
  contentCache.set(filePath, content);
  return content;
}

export function humanizeName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\.[^/.]+$/, '')
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function searchFiles(query: string): { path: string; name: string }[] {
  if (!query.trim()) return [];
  const lower = query.toLowerCase();
  return CONTENT_FILES
    .filter((f) => f.toLowerCase().includes(lower) || humanizeName(f.split('/').pop() || '').toLowerCase().includes(lower))
    .map((f) => ({ path: f, name: humanizeName(f.split('/').pop() || '') }));
}
