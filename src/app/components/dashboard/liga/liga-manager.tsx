'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Save, Edit2, Plus, Check, X } from 'lucide-react'

interface Liga {
    id: string
    nombre: string
    descripcion: string | null
    presidente_id: string
    created_at: string
}

interface Equipo {
    id: string
    nombre: string
    liga_id: string
    aprobado: boolean
    representante_id: string
}

export function LigaManager() {
    const [liga, setLiga] = useState<Liga | null>(null)
    const [equiposPendientes, setEquiposPendientes] = useState<Equipo[]>([])
    const [editando, setEditando] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: ''
    })

    const supabase = createClientComponentClient()

    useEffect(() => {
        cargarDatos()
    }, [])

    async function cargarDatos() {
        try {
            setLoading(true)
            setError('')

            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setError('No hay sesión activa')
                return
            }

            // Cargar datos de la liga
            const { data: ligaData, error: ligaError } = await supabase
                .from('ligas')
                .select('*')
                .eq('presidente_id', session.user.id)
                .maybeSingle()

            if (ligaError) throw ligaError

            if (ligaData) {
                setLiga(ligaData)
                setFormData({
                    nombre: ligaData.nombre,
                    descripcion: ligaData.descripcion || ''
                })

                // Cargar equipos pendientes de aprobación
                const { data: equiposData, error: equiposError } = await supabase
                    .from('equipos')
                    .select('*')
                    .eq('liga_id', ligaData.id)
                    .eq('aprobado', false)

                if (equiposError) throw equiposError
                setEquiposPendientes(equiposData || [])
            } else {
                setLiga(null)
                setEquiposPendientes([])
            }

        } catch (err) {
            setError('Error al cargar datos: ' + (err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    async function guardarLiga() {
        try {
            setError('')
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setError('No hay sesión activa')
                return
            }

            if (liga) {
                // Actualizar liga existente
                const { error } = await supabase
                    .from('ligas')
                    .update({
                        nombre: formData.nombre,
                        descripcion: formData.descripcion || null
                    })
                    .eq('id', liga.id)

                if (error) throw error
                setSuccessMessage('Liga actualizada exitosamente')
            } else {
                // Verificar si ya existe una liga para este presidente
                const { data: existingLiga, error: checkError } = await supabase
                    .from('ligas')
                    .select('id')
                    .eq('presidente_id', session.user.id)
                    .maybeSingle()

                if (checkError) throw checkError

                if (existingLiga) {
                    setError('Ya tienes una liga creada')
                    return
                }

                // Crear nueva liga
                const { error } = await supabase
                    .from('ligas')
                    .insert([
                        {
                            nombre: formData.nombre,
                            descripcion: formData.descripcion || null,
                            presidente_id: session.user.id
                        }
                    ])

                if (error) throw error
                setSuccessMessage('Liga creada exitosamente')
            }

            await cargarDatos()
            setEditando(false)

        } catch (err) {
            setError('Error al guardar: ' + (err as Error).message)
        }
    }

    async function aprobarEquipo(equipoId: string) {
        try {
            const { error } = await supabase
                .from('equipos')
                .update({ aprobado: true })
                .eq('id', equipoId)

            if (error) throw error
            setSuccessMessage('Equipo aprobado exitosamente')
            await cargarDatos()
        } catch (err) {
            setError('Error al aprobar equipo: ' + (err as Error).message)
        }
    }

    async function rechazarEquipo(equipoId: string) {
        try {
            const { error } = await supabase
                .from('equipos')
                .delete()
                .eq('id', equipoId)

            if (error) throw error
            setSuccessMessage('Equipo rechazado exitosamente')
            await cargarDatos()
        } catch (err) {
            setError('Error al rechazar equipo: ' + (err as Error).message)
        }
    }

    if (loading) {
        return <div>Cargando...</div>
    }

    return (
        <div className="space-y-8">
            <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Gestión de Liga</h2>

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

                {!editando ? (
                    <div>
                        {liga ? (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700">Nombre de la Liga</h3>
                                    <p className="text-gray-600">{liga.nombre}</p>
                                </div>
                                {liga.descripcion && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700">Descripción</h3>
                                        <p className="text-gray-600">{liga.descripcion}</p>
                                    </div>
                                )}
                                <button
                                    onClick={() => setEditando(true)}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Editar Liga
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setEditando(true)}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Crear Liga
                            </button>
                        )}
                    </div>
                ) : (
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        guardarLiga()
                    }} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Nombre de la Liga
                            </label>
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Descripción
                            </label>
                            <textarea
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => setEditando(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Guardar
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {liga && (
                <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Equipos Pendientes de Aprobación</h2>
                    {equiposPendientes.length === 0 ? (
                        <p className="text-gray-600">No hay equipos pendientes de aprobación</p>
                    ) : (
                        <div className="space-y-4">
                            {equiposPendientes.map(equipo => (
                                <div key={equipo.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <span className="font-medium">{equipo.nombre}</span>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => aprobarEquipo(equipo.id)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                                            title="Aprobar"
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => rechazarEquipo(equipo.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                                            title="Rechazar"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
