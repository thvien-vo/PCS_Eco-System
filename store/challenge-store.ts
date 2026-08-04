/**
 * challenge-store.ts — Module 5 Zustand store (ephemeral, no persist).
 *
 * Tracks which challenge IDs have been confirmed by the user.
 * Intentionally NOT persisted: the swipe queue resets on each session
 * so the demo always starts fresh. If persistence is needed in future,
 * add the `persist` middleware + `skipHydration: true` pattern.
 *
 * Per pcs-tech-standards §2 (strict TypeScript) and §10 (hydration guard).
 */

import { create } from 'zustand';

interface ChallengeState {
  /** IDs of challenges the user has confirmed into "in-progress". */
  inProgressIds: string[];
  /**
   * Idempotent: does nothing if the ID is already present.
   * Guards against double-adding the same challenge.
   */
  addToInProgress: (id: string) => void;
}

export const useChallengeStore = create<ChallengeState>()((set, get) => ({
  inProgressIds: [],

  addToInProgress: (id) => {
    // DUPLICATE-ADD GUARD: never push the same id twice.
    if (get().inProgressIds.includes(id)) return;
    set((state) => ({ inProgressIds: [...state.inProgressIds, id] }));
  },
}));
