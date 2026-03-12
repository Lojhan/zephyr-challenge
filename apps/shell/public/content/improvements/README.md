# What Could Be Better

An honest assessment of Zephyr Cloud's current limitations, rough edges, and areas where the platform could improve. This is not criticism — it's engineering analysis. Every platform has tradeoffs, and understanding them is essential for making informed decisions.

## Developer Experience

### Documentation Gaps

The documentation is comprehensive but uneven. Some areas are well-covered (quick start, basic deployment), while others lack depth:

- **Error code reference** is incomplete — many `ZE` codes lack detailed explanations or resolution steps
- **Advanced Module Federation patterns** have limited real-world examples
- **BYOC setup guides** could use step-by-step walkthroughs for each provider
- **Troubleshooting guides** are sparse — when things go wrong, you're often on your own

### Plugin Error Messages

When the Zephyr plugin encounters an error, the messages are sometimes cryptic:

```
ZE40003: Remote dependency resolution failed
```

What's missing: Which dependency? What resolution strategy was used? What candidates were considered? Actionable error messages with suggested fixes would significantly reduce debugging time.

### Local Development Story

The current recommended pattern is to disable Zephyr in development:

```typescript
const isProd = process.env.NODE_ENV === 'production';
export default isProd ? withZephyr()(config) : config;
```

This works, but it means development and production have different code paths. A proper dev mode that simulates Zephyr's resolution without deploying would be valuable.

## Architecture

### Cloudflare Lock-In (Default Tier)

The managed tier runs entirely on Cloudflare. While BYOC options exist, the default experience is tightly coupled to Cloudflare's infrastructure. If Cloudflare has an outage, your Zephyr-managed apps go down.

The KV eventual consistency model is also Cloudflare-specific:
- Propagation can take 1 minute to 1 hour
- No way to force immediate propagation
- No way to check propagation status programmatically

### No Offline / Self-Hosted Lite Option

For teams that can't use cloud services (compliance, air-gapped environments), there's no lightweight self-hosted option. The K8s BYOC deployment is enterprise-grade and complex. A simpler Docker Compose setup for small teams would lower the barrier.

### SSR Support Is Nascent

Server-Side Rendering with Zephyr is marked as beta:
- SSR Worker support is experimental on Cloudflare
- The MF + SSR combination has limited documentation
- Edge SSR performance characteristics are not well-documented

For teams that need SSR, this is a significant gap.

## Module Federation Specifics

### Shared Dependency Version Conflicts

Zephyr captures shared dependency information in snapshots but doesn't actively prevent incompatible deployments. You can deploy a remote with React 19 while the host is on React 18 — the error only surfaces at runtime.

An automated compatibility check during the deploy phase would catch these issues before they reach users.

### No Dependency Graph Visualization

While the dashboard shows deployment history, there's no visual dependency graph showing:
- Which hosts consume which remotes
- Version compatibility across the graph
- Impact radius of a remote update (which hosts are affected?)

This kind of visualization would be invaluable for large micro-frontend architectures.

### Import Map Browser Support

Zephyr uses import maps for runtime resolution. While browser support is now broad (Chrome, Firefox, Safari, Edge), it's not universal. Older browsers and some enterprise environments may need polyfills. The fallback story could be better documented.

## Operational Concerns

### Monitoring & Observability

The dashboard provides basic deployment status, but lacks:
- **Real-time error tracking** per version
- **Performance metrics** (load times, cache hit rates)
- **Usage analytics** (which versions are actively serving traffic)
- **Alerting** (notify when a version's error rate spikes)

Integration with existing observability tools (DataDog, Grafana, New Relic) would help teams fit Zephyr into their existing monitoring stack.

### Cost Transparency

The pricing model for edge storage and bandwidth could be clearer. For large applications with many versions, understanding storage costs requires calculation. A dashboard showing current usage and projected costs would help.

### Migration Path

There's no documented migration path from:
- Existing CDN deployments → Zephyr
- One Zephyr provider to another (Cloudflare → AWS)
- Zephyr → back to traditional deployment (exit strategy)

Teams evaluating Zephyr need confidence they're not locked in.

## What's Promising

Despite these gaps, several aspects show strong engineering:

1. **The CAS model is fundamentally sound** — content-addressed storage with immutable snapshots is an excellent foundation
2. **Multi-bundler support is impressive** — supporting Webpack, Rspack, Vite, Rollup, Rsbuild, Parcel, and more through a unified architecture is rare
3. **The silent observation principle is correct** — not modifying build output is the right design choice
4. **BYOC flexibility** — supporting K8s, AWS, Fastly, and Akamai keeps enterprise doors open
5. **The `with-zephyr` codemod** — auto-detecting bundlers and configuring plugins automatically is great DX
