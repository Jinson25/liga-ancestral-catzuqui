'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Partido } from '@/app/types'

export function ResultadosPublicos() {
    const [partidos, setPartidos] = useState<Partido[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const supabase = createClientComponentClient()

    useEffect(() => {
        cargarResultados()
    }, [])

    async function cargarResultados() {
        try {
            setLoading(true)
            setError('')
            const { data, error: resultsError } = await supabase
                .from('partidos')
                .select(`
                    *,
                    equipo_local:equipos!partidos_equipo_local_id_fkey (
                        nombre
                    ),
                    equipo_visitante:equipos!partidos_equipo_visitante_id_fkey (
                        nombre
                    )
                `)
                .not('goles_local', 'is', null)
                .not('goles_visitante', 'is', null)
                .order('fecha', { ascending: false })
                .limit(10)

            if (resultsError) throw resultsError
            setPartidos(data || [])

        } catch (error) {
            setError('Error al cargar resultados')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div>Cargando...</div>
    if (error) return <div className="text-red-500">{error}</div>

    return (
        <div>
            {partidos.length === 0 ? (
                <div>No hay resultados disponibles</div>
            ) : (
                <div className="space-y-4">
                    {partidos.map((partido) => (
                        <div key={partido.id} className="bg-white p-4 rounded-lg shadow">
                            <div className="grid grid-cols-3 gap-4 items-center">
                                <div className="text-right">{(partido as any).equipo_local.nombre}</div>
                                <div className="text-center">
                                    {partido.goles_local} - {partido.goles_visitante}
                                </div>
                                <div className="text-left">{(partido as any).equipo_visitante.nombre}</div>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                                Fecha: {new Date(partido.fecha).toLocaleDateString()} {partido.hora}
                            </div>
                            {partido.arbitro && (
                                <div className="text-sm text-gray-500">
                                    Árbitro: {partido.arbitro}
                                </div>
                            )}
                            {partido.cancha && (
                                <div className="text-sm text-gray-500">
                                    Cancha: {partido.cancha}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
