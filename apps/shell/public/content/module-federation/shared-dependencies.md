# Shared Dependencies in Module Federation

Shared dependencies are one of Module Federation's most powerful features — and one of its trickiest to get right. Zephyr Cloud's snapshot system provides tools to manage this complexity.

## The Sharing Problem

When a host and three remotes all use React 18, you don't want four copies of React in the browser. Module Federation's `shared` configuration prevents this:

```typescript
shared: {
  react: { singleton: true, requiredVersion: '^18.0.0' },
  'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
}
```

The `singleton: true` flag tells MF to use exactly one instance of React across all federated modules. The `requiredVersion` ensures compatibility.

## How Sharing Works at Runtime

1. Host loads and initializes its React instance
2. Remote loads and checks: "Is a compatible React already loaded?"
3. If yes → reuses the host's instance (zero extra bytes)
4. If no → loads its own (potentially causing version conflicts with singletons)

## Common Pitfalls

### Eager Loading

If the host's entry point imports React before Module Federation's sharing system initializes, sharing breaks. The fix:

```typescript
// bootstrap.tsx (dynamically imported)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
```

```typescript
// index.ts (entry point)
import('./bootstrap');
```

Or in Rsbuild/Rspack, use `eager: true` on the host's shared config:

```typescript
shared: {
  react: { singleton: true, eager: true },
  'react-dom': { singleton: true, eager: true },
}
```

The `eager` flag tells the host to provide React immediately, without waiting for the async bootstrap.

### Version Mismatches

Remote built with React 18, host updated to React 19. The `requiredVersion` check fails at runtime.

Zephyr's snapshot captures the exact shared dependency versions. The dashboard can show version compatibility matrices across hosts and remotes, making mismatches visible before they cause runtime errors.

### Over-Sharing

Sharing too many dependencies can cause issues:

```typescript
// Don't do this
shared: {
  ...packageJson.dependencies  // Shares everything
}
```

Only share what genuinely needs to be a singleton (React, state management) or what's large enough that deduplication matters.

## Zephyr's Role in Sharing

Zephyr doesn't modify how Module Federation sharing works at runtime. What it provides:

1. **Visibility** — Snapshot metadata includes shared dependency versions across all apps
2. **Compatibility Checks** — Dashboard shows which remote versions are compatible with which host versions
3. **Version Resolution** — When resolving remote dependencies, shared dependency compatibility is considered
4. **Audit Trail** — Complete history of which shared dependency versions were active at any point in time

## Best Practices

1. **Always share React and React-DOM as singletons** — Multiple React instances cause hooks to break
2. **Use `requiredVersion` with ranges** — `^18.0.0` is more flexible than `18.2.0`
3. **Use `eager: true` on the host only** — The host provides; remotes consume
4. **Keep shared dependencies minimal** — Only share what must be deduplicated
5. **Test version upgrades in staging first** — Use Zephyr's environment overrides to test new shared versions before production
