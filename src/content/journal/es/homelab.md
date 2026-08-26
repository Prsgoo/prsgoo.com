---
title: "El homelab"
date: 2026-06-15
summary: "Infraestructura self-hosted de grado producción en Proxmox VE 8 - construida sobre cuatro principios: aislamiento de fallos, reproducibilidad, seguridad por defecto y mantenibilidad."
type: case-study
tags: [Homelab, Proxmox, Linux, Docker, Traefik, Tailscale]
draft: false
---

Me autoalojo porque me gusta ser dueño de las cosas de las que dependo. Lo que empezó como "voy a montar solo Jellyfin" es ahora un conjunto de contenedores LXC en Proxmox haciendo trabajo real: media, DNS y ad-blocking en toda la red, un reverse proxy que gestiona todo el HTTPS interno, servidores de juegos, domótica, monitorización y un receptor de aviones porque por qué no.

El objetivo desde el principio era tratarlo como producción. No porque tenga que hacerlo, sino porque la disciplina es útil y las restricciones son interesantes. Cuatro principios guían cada decisión: **aislamiento de fallos** (un servicio con mal comportamiento no debería afectar a los demás), **reproducibilidad** (reconstruir desde cero con el repo y los procedimientos documentados), **seguridad por defecto** (nada expuesto a internet sin una razón explícita), **mantenibilidad** (cambios en git, no haciendo clic por interfaces).

## Por qué LXC en lugar de un único Docker host

El camino obvio es una VM grande con stacks de Docker Compose para todo. Evalué las opciones y elegí una diferente: contenedores LXC acotados por grupo de servicios, con Docker Compose ejecutándose dentro de ellos.

El tradeoff está documentado explícitamente. Más overhead operativo en la capa de contenedores, pagado una vez en la creación. La ganancia es el aislamiento de namespaces de procesos entre servicios no relacionados - si el contenedor de servidores de juegos se descontrola, no puede tocar la monitorización. Un servicio comprometido está acotado estructuralmente, no solo por política. Los scripts Bash de provisionamiento - uno por contenedor, todos idempotentes - son la respuesta al problema del overhead: levantar un contenedor es un único comando.

El almacenamiento compartido entre contenedores usa idmap UID/GID de Linux en la capa LXC en lugar de NFS. Los contenedores del stack de media (downloader, organizer, media server) mapean todos a un GID compartido en el host, dando acceso de lectura/escritura al mismo disco de datos sin sistema de archivos en red ni otro servicio que mantener. Los hardlinks funcionan entre contenedores porque todo viene del mismo sistema de archivos del host - qBittorrent puede seguir seeding mientras el archivo ya está en la biblioteca de Jellyfin, sin duplicación.

## El modelo de permisos

Un usuario por servicio, un grupo compartido por cada cosa que merezca compartirse. El downloader y el organizer escriben ambos en la biblioteca de media, pero ninguno puede leer la configuración del otro. El media server lee todos los archivos y no modifica ninguno. Nada se ejecuta como root sin una razón documentada.

Algunos servicios tienen los UIDs hardcodeados internamente e ignoran las variables `PUID`/`PGID`. Son excepciones documentadas con sus soluciones, no casos límite ignorados.

## Red: nada expuesto a internet

Traefik v3 gestiona todo el HTTPS interno con un certificado wildcard para `*.home.prsgoo.com` emitido mediante DNS-01 ACME contra Cloudflare. Sin puertos 80 ni 443 expuestos a la internet pública - los certificados se emiten y renuevan solo mediante validación DNS. Los servicios exponen etiquetas de Traefik en sus compose files; las rutas son dinámicas.

Tres niveles de middleware: `admin-only` (allowlist de IPs de Tailscale, UIs de gestión), `streaming-shared` (Jellyfin para dispositivos Tailscale no admin), `minecraft-shared` (panel de juegos para usuarios de servidores de juego). El mismo reverse proxy gestiona los tres.

El acceso pasa por dos capas independientes. Las ACLs de Tailscale controlan a qué puertos puede llegar un dispositivo a nivel de red. El middleware IP allowlist de Traefik controla qué servicios son visibles a nivel de aplicación. Ambas juntas - las ACLs solas no distinguen entre servicios que comparten el puerto 443.

Tailscale está instalado en un subconjunto de contenedores. El contenedor de gestión anuncia la subred LAN como ruta de Tailscale, haciendo accesibles todos los servicios internos por VPN sin exponer puertos por servicio.

Pi-hole gestiona DNS y ad-blocking en toda la red. Unbound corre detrás como resolver recursivo sin forwarder upstream, más una zona local override que resuelve `*.home.prsgoo.com` internamente. Los clientes de Tailscale usan Pi-hole como DNS, así que el ad-blocking y la resolución local te siguen también por VPN.

## Observabilidad

Prometheus hace scraping de pve-exporter (métricas del cluster de Proxmox), node-exporter en cada contenedor, y ultrafeeder para datos ADS-B. Retención de 30 días. Grafana para dashboards, Uptime Kuma para monitorización de uptime y una página de estado.

El objetivo: saber que algo va mal antes de notarlo tú mismo.

## Operaciones

La gestión de stacks va a través de Komodo, un gestor orientado a API. Komodo lee los compose files directamente desde disco en el momento del despliegue. El repo es la fuente de verdad; Komodo es el ejecutor. Desplegar un cambio es un pull-and-restart a través de la API, no una sesión SSH.

El provisionamiento de contenedores es un script Bash idempotente por contenedor - creación de grupos y usuarios, bind mounts, idmap patching, instalación del agente Periphery - con una librería de helpers compartidos `common.sh`. Volver a ejecutar cualquier script produce el mismo resultado. Esa propiedad ha importado.

El procedimiento de recuperación ante desastres cubre la reconstrucción completa en fases documentadas: reinstalación de Proxmox, remontaje del almacenamiento, recreación de contenedores, restauración de servicios. La premisa es que el disco de datos sobrevive; el disco del SO se trata como desechable. Tiempo estimado desde hardware limpio: 3-4 horas, mayormente esperando descargas y arranque de servicios. He tenido que seguir partes de él, que es cómo sé que la estimación es correcta y el procedimiento funciona de verdad.

## Lo que no está aquí

Nodo único, así que sin backups automatizados - no hay a dónde enviarlos que no esté también en riesgo. Sin Kubernetes - la superficie operativa no se justifica a esta escala. Sin ZFS - el overhead de memoria y la complejidad no compensan en un nodo único.

El mismo instinto que llevo al código: las restricciones son inputs de diseño, no fracasos. Escribe lo que decidiste y por qué.
