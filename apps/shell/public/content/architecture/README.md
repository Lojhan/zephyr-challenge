# Architecture Overview

Zephyr Cloud's architecture is built around four distinct planes that work in concert to provide seamless build-to-edge deployment. Each plane is decoupled and independently scalable.

## The Four Planes

### Build Integration Plane

The entry point. Bundler plugins (Webpack, Rspack, Vite, Rollup, Rsbuild, Parcel, Rolldown) hook into the build lifecycle to:

- Authenticate with the Zephyr control plane
- Observe the dependency graph without interfering
- Extract asset manifests with content hashes after compilation
- Upload new or changed assets via differential upload
- Create an immutable snapshot record

The critical design choice here is **silent observation**: the plugin never modifies your bundler output. Your production bundle is identical whether Zephyr is attached or not.

### Control Plane

The brain. A centralized API that manages:

- **Authentication & Authorization** — Token-based auth with org/project/app scoping
- **Project Registry** — Tracks all applications, their relationships, and ownership
- **Deployment Orchestration** — Coordinates snapshot creation, replication, and environment routing
- **Dashboard** — Web UI for version management, rollbacks, and monitoring

### Data Plane

The delivery layer. Distributed edge workers running at 200+ locations (on Cloudflare's default managed network) handle:

- **Request Routing** — GeoDNS routes users to the nearest healthy edge location
- **Asset Serving** — Workers parse hostname/path, look up environment config, resolve snapshot manifests, and serve files
- **Dynamic Configuration** — Environment overrides and remote dependency resolution at the edge

### Storage Plane

The foundation. Globally distributed KV stores implement content-addressed storage:

- `ze_files` — Actual asset content, keyed by SHA-256 hash
- `ze_snapshots` — Immutable deployment manifests (10-100KB, aggressively cached)
- `ze_envs` — Environment configuration (~1KB, <1ms lookup)

Same file across 100 versions? Stored exactly once. This is fundamental to Zephyr's efficiency.

## Data Flow: Build → Edge

```
1. Plugin Init        → Auth + project validation
2. Build Observation   → Dependency graph analysis (no modification)
3. Post-Build Analysis → Asset manifest extraction, SHA-256 hashing
4. Asset Processing    → Classification (JS, CSS, static), differential upload
5. Snapshot Creation   → Immutable record with git context + build metadata
6. Edge Deployment     → KV upload, multi-region replication, atomic env update
```

Each step is designed to be idempotent. If a deploy fails mid-way, the previous version continues serving. The new version only becomes active after the atomic environment configuration update in step 6.
