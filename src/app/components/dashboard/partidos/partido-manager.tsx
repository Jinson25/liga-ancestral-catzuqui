'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Calendar, Edit2, Save, X, Shuffle } from 'lucide-react'

interface Equipo {
    id: string
    nombre: string
    liga_id: string
    aprobado: boolean
    representante_id: string
}

interface TemporadaEquipo {
    equipo_id: string
    temporada_id: string
    equipos: Equipo
}

interface SupabaseResponse {
    data: any[] | null
    error: Error | null
}

interface Partido {
    id: string
    temporada_id: string
    fecha: string
    equipo_local_id: string
    equipo_visitante_id: string
    goles_local: number | null
    goles_visitante: number | null
}

const HORARIOS = ['09:00', '11:00', '13:00', '15:00']

interface PartidoManagerProps {
    role?: 'presidente' | 'vocal'
}

export function PartidoManager({ role = 'presidente' }: PartidoManagerProps) {
    const [partidos, setPartidos] = useState<Partido[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [editandoPartido, setEditandoPartido] = useState<string | null>(null)
    const [golesLocal, setGolesLocal] = useState<number | null>(null)
    const [golesVisitante, setGolesVisitante] = useState<number | null>(null)

    const supabase = createClientComponentClient()

    useEffect(() => {
        cargarPartidos()
    }, [])

    async function cargarPartidos() {
        try {
            setLoading(true)
            setError('')

            // Obtener la temporada activa (la más reciente)
            const { data: temporadaData, error: temporadaError } = await supabase
                .from('temporadas')
                .select('id')
                .order('fecha_inicio', { ascending: false })
                .limit(1)
                .single()

            if (temporadaError) throw temporadaError

            // Cargar los partidos de la temporada
            const { data, error: partidosError } = await supabase
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
                .eq('temporada_id', temporadaData.id)
                .order('fecha', { ascending: true })

            if (partidosError) throw partidosError
            setPartidos(data || [])

        } catch (err) {
            console.error('Error completo:', err)
            setError('Error al cargar partidos: ' + (err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    async function guardarResultado(partidoId: string) {
        if (golesLocal === null || golesVisitante === null) {
            setError('Debe ingresar los goles de ambos equipos')
            return
        }

        try {
            const { error: updateError } = await supabase
                .from('partidos')
                .update({
                    goles_local: golesLocal,
                    goles_visitante: golesVisitante,
                })
                .eq('id', partidoId)

            if (updateError) throw updateError

            // Actualizar tabla de posiciones
            await actualizarTablaPosiciones(partidoId)

            setEditandoPartido(null)
            setGolesLocal(null)
            setGolesVisitante(null)
            await cargarPartidos()

        } catch (err) {
            console.error('Error completo:', err)
            setError('Error al guardar resultado: ' + (err as Error).message)
        }
    }

    async function actualizarTablaPosiciones(partidoId: string) {
        try {
            const partido = partidos.find(p => p.id === partidoId)
            if (!partido) return

            // Actualizar equipo local
            await actualizarEstadisticasEquipo(
                partido.equipo_local_id,
                partido.temporada_id,
                golesLocal!,
                golesVisitante!
            )

            // Actualizar equipo visitante
            await actualizarEstadisticasEquipo(
                partido.equipo_visitante_id,
                partido.temporada_id,
                golesVisitante!,
                golesLocal!
            )

        } catch (err) {
            console.error('Error completo:', err)
            setError('Error al actualizar tabla: ' + (err as Error).message)
        }
    }

    async function actualizarEstadisticasEquipo(
        equipoId: string,
        temporadaId: string,
        golesFavor: number,
        golesContra: number
    ) {
        const { data: posicion } = await supabase
            .from('tabla_posiciones')
            .select('*')
            .eq('equipo_id', equipoId)
            .eq('temporada_id', temporadaId)
            .single()

        if (!posicion) {
            // Crear nueva entrada en la tabla
            await supabase.from('tabla_posiciones').insert({
                equipo_id: equipoId,
                temporada_id: temporadaId,
                puntos: calcularPuntos(golesFavor, golesContra),
                partidos_jugados: 1,
                ganados: golesFavor > golesContra ? 1 : 0,
                empatados: golesFavor === golesContra ? 1 : 0,
                perdidos: golesFavor < golesContra ? 1 : 0,
                goles_favor: golesFavor,
                goles_contra: golesContra,
                diferencia_goles: golesFavor - golesContra
            })
        } else {
            // Actualizar entrada existente
            await supabase
                .from('tabla_posiciones')
                .update({
                    puntos: posicion.puntos + calcularPuntos(golesFavor, golesContra),
                    partidos_jugados: posicion.partidos_jugados + 1,
                    ganados: posicion.ganados + (golesFavor > golesContra ? 1 : 0),
                    empatados: posicion.empatados + (golesFavor === golesContra ? 1 : 0),
                    perdidos: posicion.perdidos + (golesFavor < golesContra ? 1 : 0),
                    goles_favor: posicion.goles_favor + golesFavor,
                    goles_contra: posicion.goles_contra + golesContra,
                    diferencia_goles: (posicion.goles_favor + golesFavor) - (posicion.goles_contra + golesContra)
                })
                .eq('id', posicion.id)
        }
    }

    function calcularPuntos(golesFavor: number, golesContra: number): number {
        if (golesFavor > golesContra) return 3 // Victoria
        if (golesFavor === golesContra) return 1 // Empate
        return 0 // Derrota
    }

    if (loading) {
        return <div>Cargando partidos...</div>
    }

    return (
        <div className="space-y-4">
            {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            <div className="grid gap-4">
                {partidos.map(partido => (
                    <div key={partido.id} className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">
                                        {new Date(partido.fecha).toLocaleDateString()}
                                    </p>
                                    <div className="mt-1 grid grid-cols-3 gap-2 items-center">
                                        <div className="text-right">
                                            {(partido as any).equipo_local.nombre}
                                        </div>
                                        {editandoPartido === partido.id ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={golesLocal ?? ''}
                                                    onChange={(e) => setGolesLocal(parseInt(e.target.value))}
                                                    className="w-12 text-center border rounded"
                                                />
                                                <span>-</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={golesVisitante ?? ''}
                                                    onChange={(e) => setGolesVisitante(parseInt(e.target.value))}
                                                    className="w-12 text-center border rounded"
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-center font-bold">
                                                {golesLocal !== null && golesVisitante !== null 
                                                    ? `${golesLocal} - ${golesVisitante}`
                                                    : 'VS'
                                                }
                                            </div>
                                        )}
                                        <div className="text-left">
                                            {(partido as any).equipo_visitante.nombre}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {role === 'vocal' && (
                                <div className="flex space-x-2">
                                    {editandoPartido === partido.id ? (
                                        <>
                                            <button
                                                onClick={() => guardarResultado(partido.id)}
                                                className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                                            >
                                                <Save className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditandoPartido(null)
                                                    setGolesLocal(null)
                                                    setGolesVisitante(null)
                                                }}
                                                className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setEditandoPartido(partido.id)}
                                            className="p-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
