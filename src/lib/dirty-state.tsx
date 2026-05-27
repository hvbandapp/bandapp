'use client'

import {
  createContext, useContext, useRef, useState,
  useCallback, useEffect, type ReactNode,
} from 'react'

interface DirtyStateValue {
  isDirty:          boolean
  pendingHref:      string | null
  hasSaveCallback:  boolean
  setDirty:         (dirty: boolean, onSave?: () => Promise<void> | void) => void
  clearDirty:       () => void
  requestNavigation:(href: string) => boolean // true = proceed immediately
  invokeSave:       () => Promise<void>
  dismissModal:     () => void
}

const DirtyStateContext = createContext<DirtyStateValue | null>(null)

export function DirtyStateProvider({ children }: { children: ReactNode }) {
  const [isDirty,     setIsDirty]     = useState(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const onSaveRef = useRef<(() => Promise<void> | void) | null>(null)

  const setDirty = useCallback((dirty: boolean, onSave?: () => Promise<void> | void) => {
    setIsDirty(dirty)
    onSaveRef.current = dirty && onSave ? onSave : null
  }, [])

  const clearDirty = useCallback(() => {
    setIsDirty(false)
    onSaveRef.current = null
    setPendingHref(null)
  }, [])

  const requestNavigation = useCallback((href: string): boolean => {
    if (!isDirty) return true
    setPendingHref(href)
    return false
  }, [isDirty])

  const invokeSave = useCallback(async () => {
    if (onSaveRef.current) await onSaveRef.current()
  }, [])

  const dismissModal = useCallback(() => {
    setPendingHref(null)
  }, [])

  // Warn on browser tab close / hard navigation
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  return (
    <DirtyStateContext.Provider value={{
      isDirty,
      pendingHref,
      hasSaveCallback: onSaveRef.current !== null,
      setDirty,
      clearDirty,
      requestNavigation,
      invokeSave,
      dismissModal,
    }}>
      {children}
    </DirtyStateContext.Provider>
  )
}

export function useDirtyState() {
  const ctx = useContext(DirtyStateContext)
  if (!ctx) throw new Error('useDirtyState must be used within DirtyStateProvider')
  return ctx
}
