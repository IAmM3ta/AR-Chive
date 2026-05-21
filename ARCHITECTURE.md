# AR-Chive Architecture

**Version**: 0.1 (May 2026)
**Status**: Foundational design. Implementation in progress.

## 1. Primitives (First Principles)

AR-Chive treats physical space as a permissioned, distributed archive substrate. Retrieval is gated by successful spatial anchor resolution + social/claim relationship.

### Core Primitives
- **Anchor**: Spatial reference that can be resolved in the real world.
  - Types: Image/NFT (feature descriptors), PersistentMap (SLAM relocalization), Hybrid (geo + visual), CoarseGeo.
  - Resolution yields 6DoF pose in anchor frame.
- **ArchiveEntry**: Self-contained record (video + metadata + anchor + access_policy + provenance).
- **Permission / Claim**: Social graph edge or capability token that grants visibility.
- **Spatial Resolution Gate**: Client-side (and optionally server-attested) check that the device has recovered the expected pose before releasing decryption material or rendering content.
- **Offline Queue**: Local pending state machine for creation while disconnected.

## 2. Data Model (Core)

```typescript
interface Anchor {
  type: 'image' | 'persistent_map' | 'hybrid' | 'geo';
  data: {
    descriptorsPath?: string; // NFT bundle
    mapId?: string;             // shared SLAM map
    geo?: { lat: number; lon: number; radiusM?: number };
    physicalScale?: { widthM: number; heightM: number };
  };
  localTransform?: { position: [number,number,number]; rotation: [number,number,number]; scale: number };
}

interface AccessPolicy {
  visibility: 'public' | 'permissioned';
  allowed: {
    friends?: boolean;
    groups?: string[];
    claims?: string[]; // token IDs or types
  };
  geoConstraint?: { lat: number; lon: number; radiusM: number };
}

interface ArchiveEntry {
  id: string;
  creatorId: string;
  title: string;
  description?: string;
  recordedAt: string;
  videoUrl: string;           // ciphertext or reference
  anchor: Anchor;
  accessPolicy: AccessPolicy;
  provenance: { createdOffline: boolean; originalTimestamp: string; signature?: string };
  lifecycleState: 'local_draft' | 'pending_sync' | 'canonical' | 'pre_cached' | 'resolved';
}
```

## 3. Offline Lifecycle & Dragon-Drop

Creation while offline enqueues a local ArchiveEntry (raw video + captured anchor context + policy).

On connectivity:
1. Background worker uploads assets.
2. Backend normalizes to canonical entry.
3. Recipients with permission pre-fetch ciphertext opportunistically (geo + friendship filter).

Decryption/rendering only after live anchor resolution on recipient device.

State machine: local_draft → pending_sync → canonical → pre_cached_encrypted → resolved (decrypted + rendered).

## 4. Permission & Visibility Resolution

Server evaluates:
- Geo proximity (coarse filter)
- Social relationship (friendship graph or group membership)
- Valid claim token (e.g., Airbnb booking claim)

Client re-validates at resolution time + proves anchor match before key release.

Pseudocode:
```
function canView(entry, user, currentGeo, resolvedAnchor) {
  if (!geoIntersects(entry, currentGeo)) return false;
  if (!hasRelationship(entry.accessPolicy, user)) return false;
  if (!hasValidClaim(entry, user)) return false;
  if (!resolvedAnchorMatches(entry.anchor, resolvedAnchor)) return false;
  return true;
}
```

## 5. Location-Bound Decryption Gate

Even with pre-cached ciphertext, rendering requires:
- Successful NFT match or SLAM relocalization yielding pose within tolerance.
- Optional server attestation of resolution proof.
- Key material released only then.

This binds content to physical presence, preventing remote viewing or spoofing.

## 6. Service Layer for FloatMaps & Other Spatial Projects

AR-Chive is intentionally a **service**, not a standalone app.

FloatMaps (or OPEV mapping, trail systems) can:
- Attach AR video warnings/hazard logs/race recaps to trail segments or POIs via API.
- Query visible archives for a rider’s context (current location + user identity + friendships).
- Resolve anchors in their own map view or delegate to AR-Chive client component.

Example integration endpoints (REST/GraphQL):
- POST /entries (with trailId or poiId, video, anchor, policy)
- GET /entries/for-poi?poiId=...&userId=... (returns permissioned entries)
- POST /resolve (proof of anchor match → key or decrypted stream)

Adapters in `integrations/floatmaps-adapter.ts` demonstrate consumption.

This allows FloatMaps to surface AR content without owning the full permission, offline, or encryption logic.

## 7. AR Runtime Abstraction (Glasses Forward)

- Today: MindAR.js / AR.js NFT + Three.js or ARCore/ARKit via Unity AR Foundation.
- Tomorrow: WebXR or native glasses SLAM + shared persistent maps.
- Content described as anchor-relative transforms + media URLs + interaction affordances.
- Same ArchiveEntry renders on phone camera or glasses passthrough.

## 8. Security & Privacy Properties
- Creator controls access via social graph + claims.
- Physical co-location is required for decryption.
- Offline creation minimizes real-time exposure.
- Pre-fetch is permission-scoped.
- Self-hostable backend (MinIO + Postgres + worker).

## 9. Implementation Roadmap
Phase 0: Core types + offline queue + basic MindAR demo.
Phase 1: Permission engine + background sync + pre-fetch.
Phase 2: Persistent map anchors + claim tokens + FloatMaps adapter.
Phase 3: Glasses abstraction + richer spatial content (3D labels, interactions).

See `src/core/` and examples for current implementation state.
