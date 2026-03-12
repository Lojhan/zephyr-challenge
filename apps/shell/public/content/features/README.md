# Features

Zephyr Cloud provides a comprehensive set of features designed around the principles of immutability, atomicity, and developer experience. This section covers the core capabilities that differentiate Zephyr from traditional deployment platforms.

## Core Features

### Immutable Versioning

Every build creates a permanent, immutable snapshot with its own URL. No version ever expires. Rollbacks are instant — just point the environment to a previous snapshot.

→ See **Versions & Snapshots** for the complete model.

### Tags & Environments

Tags are smart pointers with condition rules. Environments are deployment destinations with custom domains. Together, they enable sophisticated routing without rebuilding.

→ See **Tags & Environments** for configuration details.

### Environment Overrides

The "build once, deploy everywhere" model. Override remote dependencies and environment variables per environment without rebuilding. A single build artifact can serve staging, QA, and production.

→ See **Environment Overrides** for the override system.

### Remote Dependencies

Dynamic resolution of Module Federation remotes using version ranges, tags, or environment targeting. No hardcoded URLs.

→ See **Remote Dependencies** for resolution strategies.

### CI/CD Integration

Deploy from any CI system with a single environment variable. GitHub Actions, GitLab CI, Jenkins, CircleCI — all supported via `ZE_SECRET_TOKEN`.

→ See **CI/CD Integration** for setup guides.

## Supported Bundlers

| Bundler | Plugin | Status |
|---------|--------|--------|
| Webpack 5+ | `zephyr-webpack-plugin` | ✅ Production |
| Rspack | `zephyr-rspack-plugin` | ✅ Production |
| Rsbuild | `zephyr-rsbuild-plugin` | ✅ Production |
| Vite 5-7 | `vite-plugin-zephyr` | ✅ Production |
| Rollup 4 | `rollup-plugin-zephyr` | ✅ Production |
| Parcel 2.x | `parcel-reporter-zephyr` | ✅ Production |
| Rolldown | `zephyr-rolldown-plugin` | 🧪 Beta |
| Metro (React Native) | `zephyr-metro-plugin` | ✅ Production |

## Supported Meta-Frameworks

| Framework | Plugin | Notes |
|-----------|--------|-------|
| Modern.js | `zephyr-modernjs-plugin` | Full-stack, Rspack-based |
| Astro | `zephyr-astro-integration` | Static + SSR |
| TanStack Start | `vite-plugin-tanstack-start-zephyr` | Vite-powered |
| RSPress | `zephyr-rspress-plugin` | Documentation tool |
