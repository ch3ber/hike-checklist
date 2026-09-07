import { useEffect, useState } from 'react'
import type { TrekState } from '../../types/trek'
import { EMPTY_STATE, STORAGE_KEY } from './config'

function loadState(): TrekState {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return {
      ...EMPTY_STATE,
      ...stored,
      extra: Array.isArray(stored.extra) ? stored.extra : [],
    }
  } catch {
    return EMPTY_STATE
  }
}

export function useTrekState() {
  const [state, setState] = useState<TrekState>(EMPTY_STATE)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setState(loadState())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const timeout = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }, 160)
    return () => window.clearTimeout(timeout)
  }, [hydrated, state])

  return [state, setState] as const
}
