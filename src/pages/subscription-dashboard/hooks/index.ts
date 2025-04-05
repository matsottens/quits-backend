import * as React from 'react'
const { 
  useState, 
  useEffect, 
  useRef, 
  useCallback,
  useLayoutEffect
} = React;
// Removed duplicate import

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastRan = useRef(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= delay) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, delay - (Date.now() - lastRan.current))

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return throttledValue
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.log(error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      // Save state
      setStoredValue(valueToStore)
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.log(error)
    }
  }

  return [storedValue, setValue] as const
}

export function useSessionStorage<T>(key: string, initialValue: T) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.log(error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to sessionStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      // Save state
      setStoredValue(valueToStore)
      // Save to session storage
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.log(error)
    }
  }

  return [storedValue, setValue] as const
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => setMatches(media.matches)
    window.addEventListener("resize", listener)
    return () => window.removeEventListener("resize", listener)
  }, [matches, query])

  return matches
}

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void,
  mouseEvent: "mousedown" | "mouseup" = "mousedown"
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current
      const target = event.target as Node

      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains(target)) {
        return
      }

      handler(event)
    }

    document.addEventListener(mouseEvent, listener)

    return () => {
      document.removeEventListener(mouseEvent, listener)
    }
  }, [ref, handler, mouseEvent])
}

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return windowSize
}

export function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    const updatePosition = () => {
      setScrollPosition(window.pageYOffset)
    }

    window.addEventListener("scroll", updatePosition)
    updatePosition()

    return () => window.removeEventListener("scroll", updatePosition)
  }, [])

  return scrollPosition
}

export function useHover<T extends HTMLElement = HTMLElement>(): [
  React.RefObject<T>,
  boolean
] {
  const [value, setValue] = useState<boolean>(false)
  const ref = useRef<T>(null)

  const handleMouseEnter = () => setValue(true)
  const handleMouseLeave = () => setValue(false)

  useEffect(() => {
    const node = ref.current
    if (node) {
      node.addEventListener("mouseenter", handleMouseEnter)
      node.addEventListener("mouseleave", handleMouseLeave)

      return () => {
        node.removeEventListener("mouseenter", handleMouseEnter)
        node.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [ref.current])

  return [ref, value]
}

export function useFocus<T extends HTMLElement = HTMLElement>(): [
  React.RefObject<T>,
  boolean
] {
  const [value, setValue] = useState<boolean>(false)
  const ref = useRef<T>(null)

  const handleFocus = () => setValue(true)
  const handleBlur = () => setValue(false)

  useEffect(() => {
    const node = ref.current
    if (node) {
      node.addEventListener("focus", handleFocus)
      node.addEventListener("blur", handleBlur)

      return () => {
        node.removeEventListener("focus", handleFocus)
        node.removeEventListener("blur", handleBlur)
      }
    }
  }, [ref.current])

  return [ref, value]
}

export function useToggle(initialState = false): [boolean, () => void] {
  const [state, setState] = useState(initialState)

  const toggle = useCallback(() => {
    setState((state) => !state)
  }, [])

  return [state, toggle]
}

export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue)

  const increment = useCallback(() => {
    setCount((count) => count + 1)
  }, [])

  const decrement = useCallback(() => {
    setCount((count) => count - 1)
  }, [])

  const reset = useCallback(() => {
    setCount(initialValue)
  }, [initialValue])

  return {
    count,
    increment,
    decrement,
    reset,
  }
}

export function useForm<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target
      setValues((values) => ({ ...values, [name]: value }))
      if (errors[name as keyof T]) {
        setErrors((errors) => ({ ...errors, [name]: undefined }))
      }
    },
    [errors]
  )

  const handleSubmit = useCallback(
    async (onSubmit: (values: T) => Promise<void>) => {
      setIsSubmitting(true)
      try {
        await onSubmit(values)
      } catch (error) {
        console.error(error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [values]
  )

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
  }, [initialValues])

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setErrors,
  }
}

export function useAsync<T>() {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle")
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    setStatus("pending")
    setData(null)
    setError(null)

    try {
      const result = await asyncFunction()
      setData(result)
      setStatus("success")
    } catch (error) {
      setError(error as Error)
      setStatus("error")
    }
  }, [])

  return {
    status,
    data,
    error,
    execute,
  }
}

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay !== null) {
      const id = setTimeout(() => savedCallback.current(), delay)
      return () => clearTimeout(id)
    }
  }, [delay])
}

export function useMount(callback: () => void) {
  useEffect(() => {
    callback()
  }, [])
}

export function useUnmount(callback: () => void) {
  useEffect(() => {
    return callback
  }, [])
}

export function useUpdateEffect(effect: React.EffectCallback, deps?: React.DependencyList) {
  const isFirst = useRef(true)

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false
      return
    }
    return effect()
  }, deps)
}

export function useIsMounted() {
  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  return isMounted
}

export function useIsomorphicLayoutEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
) {
  if (typeof window !== "undefined") {
    return React.useLayoutEffect(effect, deps)
  }
  return React.useEffect(effect, deps)
}

export function useEventListener(
  eventName: string,
  handler: (event: Event) => void,
  element: HTMLElement | Window = window
) {
  const savedHandler = useRef(handler)

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    const isSupported = element && element.addEventListener
    if (!isSupported) return

    const eventListener = (event: Event) => savedHandler.current(event)
    element.addEventListener(eventName, eventListener)

    return () => {
      element.removeEventListener(eventName, eventListener)
    }
  }, [eventName, element])
}

export function useOnScreen(ref: React.RefObject<HTMLElement>, rootMargin = "0px") {
  const [isIntersecting, setIntersecting] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting)
      },
      {
        rootMargin,
      }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [ref, rootMargin])

  return isIntersecting
}

export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  )
}

export function useThrottleCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastRan = useRef(Date.now())

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      if (Date.now() - lastRan.current >= delay) {
        callback(...args)
        lastRan.current = Date.now()
      } else {
        timeoutRef.current = setTimeout(() => {
          callback(...args)
          lastRan.current = Date.now()
        }, delay - (Date.now() - lastRan.current))
      }
    },
    [callback, delay]
  )
}

export function useLocalStorageCallback<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.log(error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.log(error)
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue] as const
}

export function useSessionStorageCallback<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.log(error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.log(error)
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue] as const
}

export function useMediaQueryCallback(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => setMatches(media.matches)
    window.addEventListener("resize", listener)
    return () => window.removeEventListener("resize", listener)
  }, [matches, query])

  return matches
}

export function useOnClickOutsideCallback<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void,
  mouseEvent: "mousedown" | "mouseup" = "mousedown"
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current
      const target = event.target as Node

      if (!el || el.contains(target)) {
        return
      }

      handler(event)
    }

    document.addEventListener(mouseEvent, listener)

    return () => {
      document.removeEventListener(mouseEvent, listener)
    }
  }, [ref, handler, mouseEvent])
}

export function usePreviousCallback<T>(value: T) {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

export function useWindowSizeCallback() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return windowSize
}

export function useScrollPositionCallback() {
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    const updatePosition = () => {
      setScrollPosition(window.pageYOffset)
    }

    window.addEventListener("scroll", updatePosition)
    updatePosition()

    return () => window.removeEventListener("scroll", updatePosition)
  }, [])

  return scrollPosition
}

export function useHoverCallback<T extends HTMLElement = HTMLElement>() {
  const [value, setValue] = useState<boolean>(false)
  const ref = useRef<T>(null)

  const handleMouseEnter = useCallback(() => setValue(true), [])
  const handleMouseLeave = useCallback(() => setValue(false), [])

  useEffect(() => {
    const node = ref.current
    if (node) {
      node.addEventListener("mouseenter", handleMouseEnter)
      node.addEventListener("mouseleave", handleMouseLeave)

      return () => {
        node.removeEventListener("mouseenter", handleMouseEnter)
        node.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [handleMouseEnter, handleMouseLeave])

  return [ref, value] as const
}

export function useFocusCallback<T extends HTMLElement = HTMLElement>() {
  const [value, setValue] = useState<boolean>(false)
  const ref = useRef<T>(null)

  const handleFocus = useCallback(() => setValue(true), [])
  const handleBlur = useCallback(() => setValue(false), [])

  useEffect(() => {
    const node = ref.current
    if (node) {
      node.addEventListener("focus", handleFocus)
      node.addEventListener("blur", handleBlur)

      return () => {
        node.removeEventListener("focus", handleFocus)
        node.removeEventListener("blur", handleBlur)
      }
    }
  }, [handleFocus, handleBlur])

  return [ref, value] as const
}

export function useToggleCallback(initialState = false) {
  const [state, setState] = useState(initialState)

  const toggle = useCallback(() => {
    setState((state) => !state)
  }, [])

  return [state, toggle] as const
}

export function useCounterCallback(initialValue = 0) {
  const [count, setCount] = useState(initialValue)

  const increment = useCallback(() => {
    setCount((count) => count + 1)
  }, [])

  const decrement = useCallback(() => {
    setCount((count) => count - 1)
  }, [])

  const reset = useCallback(() => {
    setCount(initialValue)
  }, [initialValue])

  return {
    count,
    increment,
    decrement,
    reset,
  }
}

export function useFormCallback<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target
      setValues((values) => ({ ...values, [name]: value }))
      if (errors[name as keyof T]) {
        setErrors((errors) => ({ ...errors, [name]: undefined }))
      }
    },
    [errors]
  )

  const handleSubmit = useCallback(
    async (onSubmit: (values: T) => Promise<void>) => {
      setIsSubmitting(true)
      try {
        await onSubmit(values)
      } catch (error) {
        console.error(error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [values]
  )

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
  }, [initialValues])

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setErrors,
  }
}

export function useAsyncCallback<T>() {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle")
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    setStatus("pending")
    setData(null)
    setError(null)

    try {
      const result = await asyncFunction()
      setData(result)
      setStatus("success")
    } catch (error) {
      setError(error as Error)
      setStatus("error")
    }
  }, [])

  return {
    status,
    data,
    error,
    execute,
  }
}

export function useIntervalCallback(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

export function useTimeoutCallback(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay !== null) {
      const id = setTimeout(() => savedCallback.current(), delay)
      return () => clearTimeout(id)
    }
  }, [delay])
}

export function useMountCallback(callback: () => void) {
  useEffect(() => {
    callback()
  }, [])
}

export function useUnmountCallback(callback: () => void) {
  useEffect(() => {
    return callback
  }, [])
}

export function useUpdateEffectCallback(
  effect: React.EffectCallback,
  deps?: React.DependencyList
) {
  const isFirst = useRef(true)

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false
      return
    }
    return effect()
  }, deps)
}

export function useIsMountedCallback() {
  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  return isMounted
}

export function useIsomorphicLayoutEffectCallback(
  effect: React.EffectCallback,
  deps?: React.DependencyList
) {
  if (typeof window !== "undefined") {
    return React.useLayoutEffect(effect, deps)
  }
  return React.useEffect(effect, deps)
}

export function useEventListenerCallback(
  eventName: string,
  handler: (event: Event) => void,
  element: HTMLElement | Window = window
) {
  const savedHandler = useRef(handler)

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    const isSupported = element && element.addEventListener
    if (!isSupported) return

    const eventListener = (event: Event) => savedHandler.current(event)
    element.addEventListener(eventName, eventListener)

    return () => {
      element.removeEventListener(eventName, eventListener)
    }
  }, [eventName, element])
}

export function useOnScreenCallback(
  ref: React.RefObject<HTMLElement>,
  rootMargin = "0px"
) {
  const [isIntersecting, setIntersecting] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting)
      },
      {
        rootMargin,
      }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [ref, rootMargin])

  return isIntersecting
} 