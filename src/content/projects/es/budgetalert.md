---
title: BudgetAlert
description: API REST de alertas de presupuesto orientada a eventos, construida con Clean Architecture en .NET
date: 2026-09-24
tags: [C#, .NET, Clean Architecture, RabbitMQ, Docker, EF Core]
repo: https://github.com/Prsgoo/BudgetAlert
featured: true
order: 1
---

BudgetAlert es una API REST para definir presupuestos y reglas de alertas. Cuando se registran transacciones, se publican eventos de dominio en RabbitMQ y un .NET Worker Service los consume de forma asíncrona, evaluando reglas y disparando alertas.

Construido con Clean Architecture (Domain / Application / Infrastructure / API) y CQRS mediante MediatR - comandos y queries separados, con pipeline behaviors para logging y validación como aspectos transversales. EF Core gestiona la persistencia con SQL Server y migraciones code-first.

El stack completo corre localmente con Docker Compose (API + Worker + SQL Server + RabbitMQ). GitHub Actions maneja CI (build + tests en PR) y CD (push de imagen Docker a GHCR al crear un tag). Sin servicios cloud requeridos.
