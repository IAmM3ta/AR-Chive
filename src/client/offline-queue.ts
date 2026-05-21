// Offline Queue & Deferred Sync for AR-Chive
// Handles dragon-drop creation while disconnected

import { ArchiveEntry, Anchor } from '../core/types';

interface PendingEntry extends Partial<ArchiveEntry> {
  localId: string;
  rawVideoBlob?: Blob;
  capturedAnchorContext: Anchor;
  policy: AccessPolicy;
}

class OfflineQueue {
  private queue: PendingEntry[] = [];
  private dbName = 'ar-chive-offline';

  async enqueueDragonDrop(videoBlob: Blob, anchor: Anchor, policy: AccessPolicy): Promise<string> {
    const localId = crypto.randomUUID();
    const pending: PendingEntry = {
      localId,
      rawVideoBlob: videoBlob,
      capturedAnchorContext: anchor,
      policy,
      provenance: {
        createdOffline: true,
        originalDropTimestamp: new Date().toISOString()
      },
      lifecycle: 'local_draft'
    };
    this.queue.push(pending);
    await this.persistToIndexedDB(pending);
    return localId;
  }

  async syncWhenOnline(): Promise<void> {
    // Background worker / connectivity listener
    // 1. Upload rawVideoBlob + anchor data to backend
    // 2. Receive canonical ID and ciphertext URL
    // 3. Update local state to 'canonical'
    // 4. Notify recipients via push or polling
    console.log('Sync worker stub: implement upload + encryption');
  }

  private async persistToIndexedDB(entry: PendingEntry): Promise<void> {
    // IndexedDB or SQLite via Capacitor plugin
    console.log('Persisting pending entry', entry.localId);
  }

  // Additional methods: getPending, remove, retryFailed
}

export const offlineQueue = new OfflineQueue();
