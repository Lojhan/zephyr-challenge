# Cloud Providers & BYOC

Zephyr Cloud supports multiple deployment targets beyond the default managed Cloudflare infrastructure. The BYOC (Bring Your Own Cloud) model lets enterprises deploy to their own infrastructure while using Zephyr's orchestration.

## Supported Providers

| Provider | Model | Status | Key Features |
|----------|-------|--------|--------------|
| **Cloudflare** | Managed (default) | ✅ Production | Workers, KV, 200+ locations, zero cold starts |
| **AWS** | BYOC | ✅ Production | S3, CloudFront, custom VPC |
| **Fastly** | BYOC | ✅ Production | Varnish-based edge, real-time logs |
| **Akamai** | BYOC | ✅ Production | Enterprise edge, advanced routing |
| **Kubernetes** | BYOC (Enterprise) | ✅ Production | Self-hosted, Redis + S3-compatible storage |

## Cloudflare (Default Managed)

The zero-configuration option. Zephyr provisions and manages everything:

- **Workers**: Handle request routing and asset serving
- **KV Namespaces**: Store files, snapshots, and environment configs
- **DNS**: CNAME records for custom domains
- **SSL**: Automatic certificate provisioning

You don't need a Cloudflare account for the managed tier. Zephyr handles all infrastructure.

## AWS (BYOC)

For teams already invested in AWS:

- **Storage**: S3 buckets for asset storage
- **CDN**: CloudFront for global distribution
- **Compute**: Lambda@Edge or CloudFront Functions for routing
- **DNS**: Route 53 for custom domains

You connect your AWS account and Zephyr deploys to your infrastructure. You maintain full control over networking, security groups, and billing.

## Kubernetes (Enterprise BYOC)

For organizations requiring complete control:

### Architecture

```
┌─────────────────────────────────────┐
│           Kubernetes Cluster         │
│                                      │
│  ┌──────────┐  ┌──────────────────┐ │
│  │  Zephyr   │  │  Redis (KV)      │ │
│  │  Worker   │  │  - envs          │ │
│  │  (Pod)    │  │  - snapshots     │ │
│  └──────────┘  └──────────────────┘ │
│                                      │
│  ┌──────────────────────────────────┐│
│  │  S3-Compatible Storage           ││
│  │  (AWS S3 / MinIO / Ceph)        ││
│  │  - file assets                  ││
│  └──────────────────────────────────┘│
└─────────────────────────────────────┘
```

### Configuration

```json
{
  "ZE_WORKER_PORT": "8080",
  "ZE_WORKER_JWT_SECRET": "your-secret-key",
  "ZE_WORKER_S3_ENDPOINT": "https://s3.amazonaws.com",
  "ZE_WORKER_S3_BUCKET": "zephyr-assets",
  "ZE_WORKER_S3_ACCESS_KEY": "***",
  "ZE_WORKER_S3_SECRET_KEY": "***",
  "ZE_WORKER_REDIS_HOST": "redis.default.svc",
  "ZE_WORKER_REDIS_PORT": "6379",
  "ZE_WORKER_REDIS_PREFIX_ENVS": "{ze-k8s-worker}:envs:",
  "ZE_WORKER_REDIS_PREFIX_SNAPSHOTS": "{ze-k8s-worker}:snapshots:",
  "ZE_WORKER_REPLICA_NAME": "us-east-1",
  "ZE_WORKER_REPLICAS_URLS": [
    "https://ze.eu.example.com",
    "https://ze.ap.example.com"
  ]
}
```

### Health Checks

The K8s worker exposes standard health endpoints:

- `/healthz` — Liveness probe (is the worker process running?)
- `/readyz` — Readiness probe (can the worker serve requests?)

### Multi-Region Replication

K8s deployments support cross-region replication:

1. Deploy workers in multiple regions (us-east, eu-west, ap-southeast)
2. Configure `ZE_WORKER_REPLICAS_URLS` to list all regions
3. Assets uploaded to one region replicate to all others
4. GeoDNS routes users to the nearest healthy region

## Choosing a Provider

| Requirement | Best Choice |
|-------------|-------------|
| Fastest setup, no infra management | Cloudflare (managed) |
| Existing AWS investment, need VPC integration | AWS BYOC |
| High-traffic, need cache customization | Fastly BYOC |
| Enterprise compliance, internal hosting required | Kubernetes BYOC |
| Maximum global coverage, simplest operations | Cloudflare (managed) |

All providers use the same Zephyr plugin, same CLI, same dashboard. The deployment target is infrastructure — your development workflow doesn't change.
