import { get, set, del, createStore } from 'idb-keyval';
import type { SyncQueueEntry } from '@/types/auth';

/**
 * Offline Sync Queue — backed by IndexedDB via idb-keyval.
 *
 * Why IndexedDB instead of localStorage?
 *   - localStorage is capped at ~5 MB and is synchronous (blocks the main thread).
 *   - IndexedDB is async, supports much larger payloads, and is more resilient
 *     to abrupt tab/browser crashes during offline transitions.
 *
 * Data model: a single IndexedDB key `pcs-sync-queue` stores the full array
 * of pending SyncQueueEntry objects. The array is small in practice (dozens of
 * entries at most) so a single key is fine. For very high-volume apps you would
 * use a cursor-based approach instead.
 */

const QUEUE_KEY = 'pcs-sync-queue';
const syncStore = createStore('pcs-sync-db', 'sync-queue-store');

/** Read the full queue from IndexedDB. Returns an empty array if nothing is stored. */
async function readQueue(): Promise<SyncQueueEntry[]> {
  const stored = await get<SyncQueueEntry[]>(QUEUE_KEY, syncStore);
  return stored ?? [];
}

/** Persist the full queue back to IndexedDB. */
async function writeQueue(entries: SyncQueueEntry[]): Promise<void> {
  await set(QUEUE_KEY, entries, syncStore);
}

/** Add a new action to the end of the queue. */
export async function enqueueAction(
  entry: Omit<SyncQueueEntry, 'retryCount'>,
): Promise<void> {
  const queue = await readQueue();
  queue.push({ ...entry, retryCount: 0 });
  await writeQueue(queue);
}

/** Return the current queue without modifying it. */
export async function peekQueue(): Promise<SyncQueueEntry[]> {
  return readQueue();
}

/** Remove a specific entry by ID after it has been successfully synced. */
export async function removeEntry(id: string): Promise<void> {
  const queue = await readQueue();
  await writeQueue(queue.filter((e) => e.id !== id));
}

/** Increment the retry counter for a specific entry. */
export async function incrementRetry(id: string): Promise<void> {
  const queue = await readQueue();
  const updated = queue.map((e) =>
    e.id === id ? { ...e, retryCount: e.retryCount + 1 } : e,
  );
  await writeQueue(updated);
}

/** Wipe the entire queue (used after a successful full-sync migration). */
export async function clearQueue(): Promise<void> {
  await del(QUEUE_KEY, syncStore);
}

/** Max retries before an entry is treated as a dead-letter and dropped. */
export const MAX_RETRY_COUNT = 5;
