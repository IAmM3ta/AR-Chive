// AR-Chive Core Types
// Permissioned spatial archive primitives

export interface GeoPoint {
  lat: number;
  lon: number;
  accuracyM?: number;
}

export type AnchorType = 'image_nft' | 'persistent_map' | 'hybrid' | 'coarse_geo';

export interface Anchor {
  type: AnchorType;
  data: {
    descriptorsUrl?: string;      // pre-generated NFT bundle URL
    mapId?: string;               // shared SLAM map identifier
    geo?: GeoPoint & { radiusM?: number };
    physicalDimensionsM?: { width: number; height: number };
  };
  localTransform?: {
    position: [number, number, number]; // x, y, z relative to anchor
    rotation: [number, number, number]; // Euler or quaternion
    scale: number;
  };
}

export interface AccessPolicy {
  visibility: 'public' | 'permissioned';
  allowedFriends?: boolean;
  allowedGroups?: string[];
  allowedClaims?: string[]; // e.g. ['airbnb_booking:listing123']
  geoConstraint?: GeoPoint & { radiusM: number };
}

export interface ArchiveEntry {
  id: string;
  creatorId: string;
  title: string;
  description?: string;
  recordedAt: string; // ISO
  videoCiphertextUrl: string;
  anchor: Anchor;
  accessPolicy: AccessPolicy;
  provenance: {
    createdOffline: boolean;
    originalDropTimestamp: string;
    signature?: string; // local signature for offline integrity
  };
  lifecycle: 'local_draft' | 'pending_sync' | 'canonical' | 'pre_cached' | 'resolved';
}

// Permission evaluation result
export interface VisibilityResult {
  canView: boolean;
  reason?: string;
  requiresSpatialResolution: boolean;
}

// For service integration (FloatMaps, etc.)
export interface AttachToPOIRequest {
  poiId: string; // e.g. FloatMaps trail segment or hazard ID
  entry: Omit<ArchiveEntry, 'id' | 'lifecycle'>;
}
