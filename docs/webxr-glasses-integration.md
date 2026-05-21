# WebXR & Consumer AR Glasses Integration

AR-Chive is designed for graceful evolution from phone-camera AR to lightweight consumer glasses (passthrough or optical see-through).

## Current (Phone) Path
- MindAR.js / AR.js for image tracking
- ARCore/ARKit via Unity AR Foundation or native for persistent maps
- Three.js for richer spatial content + GLSL effects (see examples/threejs-spatial-glsl.html)

## Forward Path (WebXR + Glasses)

WebXR (immersive-ar mode) provides:
- Native device tracking & hit-test
- Anchor creation & persistence (via XRAnchor or hit-test results)
- Shared maps / relocalization on supported devices
- Passthrough camera access for image tracking fallback

### Recommended Abstraction
Keep ArchiveEntry.anchor as the source of truth.
Client runtime (phone or glasses) implements:
- `resolveAnchor(anchor: Anchor): Promise<ResolutionProof>`
- On success, trigger permission re-check + key release

For glasses:
- Use `navigator.xr.requestSession('immersive-ar')`
- Create persistent anchors with `session.createAnchor(...)` or hit-test
- Bind video plane (or 3D labels) to the XRAnchor pose
- GLSL shaders run identically on the WebGL context

### Example WebXR Starter Pattern
```js
async function startGlassesSession() {
  const session = await navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['hit-test', 'anchors'] });
  // On anchor resolution or hit-test result matching entry.anchor
  // Call evaluateVisibility(...) + resolveAndReleaseKey(...)
  // Render video plane attached to XRAnchor
}
```

### Persistent Maps & Cross-Device
Future glasses will support shared spatial maps. AR-Chive ArchiveEntry can reference a `mapId`.
Client relocalizes to the map and resolves localTransform relative to it.

### Interaction Model Evolution
- Phone: touch + screen gestures
- Glasses: gaze + pinch, voice, or controller
- Same ArchiveEntry declares affordances; runtime maps them

This keeps the permission engine, offline queue, and location-gated decryption identical across form factors.
