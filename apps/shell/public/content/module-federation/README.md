# Module Federation & Zephyr

Module Federation is a runtime architecture that allows JavaScript applications to dynamically load code from other independently-deployed applications. Zephyr Cloud takes this powerful concept and solves its operational challenges: versioning, discovery, routing, and deployment.

## Module Federation Basics

Module Federation (MF) defines three core concepts:

### Host

The application that loads remote modules at runtime:

```typescript
new ModuleFederationPlugin({
  name: 'shell',
  remotes: {
    header: 'header@http://localhost:3001/remoteEntry.js',
  },
  shared: { react: { singleton: true } }
})
```

### Remote

The application that exposes modules for others to consume:

```typescript
new ModuleFederationPlugin({
  name: 'header',
  filename: 'remoteEntry.js',
  exposes: {
    './Header': './src/components/Header',
  },
  shared: { react: { singleton: true } }
})
```

### Shared

Dependencies shared between host and remotes to avoid duplication. Singletons (like React) ensure only one instance runs.

## Where Traditional MF Breaks Down

Module Federation works brilliantly in development. Push to production, and the problems start:

1. **Hardcoded URLs** — Remote entry URLs are baked into the host at build time. Updating a remote requires rebuilding the host.
2. **No Version Management** — There's no concept of "version 2.1 of the header remote." You deploy, and whatever is at the URL is what loads.
3. **No Rollback** — If a bad remote deploys, you can't roll back without redeploying the previous version to the same URL.
4. **No Discovery** — No central registry of available remotes, their versions, or their compatibility.
5. **Environment Coupling** — Different environments need different remote URLs, but MF config is compile-time.

## How Zephyr Solves Each Problem

### Dynamic URL Resolution

Instead of hardcoding remote URLs:

```json
// package.json
{
  "zephyr:dependencies": {
    "header": "header.my-project.my-org@latest"
  }
}
```

Zephyr's edge worker resolves the actual URL at request time. No rebuild needed when remotes update.

### Version-Aware Remotes

Every remote deployment creates a versioned snapshot. Hosts can declare version ranges:

```json
{
  "zephyr:dependencies": {
    "header": "header@^2.0.0",
    "cart": "cart@~1.3.0"
  }
}
```

The resolution engine picks the latest compatible version automatically.

### Instant Independent Rollbacks

Each remote has independent version history. Rolling back the header remote doesn't affect the cart remote. The host doesn't need to know or care — it continues resolving based on its declared ranges.

### Central Discovery

The Zephyr dashboard provides a complete view of:
- All deployed remotes and their versions
- Dependency graphs between hosts and remotes
- Version compatibility matrix
- Deployment history and rollback options

### Environment Decoupling

Remote resolution respects environment context:

```json
// production environment
{ "header": "header@stable" }

// staging environment
{ "header": "header@latest" }
```

Same host build, different remote versions per environment.

## The MF Build Plugin Flow

When building a Module Federation app with Zephyr:

1. **Analysis** — Plugin detects MF configuration (remotes, exposes, shared)
2. **Build** — Normal MF compilation proceeds (Zephyr doesn't interfere)
3. **Snapshot** — MF metadata is captured alongside the asset manifest
4. **Resolution** — On deployment, `zephyr:dependencies` are resolved to concrete snapshot URLs
5. **Serving** — Edge worker injects resolved remote URLs into the runtime
