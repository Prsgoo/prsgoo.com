---
title: Homelab
description: Production-grade self-hosted infrastructure on Proxmox VE 8
date: 2026-06-15
order: 1
tags: [Proxmox VE, Linux, Docker, Traefik]
featured: true
repo: https://github.com/Prsgoo/homelab
url: https://homelab.prsgoo.com
caseStudy: homelab
---

Designed and maintain a self-hosted infrastructure on Proxmox VE 8, operated as a production environment. 11 LXC containers (Debian 13) scoped by service group with separate namespaces and resource limits - a deliberate isolation choice over a single Docker host.

Services run as 14 Docker Compose stacks managed via Komodo (API-driven, repo as source of truth). Infrastructure highlights:

- **Reverse proxy**: Traefik v3 with wildcard TLS via DNS-01 ACME (Cloudflare) - no port forwarding, three access tiers enforced via IP allowlist middleware
- **Observability**: Prometheus (pve-exporter + node-exporter on every container + ADS-B metrics), Grafana dashboards, Uptime Kuma
- **DNS**: Pi-hole ad blocking + Unbound recursive resolver with local zone override; Tailscale clients use Pi-hole as DNS
- **VPN**: Tailscale on 4 containers; management container advertises the LAN subnet as a route
- **IoT**: Homebridge (HomeKit bridge), Zigbee2MQTT + Mosquitto (Zigbee via MQTT), USB passthrough via udev (SiLabs CP210x Zigbee coordinator)
- **Storage**: LXC UID/GID idmap for cross-container shared storage - no NFS
- **Provisioning**: 12 idempotent Bash scripts (one per LXC) with a shared `common.sh` helper library
- **Disaster recovery**: documented 10-phase rebuild procedure, estimated 3-4 hours from bare hardware
