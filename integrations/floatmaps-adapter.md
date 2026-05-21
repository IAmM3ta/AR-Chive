# FloatMaps Integration Adapter (Conceptual)

AR-Chive is designed to be consumed as a service by FloatMaps.

## How FloatMaps Would Use AR-Chive

1. Rider or system creates a hazard warning or trail log as an ArchiveEntry.
2. Attach to FloatMaps POI (trail segment, hazard point, kiosk) via API.
3. FloatMaps UI surfaces a "View AR Guide" or automatic trigger when rider is near (with permission).
4. AR-Chive handles offline creation on trail, permission checks (friends or public trail alerts), and location-gated playback.

## Example API Calls

```http
POST /api/v1/entries
Content-Type: application/json
{
  "poiId": "floatmaps:trail:segment:12345",
  "title": "Steep descent + loose gravel ahead",
  "videoCiphertextUrl": "...",
  "anchor": { "type": "hybrid", "data": { "geo": {...} } },
  "accessPolicy": { "visibility": "permissioned", "allowedFriends": true }
}

GET /api/v1/entries/for-poi?poiId=floatmaps:trail:segment:12345&userId=friend-uuid
// Returns only permissioned entries for this rider
```

## Benefits to FloatMaps
- No need to implement encryption, offline queue, or social permissions.
- Consistent spatial AR experience across phone and future glasses.
- Riders get contextual video warnings exactly when at the hazard location.

See `src/core/types.ts` for shared interfaces.
