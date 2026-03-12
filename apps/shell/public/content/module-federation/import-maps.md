# Import Maps & Runtime Resolution

Zephyr Cloud generates and manages import maps to enable dynamic Module Federation remote resolution at runtime — bridging the gap between build-time configuration and runtime flexibility.

## What Are Import Maps?

Import maps are a browser-native mechanism for controlling how JavaScript module specifiers resolve:

```html
<script type="importmap">
{
  "imports": {
    "header": "https://header-v2-abc123.ze.zephyr-cloud.io/remoteEntry.js",
    "cart": "https://cart-v1-def456.ze.zephyr-cloud.io/remoteEntry.js"
  }
}
</script>
```

With an import map in place, `import('header')` resolves to the Zephyr-deployed URL without any bundler configuration.

## Zephyr's Import Map Generation

When a host application's snapshot is resolved at the edge, Zephyr generates an import map that:

1. Resolves all `zephyr:dependencies` to concrete URLs
2. Applies environment-specific overrides
3. Injects the map into the HTML response

The process:

```
Request for host app
  → Edge worker reads host snapshot
  → Resolves zephyr:dependencies against current environment
  → Generates import map with resolved URLs
  → Injects into HTML <head>
  → Returns modified HTML to browser
```

## Federation Runtime Integration

Module Federation 2.0 introduced a runtime API that works with Zephyr's resolution:

```typescript
import { init, loadRemote } from '@module-federation/enhanced/runtime';

init({
  name: 'host',
  remotes: [
    {
      name: 'header',
      entry: 'https://resolved-by-zephyr.ze.zephyr-cloud.io/remoteEntry.js'
    }
  ]
});

// Later, dynamically load the remote
const Header = await loadRemote('header/Header');
```

Zephyr populates the `entry` URLs before the runtime initializes, so the host code doesn't need to know actual deployment URLs.

## Dynamic vs. Static Resolution

### Static (Build-Time)

Traditional MF: URLs hardcoded in bundler config. Simple but inflexible.

```typescript
remotes: {
  header: 'header@https://cdn.example.com/header/remoteEntry.js'
}
```

### Dynamic (Zephyr Runtime)

URLs resolved at the edge per-request based on environment, tags, and version rules. Flexible but requires Zephyr's infrastructure.

```json
// package.json
{
  "zephyr:dependencies": {
    "header": "@latest"
  }
}
```

## Benefits of Edge Resolution

1. **Zero Client Overhead** — Resolution happens at the edge, not in the browser. No extra network requests or client-side logic.
2. **Atomic Updates** — All remotes are resolved in a single pass, ensuring consistency.
3. **Cache-Friendly** — Resolved import maps are cacheable per environment + snapshot combination.
4. **Fallback Support** — If a remote is unavailable, the edge can resolve to a fallback version.

## The Import Map Lifecycle

```
1. Developer pushes code
2. CI builds host → creates snapshot with zephyr:dependencies
3. User requests host app
4. Edge worker resolves dependencies
5. Import map generated with resolved URLs
6. Browser receives HTML with import map
7. MF runtime uses import map for remote loading
8. Remote updates → new resolution on next request (no host rebuild)
```

Step 8 is the key insight: when a remote publishes a new version that matches the host's resolution criteria, the next request to the host automatically picks up the new version. No host rebuild. No deployment. Just edge resolution.
