'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Plus, AlertCircle } from 'lucide-react'

interface Equipo {
    id: string
    nombre: string
    liga_id: string
    aprobado: boolean
    representante_id: string
}

interface Liga {
    id: string
    presidente_id: string
}

export default function EquipoManager({ ligaId }: { ligaId: string }) {
    const [equipos, setEquipos] = useState<Equipo[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [showNuevoEquipo, setShowNuevoEquipo] = useState(false)
    const [nuevoEquipo, setNuevoEquipo] = useState({
        nombre: ''
    })
    const supabase = createClientComponentClient()

    useEffect(() => {
        cargarEquipos()
    }, [ligaId])

    async function cargarEquipos() {
        try {
            setLoading(true)
            setError('')

            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setError('No hay sesión activa')
                return
            }

            const { data: equiposData, error: equiposError } = await supabase
                .from('equipos')
                .select('*')
                .eq('liga_id', ligaId)
                .eq('representante_id', session.user.id)
                .order('nombre')

            if (equiposError) {
                setError('Error al cargar equipos: ' + equiposError.message)
                return
            }

            setEquipos(equiposData || [])
        } catch (err) {
            setError('Error inesperado: ' + (err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    async function crearEquipo() {
        try {
            setError('')
            setSuccessMessage('')

            if (!nuevoEquipo.nombre) {
                setError('El nombre es requerido')
                return
            }

            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setError('No hay sesión activa')
                return
            }

            // Obtener la liga
            const { data: ligaData, error: ligaError } = await supabase
                .from('ligas')
                .select('id, presidente_id')
                .single()

            if (ligaError) {
                setError('No se encontró una liga activa')
                return
            }

            // Verificar si el usuario es el presidente
            const esPresidente = ligaData.presidente_id === session.user.id

            const { data: equipo, error: createError } = await supabase
                .from('equipos')
                .insert([{
                    nombre: nuevoEquipo.nombre,
                    liga_id: ligaId,
                    aprobado: esPresidente,
                    representante_id: session.user.id
                }])
                .select()
                .single()

            if (createError) {
                setError('Error al crear equipo: ' + createError.message)
                return
            }

            setSuccessMessage('Equipo creado exitosamente' + (esPresidente ? '' : '. Pendiente de aprobación'))
            setShowNuevoEquipo(false)
            setNuevoEquipo({
                nombre: ''
            })
            await cargarEquipos()
        } catch (err) {
            setError('Error inesperado: ' + (err as Error).message)
        }
    }

    if (loading) {
        return (
            <div className="animate-pulse p-6">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Mis Equipos</h3>
                <button
                    onClick={() => setShowNuevoEquipo(true)}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Equipo
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

            {showNuevoEquipo && (
                <div className="mb-6 p-4 border rounded-lg">
                    <h4 className="text-lg font-medium mb-4">Nuevo Equipo</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre del Equipo</label>
                            <input
                                type="text"
                                value={nuevoEquipo.nombre}
                                onChange={(e) => setNuevoEquipo({...nuevoEquipo, nombre: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                placeholder="Ejemplo: Los Tigres"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-3">
                        <button
                            onClick={() => setShowNuevoEquipo(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={crearEquipo}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            Crear Equipo
                        </button>
                    </div>
                </div>
            )}

            {equipos.length === 0 ? (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                        <AlertCircle className="w-6 h-6 text-gray-600" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">No tienes equipos</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Crea un nuevo equipo para participar en la liga.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {equipos.map((equipo) => (
                        <div key={equipo.id} className="border rounded-lg p-4">
                            <h4 className="font-medium">{equipo.nombre}</h4>
                            <div className="mt-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    equipo.aprobado
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {equipo.aprobado ? 'Aprobado' : 'Pendiente'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
