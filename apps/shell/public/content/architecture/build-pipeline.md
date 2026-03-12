# Build Pipeline Deep Dive

The build pipeline is where Zephyr Cloud's "silent observation" philosophy comes to life. Understanding how the plugin integrates with your bundler reveals why Zephyr can work with any tool without friction.

## Plugin Lifecycle

Every Zephyr bundler plugin follows the same seven-phase lifecycle, regardless of which bundler you use:

### Phase 1: Initialization

When you wrap your config with `withZephyr()`, the plugin:

1. Reads the `ZE_SECRET_TOKEN` environment variable (for CI) or initiates browser login
2. Resolves the **Application UID** from your `package.json` name + git remote + org
3. Validates project access against the control plane
4. Registers itself into the bundler's plugin system

```typescript
// Rsbuild example
import { withZephyr } from 'zephyr-rsbuild-plugin';

export default withZephyr()({
  // Your normal rsbuild config — Zephyr wraps it transparently
});
```

### Phase 2: Build Configuration Analysis

The plugin scans your bundler config for:

- Module Federation declarations (remotes, exposes, shared)
- Entry points and output paths
- Code splitting configuration
- Asset processing rules

This is read-only analysis. Nothing is modified.

### Phase 3: Compilation Observation

During the actual compilation, Zephyr attaches to bundler hooks as a passive observer:

- **Webpack/Rspack**: `compilation` and `afterEmit` hooks
- **Vite/Rollup**: `generateBundle` and `writeBundle` hooks
- **Parcel**: Reporter plugin API

The plugin tracks which files are produced, their sizes, and their relationships — but never alters the output.

### Phase 4: Post-Build Analysis

After compilation completes, the plugin:

1. Walks the output directory
2. Computes SHA-256 hashes for every file
3. Classifies assets (JS bundles, CSS, images, fonts, HTML)
4. Maps source files to output chunks
5. Builds the complete asset manifest

### Phase 5: Differential Upload

For efficiency, only **new or changed** files are uploaded:

```
For each file in manifest:
  hash = SHA-256(file_content)
  if hash exists in ze_files KV store:
    skip (already stored)
  else:
    upload to ze_files with hash as key
```

This means deploying a one-line CSS change uploads only that single changed file, not your entire application.

### Phase 6: Snapshot Creation

The snapshot is the heart of Zephyr's version management. It captures:

- Complete asset manifest with content fingerprints
- Git information (commit hash, branch, author)
- Build metadata (bundler, node version, timestamps)
- Module Federation configuration (if present)
- Captured `ZE_PUBLIC_*` environment variables
- Remote dependency declarations

The snapshot is immutable once created. It receives a unique build ID and a permanent URL.

### Phase 7: Environment Update

Finally, the environment configuration is updated atomically. This is the moment the new version goes live:

1. The `ze_envs` KV entry for the target environment is updated to point to the new snapshot
2. Edge workers immediately start serving the new version on subsequent requests
3. Previous version remains accessible via its permanent URL

## Application UID

Every Zephyr application is identified by a structured UID:

```
{app-name}.{git-repo}.{organization}

Example: ui-components.design-system.my-company
```

This UID is derived automatically from:
- `name` field in `package.json`
- Git remote URL
- Organization in the Zephyr dashboard

No manual configuration needed.

## The `withZephyr()` Pattern

All plugins follow the same wrapper pattern:

```typescript
// Webpack
const { withZephyr } = require('zephyr-webpack-plugin');
module.exports = withZephyr()(webpackConfig);

// Vite
import { withZephyr } from 'vite-plugin-zephyr';
export default defineConfig({ plugins: [withZephyr()] });

// Rspack
import { withZephyr } from 'zephyr-rspack-plugin';
export default withZephyr()(rspackConfig);
```

The `withZephyr()` function is a higher-order function that returns a config transformer. It never mutates the original config — it creates a new config with the Zephyr plugin attached.
