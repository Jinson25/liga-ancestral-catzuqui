'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Estadisticas {
    total_equipos: number
    total_jugadores: number
    partidos_jugados: number
    goles_marcados: number
}

export function EstadisticasManager() {
    const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
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

            // Obtener total de equipos
            const { count: totalEquipos, error: equiposError } = await supabase
                .from('equipos')
                .select('*', { count: 'exact', head: true })
                .eq('aprobado', true)

            if (equiposError) throw equiposError

            // Obtener total de jugadores
            const { count: totalJugadores, error: jugadoresError } = await supabase
                .from('jugadores')
                .select('*', { count: 'exact', head: true })
                .eq('aprobado', true)

            if (jugadoresError) throw jugadoresError

            // Obtener estadísticas de partidos
            const { data: partidosData, error: partidosError } = await supabase
                .from('partidos')
                .select('goles_local, goles_visitante')
                .not('goles_local', 'is', null)
                .not('goles_visitante', 'is', null)

            if (partidosError) throw partidosError

            // Calcular estadísticas de partidos
            const partidosJugados = partidosData?.length || 0
            const golesMarcados = partidosData?.reduce((total, partido) => {
                return total + (partido.goles_local || 0) + (partido.goles_visitante || 0)
            }, 0) || 0

            setEstadisticas({
                total_equipos: totalEquipos || 0,
                total_jugadores: totalJugadores || 0,
                partidos_jugados: partidosJugados,
                goles_marcados: golesMarcados
            })

        } catch (err) {
            console.error('Error completo:', err)
            setError('Error al cargar estadísticas: ' + (err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div>Cargando estadísticas...</div>
    if (error) return <div className="text-red-500">{error}</div>
    if (!estadisticas) return <div>No hay estadísticas disponibles</div>

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">Total Equipos</h3>
                <p className="text-3xl font-bold text-blue-600">{estadisticas.total_equipos}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">Total Jugadores</h3>
                <p className="text-3xl font-bold text-green-600">{estadisticas.total_jugadores}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">Partidos Jugados</h3>
                <p className="text-3xl font-bold text-purple-600">{estadisticas.partidos_jugados}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">Goles Marcados</h3>
                <p className="text-3xl font-bold text-orange-600">{estadisticas.goles_marcados}</p>
            </div>
        </div>
    )
}
