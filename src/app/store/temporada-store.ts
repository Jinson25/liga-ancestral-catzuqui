import { create } from 'zustand'

export interface Temporada {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
}

interface TemporadaStore {
    temporada: Temporada | null
    setTemporada: (temporada: Temporada | null) => void
}

export const useTemporadaStore = create<TemporadaStore>((set) => ({
    temporada: null,
    setTemporada: (temporada) => set({ temporada })
}))
