---
type: Feature
title: Purpose
description: Live-session file sharing on Cloudflare Workers with Hono + React.
tags: [fullstack, hono, react, cloudflare, files, websocket]
timestamp: 2026-08-16T00:00:00Z
---

# Purpose

**dropafile** is a single-repository fullstack app: React SPA for upload and session UI, Hono Worker for classification and metadata, and a Durable Object (`SessionRoom`) for ephemeral live rooms.

Files are processed in memory on upload. Shared file **metadata** is broadcast over WebSocket; file **bytes** are exchanged peer-to-peer while owners remain connected. Nothing is written to durable storage.
