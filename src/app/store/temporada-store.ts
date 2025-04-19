import { create } from 'zustand'
import { Temporada } from '@/app/types'

interface TemporadaStore {
    temporada: Temporada | null
    setTemporada: (temporada: Temporada | null) => void
}

export const useTemporadaStore = create<TemporadaStore>((set) => ({
    temporada: null,
    setTemporada: (temporada) => set({ temporada })
}))
