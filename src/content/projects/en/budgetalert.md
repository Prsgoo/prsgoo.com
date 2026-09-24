---
title: BudgetAlert
description: Event-driven budget alerting REST API built on .NET Clean Architecture
date: 2026-09-24
tags: [C#, .NET, Clean Architecture, RabbitMQ, Docker, EF Core]
repo: https://github.com/Prsgoo/BudgetAlert
featured: true
order: 1
---

BudgetAlert is a REST API for defining budgets and alert rules. When transactions are registered, domain events are published to RabbitMQ and consumed asynchronously by a .NET Worker Service that evaluates rules and triggers alerts.

Built with Clean Architecture (Domain / Application / Infrastructure / API) and CQRS via MediatR - commands and queries are separated, with pipeline behaviors handling logging and validation cross-cutting concerns. EF Core handles persistence with SQL Server and code-first migrations.

The full stack runs locally via Docker Compose (API + Worker + SQL Server + RabbitMQ). GitHub Actions handles CI (build + test on PR) and CD (Docker image push to GHCR on tag). No cloud services required.
