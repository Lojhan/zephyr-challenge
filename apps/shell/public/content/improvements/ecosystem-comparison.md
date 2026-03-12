# Ecosystem Comparison

How does Zephyr Cloud compare to alternative approaches for deploying micro-frontends and static applications? Understanding the competitive landscape reveals both Zephyr's strengths and areas where it trails.

## Versus Traditional CDN (S3 + CloudFront)

**The standard approach**: Build locally or in CI, upload to S3, serve via CloudFront.

| Aspect | S3 + CloudFront | Zephyr Cloud |
|--------|-----------------|--------------|
| Setup complexity | Medium (IAM, buckets, distributions) | Low (one-line codemod) |
| Version management | Manual (folder conventions) | Automatic (immutable snapshots) |
| Rollback | Re-upload old files or swap folders | Pointer update, instant |
| MF remote resolution | None (hardcode URLs) | Dynamic at the edge |
| Cost transparency | Clear (AWS pricing) | Less clear |
| Vendor lock-in | AWS (moderate — S3 is standard) | Zephyr + Cloudflare (mitigated by BYOC) |
| Multi-environment | Manual infra per environment | Built-in overrides |

**Verdict**: Zephyr wins on developer experience and Module Federation support. S3 + CloudFront wins on simplicity, cost transparency, and avoiding a new dependency.

## Versus Vercel / Netlify

**The platform approach**: Deploy directly from Git, get preview URLs, edge functions.

| Aspect | Vercel/Netlify | Zephyr Cloud |
|--------|---------------|--------------|
| Git integration | Deep (auto-deploy, preview per PR) | Via CI (ZE_SECRET_TOKEN) |
| Framework support | Broad (Next.js, Nuxt, Remix, etc.) | Bundler-level (any framework) |
| Module Federation | Not supported natively | Core feature |
| Edge functions | Excellent | SSR Worker (beta) |
| Version management | Per-deployment URLs | Immutable snapshots + semantic versioning |
| Team collaboration | Good (comments, preview sharing) | Dashboard (less mature) |
| Pricing model | Per-seat + bandwidth | Varies |

**Verdict**: Vercel/Netlify are better general-purpose platforms. Zephyr wins specifically when you need Module Federation orchestration, dynamic remote resolution, or bundler-level integration.

## Versus Module Federation Server (Medusa)

**The dedicated MF approach**: Medusa is a purpose-built Module Federation server for version management.

| Aspect | Medusa | Zephyr Cloud |
|--------|--------|--------------|
| MF focus | 100% | Primary (but also serves non-MF apps) |
| Edge deployment | No (requires separate hosting) | Built-in (edge-native) |
| Version management | Yes | Yes (more sophisticated) |
| Bundler support | Webpack, Rspack | Webpack, Rspack, Vite, Rollup, Rsbuild, Parcel, Rolldown |
| Self-hosted | Yes (simpler setup) | Yes (K8s — more complex) |
| BYOC | No | Yes (AWS, Fastly, Akamai, K8s) |

**Verdict**: Medusa is lighter and easier to self-host. Zephyr is more comprehensive with edge deployment and broader bundler support.

## Versus Single-SPA

**The runtime approach**: Single-SPA is a micro-frontend framework that orchestrates multiple apps in the browser.

| Aspect | Single-SPA | Zephyr + MF |
|--------|-----------|-------------|
| Approach | Runtime app orchestration | Build-time federation + edge deployment |
| Bundler coupling | None (framework-agnostic) | Bundler plugin required |
| Deployment | Bring your own | Built-in edge deployment |
| Shared dependencies | SystemJS / import maps | MF sharing protocol |
| Learning curve | Steep (complex runtime API) | Moderate (plugin configuration) |
| Version control | Manual import map management | Automatic via snapshots |

**Verdict**: Single-SPA is more flexible but requires more manual orchestration. Zephyr + MF provides a more opinionated, automated experience.

## Where Zephyr Uniquely Excels

1. **Bundler-agnostic Module Federation** — No other platform supports MF remote resolution across Webpack, Rspack, Vite, Rollup, and Rsbuild simultaneously
2. **Content-addressed edge deployment** — The CAS model provides deduplication and caching that CDNs can't match
3. **Environment overrides without rebuild** — The "build once, deploy everywhere" model is genuinely powerful
4. **Silent observation** — Not modifying build output is a unique design choice that enables trust

## Where Zephyr Trails

1. **General-purpose web hosting** — Vercel/Netlify/Cloudflare Pages have better DX for standard web apps
2. **SSR / Full-stack** — Vercel's Next.js integration, Netlify's edge functions are more mature
3. **Community & ecosystem** — Smaller community means fewer examples, tutorials, and Stack Overflow answers
4. **Self-hosting simplicity** — K8s BYOC is enterprise-grade; simpler options would help smaller teams
