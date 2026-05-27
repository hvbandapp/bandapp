'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Ensemble } from '@/types'
import { MOCK_ENSEMBLES } from '@/lib/mock-data'

interface GroupContextValue {
  groups:            Ensemble[]
  activeGroup:       Ensemble
  setActiveGroupId:  (id: string) => void
  createGroup:       (name: string, description?: string, estYear?: number) => void
}

const GroupContext = createContext<GroupContextValue | null>(null)

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const [groups, setGroups]           = useState<Ensemble[]>(MOCK_ENSEMBLES)
  const [activeGroupId, setId]        = useState<string>(MOCK_ENSEMBLES[0].id)

  useEffect(() => {
    const saved = localStorage.getItem('et-active-group')
    if (saved) setId(saved)
  }, [])

  const setActiveGroupId = useCallback((id: string) => {
    setId(id)
    localStorage.setItem('et-active-group', id)
  }, [])

  const createGroup = useCallback((name: string, description?: string, estYear?: number) => {
    const newGroup: Ensemble = {
      id:          `g${Date.now()}`,
      name,
      description,
      est_year:    estYear,
      created_at:  new Date().toISOString(),
    }
    setGroups(prev => [...prev, newGroup])
    setActiveGroupId(newGroup.id)
  }, [setActiveGroupId])

  const activeGroup = groups.find(g => g.id === activeGroupId) ?? groups[0]

  return (
    <GroupContext.Provider value={{ groups, activeGroup, setActiveGroupId, createGroup }}>
      {children}
    </GroupContext.Provider>
  )
}

export function useGroup() {
  const ctx = useContext(GroupContext)
  if (!ctx) throw new Error('useGroup must be used within GroupProvider')
  return ctx
}
