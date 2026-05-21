# AR-Chive Service API (Draft)

AR-Chive exposes a clean service interface so other spatial platforms can delegate AR archiving, permissions, and gated playback.

## Core Endpoints (REST style)

- POST /entries — Create or attach new ArchiveEntry (supports offline provenance)
- GET /entries/nearby?lat=..&lon=..&radius=..&userId=.. — Permission-filtered discovery
- GET /entries/for-poi?poiId=..&userId=.. — Entries attached to external POI (FloatMaps trail, etc.)
- POST /resolve-anchor — Submit proof of resolution → receive key material or stream URL

## Authentication
JWT or capability tokens for users and claims (Airbnb-style).

## Integration Pattern
FloatMaps (or similar) keeps its own map/POI data. It calls AR-Chive for the AR layer only. This separation keeps AR-Chive focused and reusable.
