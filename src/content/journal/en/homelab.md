---
title: "The homelab"
date: 2026-06-15
summary: Ten containers on Proxmox quietly running my media, DNS, game servers, and a plane-spotting receiver — held together by a permission scheme I'm oddly proud of.
type: case-study
tags: [Homelab, Proxmox, Linux, Self-hosting]
draft: false
---

I self-host because I like owning the things I depend on. What began as "I'll just run Jellyfin" is now about ten Proxmox containers doing real work: the media stack, network-wide DNS and ad-blocking, a couple of game servers for friends, some home automation, and — because why not — a receiver that decodes the transponders of planes passing overhead.

None of that is unusual; plenty of people run the same stack. What I actually care about is keeping it tidy, and there the trick is to be boring on purpose. Every container has an ID, and the ID tells you what it is — one range for infrastructure, one for IoT and monitoring, one for media, one for games — and the same numbering drives the user and group IDs. It sounds fussy. It also means I never have to wonder where a new service belongs at 11pm when something's on fire; the convention already decided.

## The permission model I'm quietly proud of

Running the services is the easy part. Keeping them from stepping on each other is the interesting one.

The rule is simple to say and fiddly to do: one user per service, one shared group per thing worth sharing. The downloader and the organizer both write to the media library, but neither can read the other's config. The media server can read every file and change none of them. Nothing runs as root without a very good reason.

The fiddly bit is that these are unprivileged containers, so the user IDs get remapped between the container and the host — ownership has to agree on both sides or the shared folders simply don't mount right. It took a few evenings and a lot of squinting at `ls -n` to line up. But now a service that gets popped, or just misbehaves, is boxed in by design. I don't have to trust it; the filesystem distrusts it for me.

## Run like production

The rest is treating a hobby like production because, honestly, it's more fun that way. Access goes through a VPN and a tunnel instead of open ports. Grafana and Prometheus tell me when something's unhappy. And the whole thing is written down — inventory, standards, and a disaster-recovery runbook I've genuinely had to follow, because a container did die once and the steps to rebuild it were on paper instead of in my head.

Same instinct I bring to code: conventions, least privilege, write it down. The homelab is just where I get to do it for fun.
