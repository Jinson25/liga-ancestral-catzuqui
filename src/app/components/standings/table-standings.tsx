'use client'

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface EquipoStats {
    id: string
    nombre: string
    stats: {
        partidos_jugados: number
        victorias: number
        empates: number
        derrotas: number
        goles_a_favor: number
        goles_encontra: number
        puntos: number
    }
}

export const TableStandings = () => {
    const [equipos, setEquipos] = useState<EquipoStats[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const supabase = createClientComponentClient()

    useEffect(() => {
        cargarEstadisticas()
    }, [])

    async function cargarEstadisticas() {
        try {
            setLoading(true)
            setError('')

            // Obtener los equipos con sus estadísticas
            const { data: equiposData, error: equiposError } = await supabase
                .from('equipos')
                .select(`
                    id,
                    nombre,
                    partidos_local:partidos!partidos_equipo_local_id_fkey (
                        goles_local,
                        goles_visitante
                    ),
                    partidos_visitante:partidos!partidos_equipo_visitante_id_fkey (
                        goles_local,
                        goles_visitante
                    )
                `)
                .eq('aprobado', true)

            if (equiposError) throw equiposError

            // Procesar y combinar las estadísticas
            const equiposConStats = equiposData.map(equipo => {
                let partidos_jugados = 0
                let victorias = 0
                let empates = 0
                let derrotas = 0
                let goles_a_favor = 0
                let goles_encontra = 0

                // Procesar partidos como local
                equipo.partidos_local?.forEach(partido => {
                    if (partido.goles_local !== null && partido.goles_visitante !== null) {
                        partidos_jugados++
                        goles_a_favor += partido.goles_local
                        goles_encontra += partido.goles_visitante

                        if (partido.goles_local > partido.goles_visitante) victorias++
                        else if (partido.goles_local === partido.goles_visitante) empates++
                        else derrotas++
                    }
                })

                // Procesar partidos como visitante
                equipo.partidos_visitante?.forEach(partido => {
                    if (partido.goles_local !== null && partido.goles_visitante !== null) {
                        partidos_jugados++
                        goles_a_favor += partido.goles_visitante
                        goles_encontra += partido.goles_local

                        if (partido.goles_visitante > partido.goles_local) victorias++
                        else if (partido.goles_visitante === partido.goles_local) empates++
                        else derrotas++
                    }
                })

                const puntos = (victorias * 3) + empates

                return {
                    id: equipo.id,
                    nombre: equipo.nombre,
                    stats: {
                        partidos_jugados,
                        victorias,
                        empates,
                        derrotas,
                        goles_a_favor,
                        goles_encontra,
                        puntos
                    }
                }
            })

            setEquipos(equiposConStats)

        } catch (err) {
            console.error('Error completo:', err)
            setError('Error al cargar estadísticas')
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="text-center py-8">Cargando tabla de posiciones...</div>
        </div>
    )

    if (error) return (
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="text-center text-red-500 py-8">{error}</div>
        </div>
    )

    return (
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Tabla de Posiciones</h2>
                <button className="text-sm text-teal-600 hover:text-teal-700">
                    Ver completa
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-sm text-gray-500">
                            <th className="pb-4">Pos</th>
                            <th className="pb-4">Equipo</th>
                            <th className="pb-4">PJ</th>
                            <th className="pb-4 px-1">G</th>
                            <th className="pb-4 px-1">E</th>
                            <th className="pb-4 px-1">P</th>
                            <th className="pb-4">GF</th>
                            <th className="pb-4">GC</th>
                            <th className="pb-4">DG</th>
                            <th className="pb-4">PTS</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {equipos
                            .sort((a, b) => {
                                // Primero ordenar por puntos
                                if (b.stats.puntos !== a.stats.puntos) {
                                    return b.stats.puntos - a.stats.puntos
                                }
                                // Si los puntos son iguales, ordenar por diferencia de goles
                                const difGolesA = a.stats.goles_a_favor - a.stats.goles_encontra
                                const difGolesB = b.stats.goles_a_favor - b.stats.goles_encontra
                                if (difGolesB !== difGolesA) {
                                    return difGolesB - difGolesA
                                }
                                // Si la diferencia de goles es igual, ordenar por goles a favor
                                return b.stats.goles_a_favor - a.stats.goles_a_favor
                            })
                            .map((equipo, index) => {
                                const { partidos_jugados, victorias, empates, derrotas, goles_a_favor, goles_encontra, puntos } = equipo.stats
                                const diferencia_goles = goles_a_favor - goles_encontra

                                return (
                                    <tr key={equipo.id} className="border-t border-gray-100">
                                        <td className="py-2">{index + 1}</td>
                                        <td className="py-2 font-medium">{equipo.nombre}</td>
                                        <td className="py-2">{partidos_jugados}</td>
                                        <td className="py-2 px-1">{victorias}</td>
                                        <td className="py-2 px-1">{empates}</td>
                                        <td className="py-2 px-1">{derrotas}</td>
                                        <td className="py-2">{goles_a_favor}</td>
                                        <td className="py-2">{goles_encontra}</td>
                                        <td className="py-2">{diferencia_goles}</td>
                                        <td className="py-2 font-bold">{puntos}</td>
                                    </tr>
                                )
                            })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
