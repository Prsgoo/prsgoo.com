---
title: Homelab
description: Infraestructura self-hosted de grado producción sobre Proxmox VE 8
date: 2026-06-15
order: 1
tags: [Proxmox VE, Linux, Docker, Traefik]
featured: true
repo: https://github.com/Prsgoo/homelab
url: https://homelab.prsgoo.com
caseStudy: homelab
---

Diseñé y mantengo una infraestructura self-hosted sobre Proxmox VE 8, gestionada como un entorno de producción. 11 contenedores LXC (Debian 13) con alcance por grupo de servicios y namespaces separados - una decisión deliberada frente al modelo de un único Docker host.

Los servicios se despliegan como 14 stacks de Docker Compose gestionados vía Komodo (orientado a API, el repo como fuente de verdad). Aspectos destacados:

- **Reverse proxy**: Traefik v3 con TLS wildcard vía DNS-01 ACME (Cloudflare) - sin port forwarding, tres niveles de acceso mediante IP allowlist middleware
- **Observabilidad**: Prometheus (pve-exporter + node-exporter en cada contenedor + métricas ADS-B), dashboards en Grafana, Uptime Kuma
- **DNS**: Pi-hole + Unbound como resolver recursivo con zona local override; los clientes de Tailscale usan Pi-hole como DNS
- **VPN**: Tailscale en 4 contenedores; el contenedor de gestión anuncia la subred LAN como ruta
- **IoT**: Homebridge (bridge HomeKit), Zigbee2MQTT + Mosquitto (Zigbee vía MQTT), passthrough USB vía udev (coordinador Zigbee SiLabs CP210x)
- **Almacenamiento**: idmap UID/GID en LXC para compartir storage entre contenedores - sin NFS
- **Provisionamiento**: 12 scripts Bash idempotentes (uno por LXC) con helpers compartidos en `common.sh`
- **Disaster recovery**: procedimiento documentado en 10 fases, estimado de 3-4 horas desde hardware limpio
