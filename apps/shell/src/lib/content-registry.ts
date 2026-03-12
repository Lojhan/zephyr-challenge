import type { FileNode, ContentItem } from '@zephyr-challenge/shared';

const content: Record<string, ContentItem> = {
  'docs/README.md': {
    path: 'docs/README.md',
    title: 'README',
    content: `# Zephyr Cloud Documentation

Welcome to the **Zephyr Cloud** documentation. This is a rich-text visualizer built as a Module Federation micro-frontend, demonstrating Zephyr Cloud deployment best practices.

## What is Zephyr Cloud?

Zephyr Cloud is a purpose-built, cloud-agnostic deployment platform for **Micro-Frontend architectures** using **Module Federation**. It enables:

- **Sub-second edge deployments** across 200+ global locations
- **Immutable versioning** with permanent URLs for every build
- **Dynamic dependency resolution** — no hardcoded remote URLs
- **Instant rollbacks** — one-click revert without rebuilding

## How This App Works

This visualizer is itself a Module Federation application:

| App | Role | Description |
|-----|------|-------------|
| **Shell** | Host | Orchestrates layout, search, and SSR |
| **File Explorer** | Remote | VS Code-style file/folder navigator |
| **MD Viewer** | Remote | Renders Markdown with syntax highlighting |

> Each micro-frontend is independently deployable via Zephyr Cloud.
`,
  },
  'docs/getting-started/introduction.md': {
    path: 'docs/getting-started/introduction.md',
    title: 'Introduction',
    content: `# Introduction to Zephyr Cloud

Zephyr Cloud is designed from the ground up for **Module Federation** workflows. Traditional deployment platforms treat your app as a monolith. Zephyr understands that your application is composed of independently built, versioned, and deployed micro-frontends.

## Core Philosophy

1. **Configuration lives in code** — Module Federation setup is part of your bundler config
2. **Builds are immutable snapshots** — Every build gets a permanent URL
3. **Deploy once, serve everywhere** — Global edge network with automatic replication
4. **Zero hardcoded URLs** — Dependencies resolved dynamically at build time

## Architecture Layers

\`\`\`
┌─────────────────────────────┐
│     Build Integration       │  ← Bundler plugins (Webpack, Vite, Rspack...)
├─────────────────────────────┤
│       Control Plane         │  ← API, Dashboard, Browser Extension
├─────────────────────────────┤
│        Data Plane           │  ← Edge workers (200+ locations)
├─────────────────────────────┤
│       Storage Plane         │  ← Content-addressed KV stores
└─────────────────────────────┘
\`\`\`

## Supported Bundlers

Zephyr supports **9 bundlers** out of the box:

- Webpack, Rspack, Rsbuild
- Vite, Rollup, Rolldown
- Parcel, Metro, Re.Pack
`,
  },
  'docs/getting-started/quick-start.md': {
    path: 'docs/getting-started/quick-start.md',
    title: 'Quick Start',
    content: `# Quick Start Guide

Get up and running with Zephyr Cloud in under 5 minutes.

## Step 1: Install the Plugin

Choose the plugin for your bundler:

\`\`\`bash
# Rsbuild
npm install zephyr-rsbuild-plugin

# Webpack
npm install zephyr-webpack-plugin

# Vite
npm install vite-plugin-zephyr

# Rspack
npm install zephyr-rspack-plugin
\`\`\`

## Step 2: Add to Your Config

Wrap your configuration with \`withZephyr()\`:

\`\`\`typescript
// rsbuild.config.ts
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { withZephyr } from 'zephyr-rsbuild-plugin';

export default defineConfig({
  plugins: [
    pluginReact(),
    withZephyr(),
  ],
});
\`\`\`

## Step 3: Build & Deploy

\`\`\`bash
# Build your app — Zephyr deploys automatically
npm run build
\`\`\`

That's it! Your app is now deployed to the global edge network.

## What Happens During Build?

1. Zephyr observes your build output (non-invasive)
2. Assets are hashed (SHA-256) for deduplication
3. Only changed assets are uploaded
4. An immutable version snapshot is created
5. Your app is live on the edge in sub-second time
`,
  },
  'docs/getting-started/configuration.md': {
    path: 'docs/getting-started/configuration.md',
    title: 'Configuration',
    content: `# Configuration Reference

## Plugin Options

All Zephyr plugins accept the same base options:

\`\`\`typescript
interface ZephyrPluginOptions {
  // Custom deployment hooks
  hooks?: {
    onDeployStart?: () => void;
    onDeployComplete?: (info: DeploymentInfo) => void;
  };
}
\`\`\`

## Environment Variables

### Authentication

| Variable | Description |
|----------|-------------|
| \`ZE_SECRET_TOKEN\` | Personal or server token for CI/CD |
| \`ZE_SERVER_TOKEN\` | Organization-level token (alias) |

### Configuration

| Variable | Description |
|----------|-------------|
| \`ZE_PUBLIC_*\` | Prefix for runtime-overridable env vars |
| \`ZE_ENV\` | Target environment (dev, staging, production) |

## Module Federation Setup

When using Module Federation, configure remotes with Zephyr's resolution:

\`\`\`typescript
pluginModuleFederation({
  name: 'my_host',
  remotes: {
    // Local development URL (Zephyr overrides in production)
    my_remote: 'my_remote@http://localhost:3001/mf-manifest.json',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
})
\`\`\`

## Application UID

Zephyr auto-generates your app identity from git:

\`\`\`
{org}.{project}.{app-name}
\`\`\`

- **org**: From git remote URL
- **project**: From repository name
- **app-name**: From \`package.json\` name
`,
  },
  'docs/architecture/module-federation.md': {
    path: 'docs/architecture/module-federation.md',
    title: 'Module Federation',
    content: `# Module Federation with Zephyr

Module Federation allows multiple independently built applications to share code at runtime. Zephyr Cloud supercharges this pattern with **dynamic dependency resolution**.

## The Problem with Traditional MF

In a standard Module Federation setup, remote URLs are hardcoded:

\`\`\`javascript
// ❌ Hardcoded — breaks across environments
remotes: {
  header: 'header@https://cdn.example.com/header/remoteEntry.js',
}
\`\`\`

## Zephyr's Dynamic Resolution

Zephyr resolves remotes at build time based on **build context**:

\`\`\`javascript
// ✅ Zephyr resolves the correct version automatically
remotes: {
  header: 'header@http://localhost:3001/mf-manifest.json',
}
// In production, Zephyr replaces this with the edge-deployed URL
\`\`\`

## Resolution Strategies

| Strategy | Syntax | Use Case |
|----------|--------|----------|
| Workspace | \`workspace:*\` | Auto-match by build context |
| Semver | \`^1.0.0\` | Version range matching |
| Label | \`@latest\` | Named version pointers |
| Direct URL | Full URL | Pin to exact version |

## Build Context

Zephyr uses context to resolve the right remote version:

- **Branch**: Match remotes built from the same branch
- **CI/Local**: Different resolution for CI vs. local builds
- **Username**: Developer-specific overrides
- **Environment**: Production, staging, development targets

## Cross-Repository Federation

Remotes can span repositories using full UIDs:

\`\`\`
header.ecommerce.acme-corp
\`\`\`
`,
  },
  'docs/architecture/micro-frontends.md': {
    path: 'docs/architecture/micro-frontends.md',
    title: 'Micro-Frontends',
    content: `# Micro-Frontend Patterns

Zephyr Cloud enables several micro-frontend composition patterns.

## Pattern 1: Shell + Remotes

The most common pattern. A shell (host) app loads remote micro-frontends:

\`\`\`
Shell (Host)
├── Header Remote
├── Sidebar Remote
├── Content Remote
└── Footer Remote
\`\`\`

Each remote is:
- **Independently built** — separate CI/CD pipelines
- **Independently deployed** — different release cadences
- **Independently versioned** — immutable snapshots per build

## Pattern 2: Shared Libraries

Common utilities exposed as federated modules:

\`\`\`typescript
// shared-utils remote
exposes: {
  './analytics': './src/analytics.ts',
  './auth': './src/auth.ts',
  './design-system': './src/design-system.ts',
}
\`\`\`

## Pattern 3: Vertical Slices

Each team owns a full vertical slice (UI + logic + data):

- **Team Checkout**: Owns cart, payment, confirmation pages
- **Team Catalog**: Owns product listing, search, categories
- **Team Account**: Owns profile, orders, settings

## Best Practices

1. **Share React as a singleton** — prevents duplicate React runtime
2. **Use environment-specific remotes** — dev vs. staging vs. production
3. **Implement loading fallbacks** — graceful degradation when remotes are unavailable
4. **Version your exposed APIs** — maintain backwards compatibility
5. **Monitor remote health** — use Zephyr dashboard for deployment status
`,
  },
  'docs/architecture/edge-deployment.md': {
    path: 'docs/architecture/edge-deployment.md',
    title: 'Edge Deployment',
    content: `# Edge Deployment Architecture

Zephyr deploys your micro-frontends to a **global edge network** spanning 200+ locations.

## How It Works

\`\`\`
Build Time                    Runtime
─────────                    ───────
Your App ──→ Zephyr Plugin  User Request ──→ Edge Worker (nearest)
           │                              │
           ├─ Hash assets (SHA-256)       ├─ Resolve version
           ├─ Diff against edge           ├─ Serve from KV store
           ├─ Upload only changed         ├─ Apply env overrides
           └─ Create snapshot             └─ Return response (<50ms)
\`\`\`

## Content-Addressed Storage

Every asset is stored by its SHA-256 hash:

- **Deduplication**: Same content = same hash = uploaded once
- **Integrity**: Hash verification ensures no corruption
- **Caching**: Immutable assets get aggressive cache headers

## Deployment Speed

| Step | Time |
|------|------|
| Asset hashing | ~100ms |
| Diff calculation | ~50ms |
| Delta upload | ~200ms (if changes exist) |
| Snapshot creation | ~100ms |
| Edge propagation | ~500ms |
| **Total** | **< 1 second** |

## Cloud Providers

Zephyr supports BYOC (Bring Your Own Cloud):

- **Cloudflare** — Workers + KV (managed default)
- **AWS** — Lambda@Edge + S3 + CloudFront
- **Fastly** — Edge compute
- **Akamai** — Edge platform
- **Kubernetes** — Custom enterprise deployments

## Instant Rollbacks

Since every version is immutable and already on the edge:

1. Click "Rollback" in the dashboard
2. Zephyr switches the version pointer
3. Previous version serves immediately
4. **No rebuild, no re-upload, no downtime**
`,
  },
  'docs/guides/deployment.md': {
    path: 'docs/guides/deployment.md',
    title: 'Deployment Guide',
    content: `# Deployment Guide

## Local Development

During local development, Zephyr plugins are transparent:

\`\`\`bash
# Start your dev server normally
pnpm dev
\`\`\`

Module Federation remotes use localhost URLs. The Zephyr plugin only activates during \`build\`.

## CI/CD Deployment

### GitHub Actions

\`\`\`yaml
name: Deploy to Zephyr
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install
      - run: pnpm build
        env:
          ZE_SECRET_TOKEN: \${{ secrets.ZE_SECRET_TOKEN }}
\`\`\`

### GitLab CI

\`\`\`yaml
deploy:
  stage: deploy
  script:
    - pnpm install
    - pnpm build
  variables:
    ZE_SECRET_TOKEN: $ZE_SECRET_TOKEN
\`\`\`

## Authentication

Generate tokens in the Zephyr dashboard:

1. Navigate to **Settings → API Tokens**
2. Create a **Personal Token** (individual) or **Server Token** (org-level)
3. Add as \`ZE_SECRET_TOKEN\` environment variable

## Version Management

Every build creates an immutable version:

\`\`\`
https://{username}-{buildId}-{app-name}-{project}-{hash}.zephyr-cloud.io
\`\`\`

Use the **Zephyr Dashboard** or **Browser Extension** to:

- View all versions
- Switch active version per environment
- Rollback to any previous version
- Compare versions side-by-side
`,
  },
  'docs/guides/environment-variables.md': {
    path: 'docs/guides/environment-variables.md',
    title: 'Environment Variables',
    content: `# Environment Variables

Zephyr supports runtime-overridable environment variables without rebuilding.

## ZE_PUBLIC_ Prefix

Prefix variables with \`ZE_PUBLIC_\` to make them overridable:

\`\`\`bash
# .env
ZE_PUBLIC_API_URL=https://api.example.com
ZE_PUBLIC_FEATURE_FLAG=true
ZE_PUBLIC_THEME=dark
\`\`\`

## How It Works

1. **Build time**: Variables are captured in \`zephyr-manifest.json\`
2. **Runtime**: Override values per-environment in the dashboard
3. **No rebuild needed**: Changes take effect immediately

## Usage in Code

### Vite

\`\`\`typescript
// Accessed via import.meta.env
const apiUrl = import.meta.env.ZE_PUBLIC_API_URL;
\`\`\`

### Webpack / Rspack

\`\`\`typescript
// Accessed via process.env
const apiUrl = process.env.ZE_PUBLIC_API_URL;
\`\`\`

## Per-Environment Overrides

In the Zephyr dashboard, set different values per environment:

| Variable | Development | Staging | Production |
|----------|------------|---------|------------|
| \`ZE_PUBLIC_API_URL\` | localhost:8080 | staging-api.co | api.prod.co |
| \`ZE_PUBLIC_FEATURE_FLAG\` | true | true | false |
| \`ZE_PUBLIC_LOG_LEVEL\` | debug | info | error |

## Remote Dependency Overrides

You can also override which version of a remote each environment uses:

\`\`\`json
{
  "environments": {
    "production": {
      "remotes": {
        "header": "@stable"
      }
    },
    "staging": {
      "remotes": {
        "header": "@latest"
      }
    }
  }
}
\`\`\`
`,
  },
  'docs/api/configuration.md': {
    path: 'docs/api/configuration.md',
    title: 'API Configuration',
    content: `# API & SDK Reference

## Zephyr Manifest

Every deployment includes a \`zephyr-manifest.json\`:

\`\`\`json
{
  "version": "1.0.0",
  "timestamp": "2024-03-12T10:00:00.000Z",
  "dependencies": {
    "header.ecommerce.acme": {
      "name": "header",
      "application_uid": "header.ecommerce.acme",
      "remote_entry_url": "https://edge.zephyr.io/header/remote.js",
      "library_type": "var"
    }
  },
  "zeVars": {
    "ZE_PUBLIC_API_URL": "https://api.example.com"
  }
}
\`\`\`

## Application UID Format

\`\`\`
{app-name}.{project}.{organization}
\`\`\`

### Examples

| UID | App | Project | Organization |
|-----|-----|---------|-------------|
| \`header.ecommerce.acme\` | header | ecommerce | acme |
| \`shell.docs.zephyr\` | shell | docs | zephyr |

## Upload Protocol

### Snapshot Upload
\`\`\`
POST /upload?type=snapshot&skip_assets=true
Content-Type: application/json
Authorization: Bearer <token>
\`\`\`

### Asset Upload
\`\`\`
POST /upload?type=file&hash=<sha256>&filename=<path>
Content-Type: application/octet-stream
Authorization: Bearer <token>
\`\`\`

## SDK Packages

| Bundler | Package |
|---------|---------|
| Rsbuild | \`zephyr-rsbuild-plugin\` |
| Webpack | \`zephyr-webpack-plugin\` |
| Vite | \`vite-plugin-zephyr\` |
| Rspack | \`zephyr-rspack-plugin\` |
| Rollup | \`rollup-plugin-zephyr\` |
| Rolldown | \`zephyr-rolldown-plugin\` |
| Parcel | \`parcel-reporter-zephyr\` |
| Metro | \`zephyr-metro-plugin\` |
| Re.Pack | \`zephyr-repack-plugin\` |

## CLI

\`\`\`bash
# Scaffold a new project
npx create-zephyr-apps@latest my-app

# Add Zephyr to an existing project
npx with-zephyr --install

# Deploy a pre-built directory
ze-cli deploy --directory=./dist
\`\`\`
`,
  },
};

export const fileTree: FileNode[] = [
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
          { name: 'quick-start.md', path: 'docs/getting-started/quick-start.md', type: 'file' },
          { name: 'configuration.md', path: 'docs/getting-started/configuration.md', type: 'file' },
        ],
      },
      {
        name: 'architecture',
        path: 'docs/architecture',
        type: 'folder',
        children: [
          { name: 'module-federation.md', path: 'docs/architecture/module-federation.md', type: 'file' },
          { name: 'micro-frontends.md', path: 'docs/architecture/micro-frontends.md', type: 'file' },
          { name: 'edge-deployment.md', path: 'docs/architecture/edge-deployment.md', type: 'file' },
        ],
      },
      {
        name: 'guides',
        path: 'docs/guides',
        type: 'folder',
        children: [
          { name: 'deployment.md', path: 'docs/guides/deployment.md', type: 'file' },
          { name: 'environment-variables.md', path: 'docs/guides/environment-variables.md', type: 'file' },
        ],
      },
      {
        name: 'api',
        path: 'docs/api',
        type: 'folder',
        children: [
          { name: 'configuration.md', path: 'docs/api/configuration.md', type: 'file' },
        ],
      },
    ],
  },
];

export function getContent(path: string): ContentItem | undefined {
  return content[path];
}

export function getAllContent(): ContentItem[] {
  return Object.values(content);
}

export function searchContent(query: string): ContentItem[] {
  if (!query.trim()) return [];
  const lower = query.toLowerCase();
  return Object.values(content).filter(
    (item) =>
      item.title.toLowerCase().includes(lower) ||
      item.content.toLowerCase().includes(lower),
  );
}
