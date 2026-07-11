---
title: "El homelab"
date: 2026-06-15
summary: Diez contenedores en Proxmox que ejecutan sin ruido mi media, DNS, servidores de juegos y un receptor para rastrear aviones — sostenidos por un esquema de permisos del que estoy curiosamente orgulloso.
type: case-study
tags: [Homelab, Proxmox, Linux, Self-hosting]
draft: false
---

Me autoalojo porque me gusta ser dueño de las cosas de las que dependo. Lo que empezó como "voy a montar solo Jellyfin" son ahora unos diez contenedores de Proxmox haciendo trabajo real: el stack de media, DNS y ad-blocking en toda la red, un par de servidores de juegos para amigos, algo de domótica y — porque por qué no — un receptor que decodifica los transpondedores de los aviones que pasan por encima.

Nada de eso es raro; mucha gente monta el mismo stack. Lo que de verdad me importa es mantenerlo ordenado, y ahí el truco es ser aburrido a propósito. Cada contenedor tiene un ID, y el ID te dice qué es — un rango para infraestructura, uno para IoT y monitorización, uno para media, uno para juegos — y la misma numeración gobierna los IDs de usuario y de grupo. Suena quisquilloso. También significa que nunca tengo que preguntarme dónde va un servicio nuevo a las 11 de la noche cuando algo está ardiendo; la convención ya lo decidió.

## El modelo de permisos del que estoy calladamente orgulloso

Ejecutar los servicios es la parte fácil. Evitar que se pisen entre ellos es la interesante.

La regla es fácil de decir y engorrosa de hacer: un usuario por servicio, un grupo compartido por cada cosa que merezca compartirse. El downloader y el organizer escriben ambos en la biblioteca de media, pero ninguno puede leer la configuración del otro. El media server puede leer todos los archivos y no modificar ninguno. Nada se ejecuta como root sin una muy buena razón.

La parte engorrosa es que son contenedores sin privilegios, así que los IDs de usuario se remapean entre el contenedor y el host — la propiedad tiene que coincidir en ambos lados o las carpetas compartidas simplemente no montan bien. Costó varias tardes y mucho entrecerrar los ojos ante `ls -n` para cuadrarlo. Pero ahora un servicio comprometido, o que simplemente se porta mal, queda acotado por diseño. No tengo que confiar en él; el sistema de archivos desconfía por mí.

## Gestionado como producción

El resto es tratar un hobby como si fuera producción porque, sinceramente, es más divertido así. El acceso pasa por una VPN y un túnel en lugar de puertos abiertos. Grafana y Prometheus me avisan cuando algo no va bien. Y todo está documentado — inventario, estándares y un runbook de recuperación ante desastres que de verdad he tenido que seguir, porque un contenedor murió una vez y los pasos para reconstruirlo estaban en papel y no en mi cabeza.

El mismo instinto que llevo al código: convenciones, mínimo privilegio, dejarlo por escrito. El homelab es simplemente donde puedo hacerlo por diversión.
