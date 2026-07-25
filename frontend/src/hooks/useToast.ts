import { useState, useRef, useEffect, useCallback } from 'react'

export interface ToastState {
  message: string
  type: 'success' | 'error'
  exiting: boolean
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current)

    setToast({ message, type, exiting: false })

    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => (prev ? { ...prev, exiting: true } : null))
      exitTimerRef.current = setTimeout(() => {
        setToast(null)
      }, 300)
    }, 3000)
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current)
    }
  }, [])

  return { toast, showToast }
}
