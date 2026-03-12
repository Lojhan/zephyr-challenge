# Zephyr Challenge — Rich Text Visualizer

A **Micro-Frontend** rich text (Markdown) visualizer built with [Zephyr Cloud](https://zephyr-cloud.io) best practices, **Module Federation**, **Rsbuild**, **React 19**, and **Shadcn UI**.

## Architecture

This project demonstrates a production-grade Module Federation setup with three independent applications:

| App | Role | Port | Description |
|-----|------|------|-------------|
| **shell** | Host | 3000 | Main layout, search, SSR server, orchestrates remotes |
| **file-explorer** | Remote | 3001 | VS Code-style file/folder tree navigator |
| **md-viewer** | Remote | 3002 | Rich Markdown renderer with syntax highlighting |

```
┌─────────────────────────────────────────────────────────┐
│  Zephyr Docs Viewer              🔍 Search...           │
├──────────────────┬──────────────────────────────────────┤
│ 📁 docs          │  # Introduction                      │
│  ├─ 📄 README    │                                      │
│  ├─ 📁 getting-  │  Welcome to the documentation...     │
│  │   started     │                                      │
│  │  ├─ intro.md  │  ## Getting Started                  │
│  │  └─ config.md │                                      │
│  ├─ 📁 arch      │  ```bash                             │
│  │  └─ mf.md     │  npx create-zephyr-apps@latest       │
│  └─ 📁 guides    │  ```                                 │
│     └─ deploy.md │                                      │
├──────────────────┴──────────────────────────────────────┤
│ [file-explorer]         [md-viewer]         Zephyr Cloud│
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

- **React 19** + **TypeScript 5.7**
- **Rsbuild** — Rspack-based build tool
- **Module Federation** — `@module-federation/rsbuild-plugin`
- **Zephyr Cloud** — `zephyr-rsbuild-plugin` for edge deployment
- **Tailwind CSS 3** + **Shadcn UI** components
- **react-markdown** + **remark-gfm** + **rehype-highlight** for Markdown
- **Express** + **react-dom/server** for SSR
- **lucide-react** for icons

## Getting Started

```bash
# Install dependencies
pnpm install

# Start all apps in development mode
pnpm dev

# Or start individually
pnpm dev:explorer   # file-explorer on :3001
pnpm dev:viewer     # md-viewer on :3002
pnpm dev:shell      # shell (host) on :3000
```

## SSR Mode

```bash
# Build all apps
pnpm build

# Run SSR server
pnpm serve:ssr
```

## Zephyr Cloud Deployment

Each app is configured with `zephyr-rsbuild-plugin`. On build, Zephyr:

1. Observes the build output (non-invasive)
2. Creates an immutable version snapshot
3. Uploads only changed assets (SHA-256 deduplication)
4. Deploys to the global edge network

The Module Federation remotes use local URLs for development. In production, Zephyr's dynamic dependency resolution replaces them with edge-deployed URLs — no hardcoded remote URLs needed.

## Project Structure

```
zephyr-challenge/
├── apps/
│   ├── shell/              # Host — layout, search, SSR
│   ├── file-explorer/      # Remote — file tree navigator
│   └── md-viewer/          # Remote — Markdown renderer
└── packages/
    └── shared/             # Shared TypeScript types
```
