# AR-Chive

**Permissioned spatial AR video archive and messaging service.**

AR-Chive (AR + Chive → ARCHIVE) is an open-source, modular system for creating, sharing, and retrieving location-bound video messages and spatial guides. It combines natural feature tracking or persistent SLAM anchors with social/claim-based permissions and offline-first operation.

Core innovation: Content is cryptographically and spatially gated — recipients can pre-download encrypted payloads, but decryption and rendering only occur when the device successfully resolves the original physical anchor in the real world.

Designed as a **composable service layer** that existing spatial platforms (FloatMaps, OPEV mapping, trail systems, indoor guides) can consume via clean APIs. Forward-compatible with upcoming consumer AR glasses.

## Key Features
- Image/NFT + persistent map + hybrid anchors
- Offline creation (dragon-drop) with deferred sync
- Friendship, group, and capability-claim permissions (Airbnb-style guest access)
- Location-bound decryption gate (physical presence required)
- Background pre-fetch of encrypted content
- Modular AR runtime (phone camera today, glasses tomorrow)
- Service-oriented APIs for integration with mapping/hazard/trail platforms

## Quick Start (Prototype)

See `examples/mindar-basic.html` for a minimal runnable demo of anchor + video overlay (expand to full offline + permissions).

## Repository Structure
- `src/core/` — Shared types, permission engine, anchor abstractions
- `src/client/` — PWA / offline queue / AR runtime examples (MindAR + Three.js starter)
- `src/backend/` — API stubs, sync worker, storage
- `integrations/` — Adapters for FloatMaps and similar spatial services
- `docs/` — Architecture, specs, threat model

## Philosophy
- Physical co-location as first-class access primitive
- Owner-centric and privacy-preserving by default
- Reproducible, self-hostable, service-composable
- Built for remote/offline environments (trails, travel, post-disaster)

## Status
Initial architecture and core primitives seeded. Ready for iterative implementation.

License: To be determined (recommend AGPLv3 or MPL-2.0 for service layer).

---

Created as open infrastructure for spatial AR experiences.