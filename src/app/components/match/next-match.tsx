'use client'

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Image from "next/image"
import { Calendar } from "lucide-react"

interface EquipoData {
    id: string
    nombre: string
    logo: string | null
}

interface NextMatchData {
    id: string
    fecha: string
    equipo_local: EquipoData
    equipo_visitante: EquipoData
}

interface SupabasePartidoData {
    id: string
    fecha: string
    equipo_local: {
        id: string
        nombre: string
    }
    equipo_visitante: {
        id: string
        nombre: string
    }
}

export const NextMatch = () => {
    const [nextMatch, setNextMatch] = useState<NextMatchData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const supabase = createClientComponentClient()

    useEffect(() => {
        cargarProximoPartido()
    }, [])

    async function cargarProximoPartido() {
        try {
            setLoading(true)
            setError('')

            // Obtener la temporada activa
            const { data: temporadaData, error: temporadaError } = await supabase
                .from('temporadas')
                .select('id')
                .order('fecha_inicio', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (temporadaError) throw temporadaError

            if (!temporadaData) {
                throw new Error('No hay temporada activa')
            }

            const { data, error: partidosError } = await supabase
                .from('partidos')
                .select(`
                    id,
                    fecha,
                    equipo_local:partidos_equipo_local_id_fkey(
                        id,
                        nombre
                    ),
                    equipo_visitante:partidos_equipo_visitante_id_fkey(
                        id,
                        nombre
                    )
                `)
                .eq('temporada_id', temporadaData.id)
                .is('goles_local', null)
                .is('goles_visitante', null)
                .order('fecha', { ascending: true })
                .limit(1)
                .maybeSingle() as { data: SupabasePartidoData | null, error: any }

            if (partidosError) throw partidosError

            if (!data) {
                setNextMatch(null)
                return
            }

            // Asegurar que los datos tienen la estructura correcta
            const proximoPartido: NextMatchData = {
                id: data.id,
                fecha: data.fecha,
                equipo_local: {
                    id: data.equipo_local.id,
                    nombre: data.equipo_local.nombre,
                    logo: null
                },
                equipo_visitante: {
                    id: data.equipo_visitante.id,
                    nombre: data.equipo_visitante.nombre,
                    logo: null
                }
            }

            setNextMatch(proximoPartido)

        } catch (err) {
            console.error('Error completo:', err)
            setError(err instanceof Error ? err.message : 'Error al cargar el próximo partido')
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="text-center py-4">Cargando próximo partido...</div>
        </div>
    )

    if (error) return (
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="text-center text-red-500 py-4">{error}</div>
        </div>
    )

    if (!nextMatch) return (
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Próximo Partido</h2>
            <div className="text-center text-gray-500 py-4">
                No hay próximos partidos programados
            </div>
        </div>
    )

    return (
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Próximo Partido</h2>
            <div className="flex items-center justify-between">
                {/* Equipo Local */}
                <div className="flex flex-col items-center space-y-2">
                    <div className="relative w-16 h-16">
                        <Image
                            src={'/placeholder-team.png'}
                            alt={nextMatch.equipo_local.nombre}
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className="text-sm font-medium text-center">
                        {nextMatch.equipo_local.nombre}
                    </span>
                </div>

                {/* Fecha y Hora */}
                <div className="flex flex-col items-center space-y-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">
                        {new Date(nextMatch.fecha).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-500">
                        {new Date(nextMatch.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                {/* Equipo Visitante */}
                <div className="flex flex-col items-center space-y-2">
                    <div className="relative w-16 h-16">
                        <Image
                            src={'/placeholder-team.png'}
                            alt={nextMatch.equipo_visitante.nombre}
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className="text-sm font-medium text-center">
                        {nextMatch.equipo_visitante.nombre}
                    </span>
                </div>
            </div>
        </div>
    )
}