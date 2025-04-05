import * as React from 'react'
const { useEffect, useLayoutEffect } = React;
// Removed duplicate import

export function useIsomorphicLayoutEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
) {
  if (typeof window !== "undefined") {
    return useLayoutEffect(effect, deps)
  }
  return useEffect(effect, deps)
}

export { useSubscriptions } from './useSubscriptions'; 