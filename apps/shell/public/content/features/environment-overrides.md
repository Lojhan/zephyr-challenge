# Environment Overrides

Environment overrides are what make Zephyr Cloud's "build once, deploy everywhere" model possible. A single build artifact can serve multiple environments with different configurations — without rebuilding.

## The Problem

Traditional deployment pipelines embed environment-specific values at build time:

```bash
# Build for staging
API_URL=https://api.staging.com npm run build
# Build for production (separate build!)
API_URL=https://api.production.com npm run build
```

Two builds for the same code. Different binaries. No guarantee they behave identically. Multiply by the number of environments, and build times (and risks) scale linearly.

## Zephyr's Solution

Zephyr captures environment variables prefixed with `ZE_PUBLIC_*` at build time, but these values can be **overridden per environment** at deploy time:

### Build Phase

```bash
ZE_PUBLIC_API_URL=https://api.dev.example.com npm run build
```

The build captures `ZE_PUBLIC_API_URL` in the snapshot. One build artifact is produced.

### Deploy Phase

In the Zephyr dashboard, configure overrides per environment:

| Environment | ZE_PUBLIC_API_URL |
|-------------|-------------------|
| staging | `https://api.staging.example.com` |
| production | `https://api.production.example.com` |
| qa | `https://api.qa.example.com` |

The same build artifact serves all three environments. The edge worker injects the correct values at runtime via `zephyr-manifest.json`.

## Remote Dependency Overrides

Even more powerful: you can override **which version of a remote module** loads in each environment:

```json
// staging environment config
{
  "remote_overrides": {
    "header": "@staging",
    "cart": "cart-service@^2.1.0"
  }
}

// production environment config
{
  "remote_overrides": {
    "header": "@stable",
    "cart": "cart-service@2.0.5"
  }
}
```

Same host application, but staging resolves the `header` remote to the latest staging build while production uses the stable tag. No rebuild needed.

## The Manifest System

Overrides are delivered via `zephyr-manifest.json`, a small JSON document served alongside your application:

```json
{
  "env": {
    "ZE_PUBLIC_API_URL": "https://api.production.example.com",
    "ZE_PUBLIC_FEATURE_FLAGS": "dark-mode,new-checkout"
  },
  "remotes": {
    "header": "https://stable-header-abc123.ze.zephyr-cloud.io/remoteEntry.js",
    "cart": "https://v2.0.5-cart-def456.ze.zephyr-cloud.io/remoteEntry.js"
  }
}
```

The Zephyr runtime reads this manifest on application startup to:
1. Inject environment variable overrides
2. Resolve Module Federation remote URLs

## Use Cases

### Blue-Green Deployments

Run two production environments side by side:
- `production-blue` → current stable version
- `production-green` → new version being validated

Switch traffic by updating DNS or load balancer routing.

### Canary Releases

Deploy a new version to a small percentage of traffic:
- `production` → version 41 (95% traffic)
- `production-canary` → version 42 (5% traffic)

Monitor metrics, then promote canary to production by updating the snapshot pointer.

### Feature Branches

Every feature branch gets its own environment with overrides pointing to the branch's latest builds:
- `preview/feature-dark-mode` → dark-mode branch builds
- `preview/feature-checkout-v2` → checkout-v2 branch builds

Developers and QA can test in isolation without affecting other environments.
