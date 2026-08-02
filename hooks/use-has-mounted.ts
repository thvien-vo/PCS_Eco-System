'use client';

import { useState, useEffect } from 'react';

/**
 * useHasMounted — hydration guard hook.
 *
 * Returns `false` on the server and on the first client render,
 * then flips to `true` after mount. Use this to gate any UI that
 * reads from Zustand `persist` stores to prevent SSR mismatches.
 *
 * Usage:
 *   const hasMounted = useHasMounted();
 *   if (!hasMounted) return <LoadingSkeleton type="card" />;
 *
 * Per pcs-tech-standards §10 — App Router Safeguard (a).
 */
export function useHasMounted(): boolean {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}
