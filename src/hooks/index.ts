import * as React from 'react'
import { 
  useState, 
  useEffect, 
  useRef, 
  useCallback, 
  useLayoutEffect 
} from 'react'

export function useIsomorphicLayoutEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
) {
  if (typeof window !== "undefined") {
    return useLayoutEffect(effect, deps)
  }
  return useEffect(effect, deps)
} 