# Error Handling & Recovery

Zephyr Cloud's immutable architecture makes error recovery fundamentally simpler than traditional deployments. When things go wrong, you have multiple recovery paths — all fast, all safe.

## Error Categories

### Build Errors

Plugin-side issues during the build phase:

- **Authentication failures** — Invalid or expired `ZE_SECRET_TOKEN`
- **Network errors** — Cannot reach Zephyr control plane
- **Permission errors** — Token doesn't have access to the project

Build errors are non-destructive. If the Zephyr plugin fails, your build output is still intact (silent observation principle). You just don't get the deployment.

### Deploy Errors

Issues during asset upload or snapshot creation:

- **Upload failures** — Network interruption during file upload
- **Snapshot creation failure** — Control plane error during snapshot creation
- **Replication delays** — KV propagation taking longer than expected

Deploy errors are safe because of atomicity. If snapshot creation fails, the environment pointer isn't updated — the previous version continues serving. No partial deploys.

### Runtime Errors

Issues after deployment:

- **Module Federation resolution failures** — Remote module unavailable or incompatible
- **Asset 404s** — File not found in KV store (rare, usually replication delay)
- **Version conflicts** — Shared dependency version mismatch between host and remote

## Recovery Strategies

### Instant Rollback

The fastest recovery path:

1. Open Zephyr dashboard
2. Find the last known-good version
3. Click "Deploy to [environment]"
4. Environment pointer updates atomically
5. Next request serves the previous version

Time to recovery: seconds. No rebuild, no re-upload.

### Version Pinning

When you need stability while investigating:

```json
{
  "zephyr:dependencies": {
    "header": "header@2.0.5"
  }
}
```

Pin a problematic remote to a known-good exact version. Other remotes continue resolving dynamically.

### Version Status Flags

Mark problematic versions to warn consumers:

| Action | Effect |
|--------|--------|
| Mark as **Deprecated** | Still resolves, but consumers see a warning |
| Mark as **Problematic** | Strongly warns consumers, suggests alternatives |
| Mark as **Unavailable** | Removes from resolution (direct URL still works) |
| **Delete** | Permanently removes (cannot be undone) |

### Cloudflare Propagation Delay

The most common "error" that isn't really an error. After deploying to Cloudflare, KV propagation can take 1 minute to 1 hour:

**Symptoms:**
- New version not appearing after deploy
- Old version still serving some users
- Inconsistent behavior across regions

**Resolution:**
- Wait. Propagation is eventual but reliable.
- Check the permanent URL (bypasses environment routing)
- For urgent fixes, use a direct version URL while propagation completes

## Error Codes

Zephyr uses structured error codes prefixed with `ZE`:

| Code | Category | Description |
|------|----------|-------------|
| `ZE10xxx` | Auth | Authentication and authorization errors |
| `ZE20xxx` | Build | Build plugin errors |
| `ZE30xxx` | Deploy | Deployment and upload errors |
| `ZE40xxx` | Runtime | Runtime resolution and loading errors |

Example: `ZE40003` indicates a runtime error where a declared remote dependency couldn't be resolved. This typically means the dependency name doesn't match any deployed application.

## Designing for Resilience

Best practices for minimizing error impact:

1. **Use version ranges, not `@latest`** in production — Prevents a bad deploy from automatically propagating
2. **Test in staging first** — Use environment overrides to validate before production
3. **Monitor version health** — Dashboard shows error rates per version
4. **Keep rollback targets** — Don't delete old versions until well past their useful life
5. **CI-only production deploys** — Use tag conditions (`ci: true, branch: main`) to prevent accidental local deploys from reaching production
