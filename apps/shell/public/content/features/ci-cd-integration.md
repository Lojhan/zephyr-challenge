# CI/CD Integration

Zephyr Cloud integrates with any CI/CD system through a single environment variable: `ZE_SECRET_TOKEN`. No special CLI commands, no deployment scripts — just run your normal build and Zephyr handles the rest.

## How It Works

1. Generate an API token in the Zephyr dashboard
2. Set `ZE_SECRET_TOKEN` as a secret in your CI environment
3. Run `npm run build` (or your normal build command)
4. Zephyr plugin detects the token and authenticates automatically
5. Build artifacts are uploaded and deployed to the edge

That's it. No `zephyr deploy` command. No separate deployment step. The build plugin handles everything.

## GitHub Actions

```yaml
name: Deploy to Zephyr
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
        env:
          ZE_SECRET_TOKEN: ${{ secrets.ZEPHYR_AUTH_TOKEN }}
```

Every push to `main` or `develop` automatically deploys. Pull requests create preview environments.

## GitLab CI/CD

```yaml
deploy:
  image: node:20
  stage: deploy
  variables:
    ZE_SECRET_TOKEN: $ZE_SECRET_TOKEN
  script:
    - npm ci
    - npm run build
  only:
    - main
    - develop
    - merge_requests
```

## Other CI Systems

The pattern is identical for any CI:

- **Jenkins**: Set `ZE_SECRET_TOKEN` in credentials manager
- **CircleCI**: Add to project environment variables
- **Azure DevOps**: Set in pipeline variables
- **Bitbucket Pipelines**: Add as repository variable

```bash
# Generic CI script
export ZE_SECRET_TOKEN="your-token"
npm ci
npm run build
# Done — Zephyr deploys automatically during build
```

## Authentication Flow

When `ZE_SECRET_TOKEN` is present:
1. Plugin reads the token from environment
2. Authenticates against the Zephyr control plane
3. Proceeds with build observation and deployment

When `ZE_SECRET_TOKEN` is absent (local development):
1. Plugin opens browser for OAuth login
2. User authenticates via GitHub/Google/email
3. Local token is cached for future builds

## CI-Specific Tags

Builds created in CI automatically get special metadata:

- `ci: true` flag on the snapshot
- Environment detection (GitHub Actions, GitLab CI, etc.)
- PR/MR number association for preview environments

This metadata can be used in tag condition rules:

```json
{
  "tag": "stable",
  "conditions": {
    "branch": "main",
    "ci": true
  }
}
```

The `stable` tag only resolves to builds that were created in CI from the `main` branch — never a local dev build.

## Monorepo Support

In monorepos (Nx, Turborepo, pnpm workspaces), each application with a Zephyr plugin deploys independently:

```
my-monorepo/
  apps/
    host/        → deploys as "host.my-monorepo.org"
    remote-a/    → deploys as "remote-a.my-monorepo.org"
    remote-b/    → deploys as "remote-b.my-monorepo.org"
```

Each app has its own build, snapshots, versions, and deployment history. The CI build command builds all apps, and each Zephyr plugin handles its own deployment.
