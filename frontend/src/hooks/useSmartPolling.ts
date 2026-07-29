import { useEffect, useRef } from 'react'

export function useSmartPolling(callback: () => void, intervalMs: number = 60000) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const lastFetchTime = useRef(Date.now())

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null

    const fireCallback = () => {
      lastFetchTime.current = Date.now()
      callbackRef.current()
    }

    const startInterval = () => {
      stopInterval()
      intervalId = setInterval(() => {
        fireCallback()
      }, intervalMs)
    }

    const stopInterval = () => {
      if (intervalId !== null) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    const throttledRefresh = () => {
      if (Date.now() - lastFetchTime.current > 2000) {
        stopInterval()
        fireCallback()
        startInterval()
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopInterval()
      } else {
        throttledRefresh()
      }
    }

    const handleFocus = () => {
      throttledRefresh()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    fireCallback()
    startInterval()

    return () => {
      stopInterval()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [intervalMs])
}
