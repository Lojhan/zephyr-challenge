# Versions & Snapshots

Versioning is the backbone of Zephyr Cloud. Every build produces an immutable **snapshot** — a complete record of your application at that exact moment in time.

## What Is a Snapshot?

A snapshot is an immutable JSON record that captures everything about a deployment:

```json
{
  "snapshot_id": "abc123def456",
  "build_id": 42,
  "application_uid": "shell.zephyr-challenge.lojhan",
  "git": {
    "commit": "a1b2c3d",
    "branch": "main",
    "author": "lojhan"
  },
  "assets": {
    "index.html": "sha256:...",
    "main.js": "sha256:...",
    "styles.css": "sha256:...",
    "remoteEntry.js": "sha256:..."
  },
  "module_federation": {
    "name": "shell",
    "remotes": ["file_explorer", "md_viewer"],
    "shared": ["react", "react-dom"]
  },
  "env_vars": {
    "ZE_PUBLIC_API_URL": "https://api.example.com"
  },
  "created_at": "2024-01-15T10:30:00Z"
}
```

Once created, a snapshot **never changes**. This immutability is what enables instant rollbacks and perfect reproducibility.

## Version Identifiers

Every snapshot has multiple identifiers:

- **Snapshot ID**: SHA-256 content hash (globally unique)
- **Build Number**: Auto-incrementing per user (1, 2, 3, ...)
- **Permanent URL**: `https://{user}-{buildId}-{app}-{project}-{hash}.ze.zephyr-cloud.io`

Example permanent URL:
```
https://lojhan-42-shell-zephyr-challenge-abc123-ze.zephyr-cloud.io
```

This URL works forever. Even after 1000 more deployments, version 42 is always accessible at that exact URL.

## Version Lifecycle

Snapshots transition through defined states:

| State | Resolution | URL Access | Description |
|-------|-----------|------------|-------------|
| **Active** | ✅ Yes | ✅ Yes | Normal state, available for dependency resolution |
| **Deprecated** | ✅ Yes (warns) | ✅ Yes | Phased out, still works but warns consumers |
| **Unavailable** | ❌ No | ✅ Yes | Hidden from resolution, direct URL still works |
| **Problematic** | ⚠️ Warns | ✅ Yes | Flagged as having issues, consumers get warnings |
| **Deleted** | ❌ No | ❌ No | Permanently removed (cannot be undone) |

This lifecycle lets you manage versions with precision. Mark a version as deprecated to gradually phase it out. Mark it as problematic to flag known issues while keeping it accessible for debugging.

## Differential Uploads

Zephyr never uploads the same content twice:

```
Version 1: 50 files uploaded (initial deploy)
Version 2: 3 files uploaded (only changed files)
Version 3: 1 file uploaded (quick hotfix)
```

Because storage is content-addressed, the upload phase checks each file's hash against the storage plane. Files that already exist are skipped. A typical incremental deploy uploads only the files that actually changed.

## Instant Rollbacks

Rolling back to a previous version is a pointer update, not a redeployment:

1. Open the Zephyr dashboard
2. Select the version you want to roll back to
3. Click "Deploy" — the environment pointer updates atomically
4. Edge workers immediately serve the previous version

No rebuild. No re-upload. No downtime. The old version's files are already in storage.

## Semantic Versioning for Dependencies

When other applications depend on your snapshot (via Module Federation), they can reference it with semantic version ranges:

```json
{
  "zephyr:dependencies": {
    "header": "^1.0.0",
    "footer": "~2.3.0",
    "sidebar": "3.0.0"
  }
}
```

Zephyr resolves these ranges against available Active snapshots, giving consumers automatic updates within their specified range.
