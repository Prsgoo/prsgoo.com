---
title: "The homelab"
date: 2026-06-15
summary: "Self-hosted production-grade infrastructure on Proxmox VE 8 - built around four principles: failure isolation, reproducibility, security by default, and maintainability."
type: case-study
tags: [Homelab, Proxmox, Linux, Docker, Traefik, Tailscale]
draft: false
---

I self-host because I like owning the things I depend on. What started as "I'll just run Jellyfin" is now a fleet of Proxmox LXC containers doing real work: media, network-wide DNS and ad blocking, a reverse proxy handling all internal HTTPS, game servers, home automation, monitoring, and a plane-spotting receiver because why not.

The goal from the start was to treat it like production. Not because I have to, but because the discipline is useful and the constraints are interesting. Four principles shape every decision: **failure isolation** (one misbehaving service shouldn't affect others), **reproducibility** (rebuild from scratch using the repo and documented procedures), **security by default** (nothing exposed to the internet without an explicit reason), **maintainability** (changes tracked in git, not clicking through UIs).

## Why LXC over a single Docker host

The obvious path is one big VM with Docker Compose stacks for everything. I evaluated the options and picked a different one: LXC containers scoped by service group, with Docker Compose running inside them.

The tradeoff is explicit in the architecture docs. More operational overhead at the container layer, paid once on creation. The gain is process namespace isolation between unrelated services - if the game server container goes sideways, it can't touch monitoring. A compromised service is structurally bounded, not just policy-bounded. The Bash provisioning scripts - one per container, all idempotent - are the answer to the overhead question: setting up a container is a single command.

Cross-container file sharing uses Linux UID/GID idmap at the LXC layer rather than NFS. The media stack containers (downloader, organizer, media server) all map to a shared GID on the host, giving them read/write access to the same data disk without a network filesystem or another service to maintain. Hardlinks work across container boundaries because everything comes from the same host filesystem - qBittorrent can seed while the file is already in Jellyfin's library, no duplication.

## The permission model

One user per service, one shared group per thing worth sharing. The downloader and the organizer both write to the media library, but neither can read the other's config. The media server reads every file and changes none. Nothing runs as root without a documented reason.

Some services hardcode their UIDs internally and ignore `PUID`/`PGID` env vars. These are documented exceptions with noted workarounds, not ignored edge cases.

## Network: nothing open to the internet

Traefik v3 handles all internal HTTPS with a wildcard cert for `*.home.prsgoo.com` issued via DNS-01 ACME against Cloudflare. No ports 80 or 443 exposed to the public internet - certs are issued and renewed through DNS validation only. Services expose Traefik labels in their compose files; routes are dynamic.

Three middleware tiers: `admin-only` (Tailscale IP allowlist, management UIs), `streaming-shared` (Jellyfin for non-admin Tailscale devices), `minecraft-shared` (game panel for game server users). The same reverse proxy enforces all three.

Access goes through two independent layers. Tailscale ACLs control which ports a device can reach at the network level. Traefik's IP allowlist middleware controls which services are visible at the application level. Both together - ACLs alone can't distinguish between services sharing port 443.

Tailscale is installed on a subset of containers. The management container advertises the LAN subnet as a route, making all internal services reachable over VPN without per-service port exposure.

Pi-hole handles DNS and ad blocking across the network. Unbound runs behind it as a recursive resolver with no upstream forwarder, plus a local zone override that resolves `*.home.prsgoo.com` internally. Tailscale clients use Pi-hole as their DNS server, so ad blocking and local resolution follow you over VPN too.

## Observability

Prometheus scrapes pve-exporter (Proxmox cluster metrics), node-exporter on every container, and ultrafeeder for ADS-B data. 30-day retention. Grafana for dashboards, Uptime Kuma for uptime monitoring and a status page.

The intent: know something is unhappy before noticing it yourself.

## Operations

Stack management goes through Komodo, an API-driven stack manager. Komodo reads compose files directly from disk at deploy time. The repo is the source of truth; Komodo is the executor. Deploying a change is a pull-and-restart through the API, not an SSH session.

Container provisioning is one idempotent Bash script per container - group and user creation, bind mounts, idmap patching, Periphery agent install - with a shared `common.sh` helper library. Re-running any script produces the same result. That property has mattered.

The disaster recovery procedure covers the full rebuild in documented phases: Proxmox reinstall, storage remount, container recreation, service restoration. The assumption is the data disk survives; the OS disk is treated as throwaway. Estimated time from bare hardware: 3-4 hours, mostly waiting for downloads and service startup. I've had to follow parts of it, which is how I know the estimate is accurate and the procedure actually works.

## What's not here

Single-node, so no automated backups - there's nowhere to ship them that isn't also at risk. No Kubernetes - the operational surface area isn't justified at this scale. No ZFS - the memory overhead and complexity don't pay for themselves on a single node.

Same instinct I bring to code: constraints are design inputs, not failures. Write down what you decided and why.
