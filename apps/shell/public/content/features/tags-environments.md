# Tags & Environments

Tags and environments are Zephyr Cloud's routing layer — the system that decides which version of your application serves a given request.

## Environments

An environment is a **deployment destination** with its own configuration:

- Custom domain(s)
- Active snapshot pointer
- Environment variable overrides
- Remote dependency overrides

Typical environments: `production`, `staging`, `qa`, `preview-{branch}`.

Each environment gets its own URL pattern and can have multiple custom domains mapped to it. Deploying to an environment simply updates its snapshot pointer.

## Tags

Tags are **smart pointers** — dynamic references that automatically resolve to specific versions based on configurable rules.

### Built-in Tags

Every build automatically creates tags:

- `@latest` — Always points to the most recent build
- `@{branch-name}` — Points to the latest build from that branch (e.g., `@main`, `@feature/dark-mode`)
- `@{username}` — Points to the latest build by that user

### Custom Tag Rules

You can define custom tags with condition-based rules:

```json
{
  "tag": "stable",
  "conditions": {
    "branch": "main",
    "ci": true
  }
}
```

This tag resolves to the latest build that was:
1. Built from the `main` branch
2. Built in a CI environment (not a local dev build)

### Condition Types

Tags support multiple condition types:

| Condition | Example | Description |
|-----------|---------|-------------|
| `branch` | `"main"` | Git branch name match |
| `user` | `"lojhan"` | Build author match |
| `ci` | `true` | Built in CI (ZE_SECRET_TOKEN present) |
| `version` | `">=1.0.0"` | Semantic version range match |
| `git_pattern` | `"v*"` | Git tag/ref glob pattern |

### Nested Conditions

Conditions can be combined with AND/OR logic:

```json
{
  "tag": "release-candidate",
  "conditions": {
    "AND": [
      { "branch": "release/*" },
      { "ci": true },
      { "OR": [
        { "user": "lojhan" },
        { "user": "ci-bot" }
      ]}
    ]
  }
}
```

## How They Work Together

The relationship between tags and environments creates a flexible routing system:

1. **Environment** defines WHERE traffic goes (domain, config)
2. **Tag** defines WHICH version serves that environment
3. **Snapshot** contains the actual deployment content

Example flow:

```
production environment
  → uses tag "stable"
  → "stable" resolves to build #42 (latest from main + CI)
  → build #42's snapshot serves all production traffic

staging environment
  → uses tag "latest"
  → "latest" resolves to build #47 (most recent build)
  → build #47's snapshot serves staging traffic
```

## Preview Environments

Zephyr automatically creates preview environments for every branch:

```
Branch: feature/dark-mode
Preview URL: https://feature-dark-mode-{app}-{project}.ze.zephyr-cloud.io
```

Each push to the branch updates the preview automatically. When the branch is merged, the preview can be cleaned up. This gives every pull request its own live, shareable deployment.

## Multi-Domain Support

Environments can have multiple custom domains:

```
production environment:
  - www.myapp.com
  - myapp.com
  - app.myapp.io
```

All domains serve the same snapshot. This enables white-label deployments where different domains show the same application with potentially different environment variable overrides (theming, branding, API endpoints).
