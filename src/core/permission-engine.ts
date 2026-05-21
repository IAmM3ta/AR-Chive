// AR-Chive Permission Engine
// Evaluates AccessPolicy + social/claim relationships + spatial resolution gate

import { ArchiveEntry, AccessPolicy, Anchor, VisibilityResult } from './types';

export interface UserContext {
  userId: string;
  friendships: string[]; // array of friend userIds
  groupMemberships: string[];
  activeClaims: string[]; // e.g. ['airbnb:listing123:guest']
}

export interface ResolutionProof {
  anchorId: string;
  pose: { position: [number, number, number]; rotation: [number, number, number] };
  confidence: number; // 0-1 from NFT match or SLAM
  timestamp: string;
}

/**
 * Core visibility check. Called both server-side (coarse) and client-side (at resolution).
 * Spatial resolution is mandatory for 'resolved' state.
 */
export function evaluateVisibility(
  entry: ArchiveEntry,
  user: UserContext,
  currentGeo?: { lat: number; lon: number },
  resolution?: ResolutionProof
): VisibilityResult {
  const policy = entry.accessPolicy;

  // 1. Geo constraint (coarse filter)
  if (policy.geoConstraint && currentGeo) {
    const dist = haversineDistance(currentGeo, policy.geoConstraint);
    if (dist > policy.geoConstraint.radiusM) {
      return { canView: false, reason: 'outside_geo_fence', requiresSpatialResolution: false };
    }
  }

  // 2. Social / group / claim check
  const hasSocialAccess =
    (policy.allowedFriends && user.friendships.includes(entry.creatorId)) ||
    (policy.allowedGroups && policy.allowedGroups.some(g => user.groupMemberships.includes(g))) ||
    (policy.allowedClaims && policy.allowedClaims.some(c => user.activeClaims.includes(c)));

  if (!hasSocialAccess && policy.visibility === 'permissioned') {
    return { canView: false, reason: 'no_permission', requiresSpatialResolution: false };
  }

  // 3. Spatial resolution gate (the critical location-bound check)
  if (resolution) {
    const anchorMatch = resolution.anchorId === entry.anchor.data.descriptorsUrl ||
                       resolution.anchorId === entry.anchor.data.mapId;
    const poseValid = resolution.confidence > 0.7; // threshold
    if (!anchorMatch || !poseValid) {
      return { canView: false, reason: 'anchor_resolution_failed', requiresSpatialResolution: true };
    }
    // Success path: allow decryption / render
    return { canView: true, requiresSpatialResolution: false };
  }

  // Pre-resolution: can pre-fetch ciphertext but not decrypt/render
  return { canView: false, reason: 'awaiting_spatial_resolution', requiresSpatialResolution: true };
}

function haversineDistance(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  // Standard haversine implementation (meters)
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const aHar = Math.sin(dLat/2) * Math.sin(dLat/2) +
               Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(aHar), Math.sqrt(1 - aHar));
  return R * c;
}

/**
 * Claim token issuance helper (used by backend or host apps like Airbnb integration)
 * Returns a signed, time-bound claim string.
 */
export function issueClaimToken(
  issuerId: string,
  subjectUserId: string,
  resource: string, // e.g. 'airbnb:listing:abc123'
  expiresInHours = 48
): string {
  const payload = {
    iss: issuerId,
    sub: subjectUserId,
    res: resource,
    exp: Date.now() + expiresInHours * 3600 * 1000,
    iat: Date.now()
  };
  // In production: sign with JWT or capability token (e.g. Macaroon)
  return btoa(JSON.stringify(payload)); // stub
}

/**
 * Validate claim token (client or server)
 */
export function validateClaimToken(token: string, expectedResource?: string): boolean {
  try {
    const p = JSON.parse(atob(token));
    if (expectedResource && p.res !== expectedResource) return false;
    return p.exp > Date.now();
  } catch {
    return false;
  }
}
