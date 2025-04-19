'use client'

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface EquipoStats {
    victorias: number
    empates: number
    derrotas: number
}

export const Stats = () => {
    const [stats, setStats] = useState<EquipoStats>({
        victorias: 0,
        empates: 0,
        derrotas: 0
    })
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

            // Obtener el usuario actual
            const { data: { user }, error: userError } = await supabase.auth.getUser()
            if (userError) throw userError

            if (!user?.email) {
                throw new Error('Usuario no autenticado')
            }

            // Obtener el ID del equipo del usuario desde la tabla usuarios
            const { data: userData, error: equipoError } = await supabase
                .from('usuarios')
                .select('equipo_id')
                .eq('correo', user.email)
                .single()

            if (equipoError) throw equipoError

            if (!userData?.equipo_id) {
                throw new Error('Usuario no tiene equipo asignado')
            }

            // Obtener la temporada activa
            const { data: temporadaData, error: temporadaError } = await supabase
                .from('temporadas')
                .select('id')
                .order('fecha_inicio', { ascending: false })
                .limit(1)
                .single()

            if (temporadaError) throw temporadaError

            if (!temporadaData) {
                throw new Error('No hay temporada activa')
            }

            // Obtener los partidos del equipo
            const { data: partidos, error: partidosError } = await supabase
                .from('partidos')
                .select('goles_local, goles_visitante, equipo_local_id')
                .eq('temporada_id', temporadaData.id)
                .or(`equipo_local_id.eq.${userData.equipo_id},equipo_visitante_id.eq.${userData.equipo_id}`)
                .not('goles_local', 'is', null)
                .not('goles_visitante', 'is', null)

            if (partidosError) throw partidosError

            // Calcular estadísticas
            let victorias = 0
            let empates = 0
            let derrotas = 0

            if (partidos && partidos.length > 0) {
                partidos.forEach(partido => {
                    if (partido.goles_local === null || partido.goles_visitante === null) return

                    const esLocal = partido.equipo_local_id === userData.equipo_id
                    const golesEquipo = esLocal ? partido.goles_local : partido.goles_visitante
                    const golesRival = esLocal ? partido.goles_visitante : partido.goles_local

                    if (golesEquipo > golesRival) victorias++
                    else if (golesEquipo === golesRival) empates++
                    else derrotas++
                })
            }

            setStats({ victorias, empates, derrotas })
        } catch (err) {
            let errorMsg = '';
            if (err instanceof Error) {
                errorMsg = err.message;
            } else if (typeof err === 'string') {
                errorMsg = err;
            } else if (err && typeof err === 'object') {
                errorMsg = JSON.stringify(err);
            } else {
                errorMsg = 'Error desconocido';
            }
            setError('Error al cargar estadísticas: ' + errorMsg);
            console.error('Error en cargarEstadisticas:', err);
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="text-center py-4">Cargando estadísticas...</div>
        </div>
    )

    if (error) return (
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="text-center text-red-500 py-4">{error}</div>
        </div>
    )

    return (
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Estadísticas</h2>
            <div className="space-y-4">
                {[
                    { label: "Victorias", value: stats.victorias },
                    { label: "Empates", value: stats.empates },
                    { label: "Derrotas", value: stats.derrotas },
                ].map((stat, index) => (
                    <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                        <span className="text-gray-600">{stat.label}</span>
                        <span className="font-bold">{stat.value}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}