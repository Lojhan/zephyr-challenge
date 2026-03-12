# Remote Dependencies

Remote dependencies are Zephyr Cloud's mechanism for dynamically resolving Module Federation remotes at the edge — no hardcoded URLs, no manual version management.

## The Traditional Problem

In a standard Module Federation setup, remote URLs are hardcoded:

```typescript
new ModuleFederationPlugin({
  remotes: {
    header: 'header@https://cdn.example.com/header/v2.1.0/remoteEntry.js',
    cart: 'cart@https://cdn.example.com/cart/v1.3.2/remoteEntry.js',
  }
})
```

Every update to a remote requires rebuilding and redeploying the host. Coordinating versions across teams becomes a bottleneck. Rollbacks require knowing which version every remote was at.

## Zephyr's Approach

With Zephyr, declare dependencies in `package.json` using flexible resolution strategies:

```json
{
  "name": "host-app",
  "zephyr:dependencies": {
    "header": "header-component.design-system.my-org@latest",
    "cart": "cart-service.shopping.my-org@^2.0.0",
    "footer": "footer.website.my-org@stable"
  }
}
```

At deploy time, Zephyr resolves these declarations to concrete snapshot URLs. At runtime, the edge worker serves the resolved URLs to the browser.

## Application UID Format

Every Zephyr application has a unique identifier derived automatically:

```
{app-name}.{git-repo}.{organization}

Example: shell.zephyr-challenge.lojhan
```

When declaring dependencies, you reference applications by their UID (or a partial match if unambiguous).

## Resolution Strategies

### 1. Semantic Versioning

```json
{
  "header": "header-component@^1.0.0",
  "cart": "cart-service@~2.3.1",
  "utils": "shared-utils@3.0.0"
}
```

- `^1.0.0` — Latest build with major version 1 (1.0.0 ≤ v < 2.0.0)
- `~2.3.1` — Latest build with version 2.3.x (2.3.1 ≤ v < 2.4.0)
- `3.0.0` — Exact version match

### 2. Tag-Based

```json
{
  "header": "header-component@latest",
  "cart": "cart-service@stable",
  "utils": "shared-utils@beta"
}
```

Tags resolve to the latest build matching the tag's conditions. `@latest` is always the most recent build. Custom tags like `@stable` resolve based on their configured rules.

### 3. Environment-Based

```json
{
  "header": "header-component@production",
  "cart": "cart-service@staging"
}
```

Resolves to whatever version is currently active in the specified environment.

### 4. Direct URL

```json
{
  "header": "https://lojhan-42-header-component-design-system-abc123.ze.zephyr-cloud.io"
}
```

Pin to a specific permanent URL. Useful for debugging or when you need exact reproducibility.

## Resolution at the Edge

When a host app loads, the edge worker resolves all remote dependencies before serving:

```
1. Host request arrives at edge worker
2. Worker reads host's snapshot manifest
3. For each zephyr:dependency:
   a. Parse the resolution strategy (semver, tag, env, URL)
   b. Query the resolution engine for the matching snapshot
   c. Construct the remote entry URL from the resolved snapshot
4. Inject resolved URLs into the import map / MF config
5. Serve the host with all remotes resolved
```

This happens at the edge in milliseconds. The browser sees fully resolved URLs — no client-side resolution overhead.

## Benefits

- **Independent Deployment**: Teams deploy their modules independently. The host automatically picks up new versions based on resolution rules.
- **Automatic Compatibility**: Semver ranges ensure you get updates without breaking changes.
- **No Rebuild Required**: Updating a remote doesn't require rebuilding or redeploying the host.
- **Environment-Specific Overrides**: Override remote versions per environment for testing and gradual rollouts.
- **Instant Rollbacks**: Roll back a remote module independently without touching the host.
