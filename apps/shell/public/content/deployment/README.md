# Deployment & Edge Infrastructure

Zephyr Cloud's deployment model is built on the premise that every application should be globally distributed by default. Instead of deploying to a single origin server and adding a CDN layer, Zephyr deploys directly to the edge.

## The Edge-First Model

Traditional deployment:
```
Build → Upload to origin server → CDN caches at edge → User requests from nearest CDN
```

Zephyr deployment:
```
Build → Upload to edge KV store (globally replicated) → User requests from nearest edge worker
```

There is no origin server. The edge IS the server. Files are stored in globally distributed KV stores and served by edge workers at 200+ locations worldwide.

## What Gets Deployed

Every deployment consists of three pieces:

1. **Assets** (in `ze_files`) — Your actual build artifacts (JS, CSS, HTML, images), stored by content hash
2. **Snapshot** (in `ze_snapshots`) — Immutable manifest mapping file paths to content hashes
3. **Environment Config** (in `ze_envs`) — Pointer from environment name to active snapshot ID

Updating a deployment means:
- Upload any new files to `ze_files` (differential — only changed files)
- Create a new snapshot in `ze_snapshots`
- Update the environment pointer in `ze_envs` (atomic operation)

## Default Managed: Cloudflare

The default (and easiest) option. Zephyr provisions infrastructure on Cloudflare's network:

### What Zephyr Creates

| Resource | Name | Purpose |
|----------|------|---------|
| 3 KV Namespaces | `ze_snapshots`, `ze_files`, `ze_env` | Content-addressed storage |
| 1 Worker | `ze-worker-for-static-upload` | Request handling, asset serving |
| 2 Worker Routes | `ze.<domain>/*`, `*-ze.<domain>/*` | URL routing patterns |
| CNAME Record | Points to `ze.zephyrcloud.app` | DNS resolution |

### Cloudflare Advantages

- 200+ edge locations worldwide
- Sub-millisecond KV reads
- Zero cold starts (Workers are always warm)
- Automatic SSL/TLS
- Built-in DDoS protection

### Known Limitation

Cloudflare's KV eventual consistency means propagation can take 1 minute to 1 hour after a deploy. In practice, this usually resolves within seconds, but it's not guaranteed.

## Request Flow

When a user visits your Zephyr-deployed application:

```
1. DNS (GeoDNS) → nearest healthy edge location
2. Edge worker parses hostname and path
3. Environment lookup: ze_envs[env_id] → snapshot_id  (~1ms)
4. Snapshot lookup: ze_snapshots[snapshot_id] → manifest  (cached)
5. File lookup: ze_files[content_hash] → file bytes      (cached)
6. Response with immutable Cache-Control headers
```

Steps 3-4 are aggressively cached. Most requests only hit step 5 — a single KV read by content hash.

## Build Output

After a successful deployment, the Zephyr plugin outputs:

```
✓ Deployed to Zephyr Cloud
  App: shell.zephyr-challenge.lojhan
  Version: #42
  URL: https://lojhan-42-shell-zephyr-challenge-abc123.ze.zephyr-cloud.io
  Files: 12 uploaded (3 new, 9 cached)
  Time: 2.3s
```

The permanent URL is immediately accessible. The environment URL reflects the new version after the environment pointer update propagates.
