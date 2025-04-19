'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Plus, X } from 'lucide-react'

interface Equipo {
    id: string
    nombre: string
    estado: string
}

interface EquipoResponse {
    id: string
    equipo_id: string
    temporada_id: string
    equipo: {
        id: string
        nombre: string
        estado: string
    }
}

interface EquipoTemporada {
    id: string
    equipo_id: string
    temporada_id: string
    equipo: Equipo
}

export default function TemporadaEquipos({ temporadaId, ligaId }: { temporadaId: string, ligaId: string }) {
    const [equiposDisponibles, setEquiposDisponibles] = useState<Equipo[]>([])
    const [equiposTemporada, setEquiposTemporada] = useState<EquipoTemporada[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [showAgregarEquipo, setShowAgregarEquipo] = useState(false)
    const [equipoSeleccionado, setEquipoSeleccionado] = useState('')

    const supabase = createClientComponentClient()

    useEffect(() => {
        cargarDatos()
    }, [temporadaId])

    async function cargarDatos() {
        try {
            setError('')
            // Cargar equipos de la temporada
            const { data: equiposTemp, error: errorEquiposTemp } = await supabase
                .from('equipos_temporada')
                .select(`
                    id,
                    equipo_id,
                    temporada_id,
                    equipo:equipos (
                        id,
                        nombre,
                        estado
                    )
                `)
                .eq('temporada_id', temporadaId)

            if (errorEquiposTemp) {
                setError('Error al cargar equipos de la temporada: ' + errorEquiposTemp.message)
                return
            }

            // Cargar todos los equipos de la liga
            const { data: todosEquipos, error: errorTodosEquipos } = await supabase
                .from('equipos')
                .select('*')
                .eq('liga_id', ligaId)
                .eq('estado', 'activo')

            if (errorTodosEquipos) {
                setError('Error al cargar equipos: ' + errorTodosEquipos.message)
                return
            }

            if (equiposTemp && todosEquipos) {
                const equiposTemporadaData = (equiposTemp as any[]).map(et => ({
                    id: et.id,
                    equipo_id: et.equipo_id,
                    temporada_id: et.temporada_id,
                    equipo: Array.isArray(et.equipo) ? et.equipo[0] : et.equipo
                }))
                setEquiposTemporada(equiposTemporadaData)
                // Filtrar equipos que no están en la temporada
                const equiposIds = new Set(equiposTemp.map(et => et.equipo_id))
                setEquiposDisponibles(todosEquipos.filter(e => !equiposIds.has(e.id)))
            }
        } catch (err) {
            setError('Error inesperado: ' + (err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    async function agregarEquipo() {
        try {
            setError('')
            setSuccessMessage('')

            if (!equipoSeleccionado) {
                setError('Debes seleccionar un equipo')
                return
            }

            const { error } = await supabase
                .from('equipos_temporada')
                .insert([
                    {
                        temporada_id: temporadaId,
                        equipo_id: equipoSeleccionado
                    }
                ])

            if (error) {
                setError('Error al agregar equipo: ' + error.message)
                return
            }

            setSuccessMessage('Equipo agregado exitosamente')
            setShowAgregarEquipo(false)
            setEquipoSeleccionado('')
            await cargarDatos()
        } catch (err) {
            setError('Error inesperado: ' + (err as Error).message)
        }
    }

    async function removerEquipo(equipoTemporadaId: string) {
        if (!confirm('¿Estás seguro de remover este equipo de la temporada?')) return

        try {
            const { error } = await supabase
                .from('equipos_temporada')
                .delete()
                .eq('id', equipoTemporadaId)

            if (error) {
                setError('Error al remover equipo: ' + error.message)
                return
            }

            setSuccessMessage('Equipo removido exitosamente')
            await cargarDatos()
        } catch (err) {
            setError('Error inesperado: ' + (err as Error).message)
        }
    }

    if (loading) return <div>Cargando equipos...</div>

    return (
        <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Equipos en la Temporada</h3>
                <button
                    onClick={() => setShowAgregarEquipo(true)}
                    className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    disabled={equiposDisponibles.length === 0}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Equipo
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                    {successMessage}
                </div>
            )}

            {showAgregarEquipo && (
                <div className="mb-6 p-4 border rounded-lg">
                    <h4 className="text-lg font-medium mb-4">Agregar Equipo a la Temporada</h4>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Equipo</label>
                        <select
                            value={equipoSeleccionado}
                            onChange={(e) => setEquipoSeleccionado(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="">Seleccionar equipo</option>
                            {equiposDisponibles.map(equipo => (
                                <option key={equipo.id} value={equipo.id}>
                                    {equipo.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mt-4 flex justify-end space-x-3">
                        <button
                            onClick={() => setShowAgregarEquipo(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={agregarEquipo}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Agregar
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {equiposTemporada.map((et) => (
                    <div key={et.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-medium">{et.equipo.nombre}</h4>
                                <p className="text-sm text-gray-500">Estado: {et.equipo.estado}</p>
                            </div>
                            <button 
                                className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-full"
                                onClick={() => removerEquipo(et.id)}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {equiposTemporada.length === 0 && (
                <div className="text-center text-gray-500 mt-4">
                    No hay equipos en esta temporada
                </div>
            )}
        </div>
    )
}
