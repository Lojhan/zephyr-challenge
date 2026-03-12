# Content-Addressed Storage

Content-addressed storage (CAS) is the foundational design decision that makes Zephyr Cloud's versioning, deduplication, and caching model possible. Every asset in the system is stored by its cryptographic hash, not by name or path.

## How It Works

When Zephyr processes a build artifact:

```
file: dist/main.abc123.js (450KB)
  → hash: SHA-256(file_content) = "a1b2c3d4e5f6..."
  → stored in ze_files KV as: key="a1b2c3d4e5f6..." value=<file_bytes>
```

The filename, path, and version number are irrelevant to storage. Only the content matters.

## Why This Matters

### Perfect Deduplication

Consider a React application with 50 versions deployed. Most versions share the same vendor bundle (`react`, `react-dom`, lodash, etc.) — maybe 2MB of libraries that rarely change.

In a traditional deployment platform, you'd store 50 copies of that vendor bundle (100MB total). With CAS, you store it **once** (2MB total), because every version references the same hash.

### Instant Cache Validation

When an edge worker serves a file, the URL contains the content hash. The browser caches it with an immutable `Cache-Control` header. If the content hasn't changed between versions, the browser already has it — zero network requests needed.

### Atomic Deployments

A deployment is just updating a pointer (the snapshot) to reference a set of content hashes. The actual files are already in storage before the snapshot is created. This means:

- No partial deployments (all files exist before activation)
- Instant rollbacks (just point to a previous snapshot)
- Zero downtime (old version serves until atomic switch)

## The Three KV Stores

Zephyr uses three distinct KV namespaces, each optimized for its access pattern:

### `ze_files` — Asset Storage

- **Key**: SHA-256 hash of file content
- **Value**: Raw file bytes
- **Pattern**: Write-once, read-many, never-update
- **Caching**: Aggressive (immutable content, infinite TTL)

### `ze_snapshots` — Deployment Manifests

- **Key**: Snapshot ID (build identifier)
- **Value**: JSON manifest (10-100KB) mapping paths to content hashes
- **Pattern**: Write-once, read-many, never-update
- **Caching**: Aggressive (immutable, but smaller window than files)

### `ze_envs` — Environment Configuration

- **Key**: Environment identifier (e.g., `production`, `staging`)
- **Value**: Small JSON (~1KB) pointing to current snapshot ID
- **Pattern**: Read-heavy, occasional writes (only on deploy)
- **Caching**: Short TTL (<1ms edge lookup, frequent invalidation)

## Request Resolution Path

When a user visits your Zephyr-deployed app:

```
1. Edge worker receives request for /app/main.js
2. Reads ze_envs → gets current snapshot_id for this environment
3. Reads ze_snapshots[snapshot_id] → gets manifest mapping paths → hashes
4. Looks up manifest["/app/main.js"] → gets hash "a1b2c3d4e5f6..."
5. Reads ze_files["a1b2c3d4e5f6..."] → returns file content
6. Serves with immutable Cache-Control headers
```

Steps 2-3 are cached aggressively at the edge, so most requests only hit step 5 — a simple KV lookup by hash.

## Implications for Module Federation

For Module Federation remotes, CAS enables a powerful pattern:

- Host app resolves remote URL → gets snapshot → gets `remoteEntry.js` hash
- `remoteEntry.js` content hasn't changed between remote versions? Same hash, same cached file
- Only truly changed chunks need to be fetched

This means updating a remote module that only changed one component results in the browser fetching just that one new chunk — everything else is already cached.
