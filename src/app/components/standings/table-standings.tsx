'use client'

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface Posicion {
  id: number
  equipo_id: number
  temporada_id: number
  puntos: number
  partidos_jugados: number
  victorias: number
  empates: number
  derrotas: number
  goles_favor: number
  goles_contra: number
}

interface TableStandingsProps {
  temporadaId: number
}

export const TableStandings = ({ temporadaId }: TableStandingsProps) => {
  const [posiciones, setPosiciones] = useState<Posicion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [equipos, setEquipos] = useState<{ id: number, nombre: string }[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    cargarPosiciones()
    cargarEquipos()
    // eslint-disable-next-line
  }, [temporadaId])

  async function cargarPosiciones() {
    setLoading(true)
    setError("")
    const { data, error } = await supabase
      .from('posiciones')
      .select('id,equipo_id,temporada_id,puntos,partidos_jugados,victorias,empates,derrotas,goles_favor,goles_contra')
      .eq('temporada_id', temporadaId)
    if (error) {
      setError("Error al cargar posiciones")
      setLoading(false)
      return
    }
    setPosiciones(data || [])
    setLoading(false)
  }

  async function cargarEquipos() {
    // Carga todos los equipos y sus nombres
    const { data, error } = await supabase.from('equipos').select('id, nombre')
    if (!error && data) setEquipos(data)
  }

  if (loading) return <div className="bg-white rounded-2xl p-4 text-center">Cargando posiciones...</div>
  if (error) return <div className="bg-white rounded-2xl p-4 text-red-500 text-center">{error}</div>

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 sm:p-8 shadow-lg border border-blue-200">
      <h2 className="text-2xl font-extrabold mb-6 text-blue-900 flex items-center gap-2">
        <svg xmlns='http://www.w3.org/2000/svg' className='h-7 w-7 text-yellow-400' viewBox='0 0 20 20' fill='currentColor'><path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z'/></svg>
        Tabla de Posiciones
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-blue-900">
          <thead>
            <tr className="bg-blue-200/50 text-blue-900">
              <th className="pb-3 pt-2 rounded-tl-xl">Pos</th>
              <th className="pb-3 pt-2">Equipo</th>
              <th className="pb-3 pt-2">PJ</th>
              <th className="pb-3 pt-2">G</th>
              <th className="pb-3 pt-2">E</th>
              <th className="pb-3 pt-2">P</th>
              <th className="pb-3 pt-2">GF</th>
              <th className="pb-3 pt-2">GC</th>
              <th className="pb-3 pt-2">DG</th>
              <th className="pb-3 pt-2 rounded-tr-xl">PTS</th>
            </tr>
          </thead>
          <tbody className="font-semibold">
            {posiciones
              .sort((a, b) => {
                if (b.puntos !== a.puntos) return b.puntos - a.puntos
                const dgA = a.goles_favor - a.goles_contra
                const dgB = b.goles_favor - b.goles_contra
                if (dgB !== dgA) return dgB - dgA
                return b.goles_favor - a.goles_favor
              })
              .map((pos, idx) => {
                const equipo = equipos.find(eq => eq.id === pos.equipo_id)
                return (
                  <tr key={pos.id} className={`border-t border-blue-100 ${idx === 0 ? 'bg-yellow-100/60 animate-pulse' : idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'}`}>
                    <td className="py-2 text-center text-lg font-bold">{idx + 1}</td>
                    <td className="py-2 font-bold flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
                      {equipo ? equipo.nombre : pos.equipo_id}
                    </td>
                    <td className="py-2 text-center">{pos.partidos_jugados}</td>
                    <td className="py-2 text-center">{pos.victorias}</td>
                    <td className="py-2 text-center">{pos.empates}</td>
                    <td className="py-2 text-center">{pos.derrotas}</td>
                    <td className="py-2 text-center">{pos.goles_favor}</td>
                    <td className="py-2 text-center">{pos.goles_contra}</td>
                    <td className="py-2 text-center">{pos.goles_favor - pos.goles_contra}</td>
                    <td className="py-2 text-center text-blue-700 font-extrabold">{pos.puntos}</td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
