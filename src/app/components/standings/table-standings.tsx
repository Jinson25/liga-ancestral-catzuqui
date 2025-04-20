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

  if (loading) return <div className="w-full h-full flex items-center justify-center py-8">Cargando posiciones...</div>
  if (error) return <div className="w-full h-full flex items-center justify-center py-8 text-red-500">{error}</div>

  return (
    <div className="w-full h-full">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm text-gray-800">
          <thead>
            <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <th className="py-3 px-2 text-center rounded-tl-lg font-semibold">Pos</th>
              <th className="py-3 px-2 text-left font-semibold">Equipo</th>
              <th className="py-3 px-2 text-center font-semibold">PJ</th>
              <th className="py-3 px-2 text-center font-semibold">G</th>
              <th className="py-3 px-2 text-center font-semibold">E</th>
              <th className="py-3 px-2 text-center font-semibold">P</th>
              <th className="py-3 px-2 text-center font-semibold">GF</th>
              <th className="py-3 px-2 text-center font-semibold">GC</th>
              <th className="py-3 px-2 text-center font-semibold">DG</th>
              <th className="py-3 px-2 text-center rounded-tr-lg font-semibold">PTS</th>
            </tr>
          </thead>
          <tbody>
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
                  <tr key={pos.id} className={`${idx === 0 ? 'bg-amber-50 border-l-4 border-yellow-400' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors`}>
                    <td className="py-3 px-2 text-center font-bold">{idx + 1}</td>
                    <td className="py-3 px-2 font-semibold">
                      <div className="flex items-center">
                        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${idx < 3 ? 'bg-yellow-400' : 'bg-blue-400'}`}></span>
                        {equipo ? equipo.nombre : pos.equipo_id}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center">{pos.partidos_jugados}</td>
                    <td className="py-3 px-2 text-center">{pos.victorias}</td>
                    <td className="py-3 px-2 text-center">{pos.empates}</td>
                    <td className="py-3 px-2 text-center">{pos.derrotas}</td>
                    <td className="py-3 px-2 text-center">{pos.goles_favor}</td>
                    <td className="py-3 px-2 text-center">{pos.goles_contra}</td>
                    <td className="py-3 px-2 text-center font-medium">
                      <span className={`${(pos.goles_favor - pos.goles_contra) > 0 ? 'text-green-600' : (pos.goles_favor - pos.goles_contra) < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {pos.goles_favor - pos.goles_contra > 0 ? '+' : ''}{pos.goles_favor - pos.goles_contra}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-blue-700">{pos.puntos}</td>
                  </tr>
                )
              })}
              {posiciones.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-gray-500">No hay posiciones disponibles para esta temporada</td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
