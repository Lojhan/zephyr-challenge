# Performance Analysis

A technical analysis of Zephyr Cloud's performance characteristics — where it excels, where it adds overhead, and where improvements would have the most impact.

## Edge Serving Performance

### What's Fast

The edge serving model is genuinely fast:

- **KV reads**: Sub-millisecond at the edge (Cloudflare Workers KV)
- **DNS resolution**: GeoDNS routes to the nearest location in ~1-5ms
- **Cache hits**: Immutable assets served directly from edge cache — zero KV lookups needed
- **Import map generation**: Small JSON document generated at the edge in <1ms

For a cached app with warm edge caches, total serving time is comparable to a static CDN.

### Where Overhead Exists

Zephyr adds three lookups that a static CDN doesn't need:

```
Static CDN:        DNS → CDN cache → Response
Zephyr (uncached): DNS → Edge worker → ze_envs → ze_snapshots → ze_files → Response
Zephyr (cached):   DNS → Edge worker → Response (from cache)
```

On first request to a new version (cold path), there are three sequential KV reads. Each is fast individually (~1ms), but they add up to ~3-5ms extra compared to a static CDN.

In practice, this is negligible — and the caching layer means subsequent requests don't pay this cost.

### The Propagation Problem

After deploying a new version, Cloudflare KV propagation is the real performance concern. During the propagation window:

- Some edge locations serve the old version
- Others serve the new version
- There's no way to force synchronization

For most applications this is acceptable. For applications requiring absolute consistency (financial transactions, coordinated micro-frontends), this is a real limitation.

**Possible solutions:**
- Read-after-write consistency option (at the cost of latency)
- Deployment confirmation webhook when propagation completes
- Shadow deployment mode that validates before activating

## Build Performance

### Plugin Overhead

The Zephyr plugin adds time to your build:

1. **Authentication**: ~100-500ms (cached after first build)
2. **Build observation**: ~0ms (just attaches hooks, no processing during build)
3. **Post-build analysis**: 100-500ms (SHA-256 hashing all output files)
4. **Differential upload**: Variable (depends on how many files changed)
5. **Snapshot creation**: ~200ms (API call)

Typical total overhead: **1-3 seconds** for incremental deploys. Initial deploys with many files take longer due to upload volume.

### Differential Upload Savings

The content-addressed storage model pays dividends over time:

```
Version 1: 50 files uploaded     (initial — everything is new)
Version 2: 3 files uploaded      (small change)
Version 3: 1 file uploaded       (hotfix)
Version 4: 8 files uploaded      (feature with new dependencies)
Version 5: 2 files uploaded      (CSS-only update)
```

Average files uploaded after initial deploy: much less than total bundle size. This keeps deploy times consistently fast.

## Module Federation Performance

### Remote Loading Overhead

Each federated remote adds a network request for its `remoteEntry.js`:

```
Host loads → requests remoteEntry.js for Remote A → requests remoteEntry.js for Remote B
```

With Zephyr's edge deployment, these requests hit the nearest edge location, minimizing latency. But the sequential nature of MF loading (host must initialize before loading remotes) means more remotes = more waterfall.

**Improvement opportunity**: Zephyr could inject preload hints in the HTML:

```html
<link rel="modulepreload" href="https://remote-a.ze.zephyr-cloud.io/remoteEntry.js">
<link rel="modulepreload" href="https://remote-b.ze.zephyr-cloud.io/remoteEntry.js">
```

This would allow the browser to start downloading remotes in parallel with the host, reducing the waterfall effect.

### Shared Dependency Impact

When sharing works correctly, the performance savings are significant:

```
Without sharing: react (128KB) + react-dom (400KB) × 4 apps = 2.1MB
With sharing:    react (128KB) + react-dom (400KB) × 1 = 528KB
```

But if sharing fails silently (version mismatch), each app loads its own copy — a hidden performance regression that's hard to diagnose.

## Recommendations

1. **Add propagation status API** — Let developers check if a deploy has fully propagated
2. **Implement preload hints** — Reduce MF waterfall by preloading remote entries
3. **Add build performance metrics** — Show time spent in each pipeline phase
4. **Implement shared dependency warnings** — Alert when sharing fails at the edge
5. **Consider read-after-write consistency option** — For apps that need immediate consistency
