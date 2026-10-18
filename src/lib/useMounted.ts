import { useSyncExternalStore } from 'react';

function emptySubscribe() {
  return () => {};
}

/**
 * Idiomatic React 18/19 hook to detect client mounting without cascading setState in useEffect.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
