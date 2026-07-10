---
title: "PulseBridge, or how I avoided writing the same adapter twelve times"
date: 2026-06-29
summary: A world-monitor side project that became a plugin runtime for Node.js, because I got bored of copy-pasting the boring parts.
type: case-study
tags: [TypeScript, Node.js, Architecture, PulseBridge]
draft: false
---

It started as a "world monitor" — one screen showing me the state of the planet from a pile of public APIs. Weather, crypto, markets, earthquakes, air quality, the news, space weather, whatever CVEs dropped that morning. A fun little dashboard.

The plan was the obvious one: write an adapter for each API, drop them into the app, done. I wrote two and stopped.

Not because it was hard — because it was repetitive in a way that bugged me. Every adapter did the same chores around a few lines of real logic: schedule the fetch, keep an API key somewhere, back off politely when the API said to slow down, stash the last response, hand it to the UI. The data was maybe a tenth of each file. The rest was plumbing I'd be pasting a dozen times and then maintaining a dozen times — exactly the kind of future work I try to design out of existence.

So I put the dashboard down and built the part I didn't want to repeat.

## One contract, three ways in

PulseBridge is a library, not a server. You start it once and it runs quietly in the background, scheduling work and reacting to it. A plugin is a plain object — no base class to extend, no decorators, nothing clever. It declares what it needs in a manifest and implements how to fetch; whatever it returns comes out the far side as one shape, a `PulseRecord<T>`, so nothing downstream has to know which API it came from.

The bit I'm happiest with: a single plugin contract handles three genuinely different ways of talking to a system. The scheduler **polls** it on an interval. An external service can **push in** through a webhook. The host can fire an **action** on demand. Same manifest, same secret handling, same error model for all three. Processors sit downstream and fold raw records into the views the UI reads — and reading a view never touches a live API, it's always the stored copy.

## The unglamorous parts I cared about most

Anyone can wire up a `fetch()`. The reason I'm proud of this one is the stuff that never shows up in a demo.

Secrets don't float around loose. The core encrypts them at rest and hands each plugin a read-only view of _only_ the keys it declared — ask for one you didn't, and you get an exception, not the value. It deliberately never reads `process.env`, so nothing wanders in by accident.

Failure is a design input, not an edge case. Errors are typed, so the runtime can tell "your key is wrong" (stop) from "slow down" (wait exactly as long as the API asked) from "something unexpected broke" (back off, and eventually give up if it's clearly dead). One flaky integration degrades itself and leaves the rest running.

And since a webhook is the one door that opens onto the public internet, plugins receive the raw request bytes and verify the signature themselves before trusting a single field.

## Where it landed

The official plugins turned out to be the exact world monitor I set out to build — OpenWeather, CoinGecko, Finnhub, USGS, NASA, and the rest. Except adding the next source isn't a project anymore; it's an afternoon and one interface. Which was the whole point. Build the manager once, and the adapters get to stay boring.
