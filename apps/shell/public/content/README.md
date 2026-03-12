# Zephyr Cloud

**Zephyr Cloud** is a deployment and orchestration platform purpose-built for modern JavaScript applications. It integrates directly into your bundler pipeline — Webpack, Rspack, Vite, Rollup, Rsbuild, Parcel, and more — to provide edge deployment, version management, and dynamic module resolution without altering your build output.

## What Makes Zephyr Different

Traditional deployment platforms treat applications as monoliths: you build, you push, you serve. Zephyr Cloud rethinks this model from the ground up by treating every build artifact as an **immutable, content-addressed snapshot** deployed to a global edge network.

Key principles:

- **Silent observation** — Plugins attach to your bundler lifecycle without modifying output. Your build with Zephyr produces identical artifacts to your build without it.
- **Content-addressed storage** — Every asset is stored by its SHA-256 hash. Same file across versions? Stored once. This provides perfect deduplication and instant cache validation.
- **Immutable versions** — Every deployment creates a permanent URL that works forever. Rollbacks are instant because every version remains intact.
- **Build once, deploy everywhere** — Environment overrides let you deploy the same build to staging, production, and any number of custom environments without rebuilding.

## Architecture at a Glance

Zephyr Cloud is composed of four primary subsystems:

1. **Build Integration Plane** — Bundler plugins that intercept lifecycle events, extract metadata, and initiate deployments
2. **Control Plane** — Centralized API managing authentication, project management, and deployment orchestration
3. **Data Plane** — Distributed edge workers handling request routing and asset serving across 200+ locations
4. **Storage Plane** — Globally distributed KV stores implementing content-addressed storage with automatic replication

## Quick Start

Getting started requires a single command:

```bash
curl -fsSL https://with.zephyr-cloud.io | node
```

This auto-detects your bundler (Webpack, Vite, Rspack, etc.) and configures the Zephyr plugin — no manual setup required.

## Who Is This For

Zephyr Cloud is designed for teams building:

- **Micro-frontends** with Module Federation that need dynamic remote resolution
- **Multi-environment applications** that deploy to staging, QA, and production from a single build
- **Edge-first applications** that need global distribution with sub-millisecond routing
- **Large organizations** with BYOC (Bring Your Own Cloud) requirements on AWS, Fastly, Akamai, or Kubernetes

## Explore This Documentation

Use the file navigator on the left to explore detailed sections:

- **Architecture** — Deep dive into the four-plane system design
- **Features** — Versioning, tags, environments, remote dependencies, CI/CD
- **Module Federation** — How Zephyr enhances micro-frontend orchestration
- **Deployment** — Edge infrastructure, cloud providers, and BYOC options
- **Improvements** — Honest assessment of what could be better
