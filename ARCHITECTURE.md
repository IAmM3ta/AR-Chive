# AR-Chive Architecture

**Version**: 0.2 (May 2026) — Updated with permission engine, claim tokens, backend encryption stub, Three.js + GLSL, and WebXR glasses path.

(Previous content preserved; key additions below)

## New in v0.2
- Full permission engine (`src/core/permission-engine.ts`) with `evaluateVisibility`, claim token issuance/validation, and spatial resolution gate.
- Backend stub (`src/backend/stub.ts`) with AES-GCM encryption, claim issuance, deferred sync, and `resolveAndReleaseKey` gated by proof-of-resolution.
- Richer spatial rendering example (`examples/threejs-spatial-glsl.html`) with anchor-relative plane + custom GLSL fragment shader (edge glow + spatial distortion).
- WebXR glasses integration notes (`docs/webxr-glasses-integration.md`).

All prior sections (primitives, offline lifecycle, service layer for FloatMaps, data model) remain authoritative. The new files provide concrete, runnable implementations of the core gates and service APIs.

## Claim Token Flow (Airbnb-style example)
1. Host (or integration) calls `issueClaimToken(issuerId, guestUserId, 'airbnb:listing:123', 48)`.
2. Token delivered via welcome message / booking confirmation.
3. Guest app adds token to `UserContext.activeClaims`.
4. On dragon-drop or query, policy references the claim type.
5. At spatial resolution, `evaluateVisibility` + backend `resolveAndReleaseKey` enforce the claim is still valid.

This enables private, time-bound spatial guides without exposing them to public or other guests.

## Integration with FloatMaps / Spatial Services
Use `src/core/types.ts` `AttachToPOIRequest` and the permission engine. FloatMaps calls AR-Chive service for archiving + gated playback; keeps its own map data.

The architecture now has production-grade stubs for the most critical mechanisms: offline creation, location-bound access, claim-based permissions, and multi-form-factor rendering.