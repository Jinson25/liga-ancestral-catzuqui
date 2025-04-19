'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Partido } from '@/app/types'

export function FixtureEquipo() {
    const [partidos, setPartidos] = useState<Partido[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const supabase = createClientComponentClient()

    useEffect(() => {
        cargarFixture()
    }, [])

    async function cargarFixture() {
        try {
            setLoading(true)
            setError('')

            // Obtener el ID del equipo del usuario actual
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setError('No hay sesión activa')
                return
            }

            const { data: equipoData, error: equipoError } = await supabase
                .from('equipos')
                .select('id')
                .eq('representante_id', session.user.id)
                .single()

            if (equipoError) throw equipoError

            // Cargar los partidos del equipo
            const { data, error: fixtureError } = await supabase
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
                .or(`equipo_local_id.eq.${equipoData.id},equipo_visitante_id.eq.${equipoData.id}`)
                .order('fecha', { ascending: true })

            if (fixtureError) throw fixtureError
            setPartidos(data || [])

        } catch (error) {
            setError('Error al cargar el fixture')
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
                <div>No hay partidos programados</div>
            ) : (
                <div className="space-y-4">
                    {partidos.map((partido) => (
                        <div key={partido.id} className="bg-white p-4 rounded-lg shadow">
                            <div className="grid grid-cols-3 gap-4 items-center">
                                <div className="text-right">{(partido as any).equipo_local.nombre}</div>
                                <div className="text-center">vs</div>
                                <div className="text-left">{(partido as any).equipo_visitante.nombre}</div>
                                <div className="text-right font-bold">
                                    {partido.goles_local ?? '-'}
                                </div>
                                <div className="text-center">
                                    {new Date(partido.fecha).toLocaleDateString()} {partido.hora}
                                </div>
                                <div className="text-left font-bold">
                                    {partido.goles_visitante ?? '-'}
                                </div>
                            </div>
                            {partido.arbitro && (
                                <div className="mt-2 text-sm text-gray-500">
                                    Árbitro: {partido.arbitro}
                                </div>
                            )}
                            {partido.cancha && (
                                <div className="text-sm text-gray-500">
                                    Cancha: {partido.cancha}
                                </div>
                            )}
                            <div className="text-sm text-gray-500 mt-2">
                                {partido.fase}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
