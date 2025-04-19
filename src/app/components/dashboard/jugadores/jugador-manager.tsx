'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Plus, Pencil, Trash2, AlertCircle } from 'lucide-react'

interface Jugador {
    id: string
    nombre: string
    cedula: string
    fecha_nacimiento: string
    numero_camiseta: number
    posicion: string
    equipo_id: string
    estado: 'activo' | 'sancionado' | 'inactivo'
    foto_url?: string
}

export function JugadorManager({ equipoId }: { equipoId: string }) {
    const [jugadores, setJugadores] = useState<Jugador[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [showNewJugador, setShowNewJugador] = useState(false)
    const [nuevoJugador, setNuevoJugador] = useState<Omit<Jugador, 'id'>>({
        nombre: '',
        cedula: '',
        fecha_nacimiento: '',
        numero_camiseta: 0,
        posicion: '',
        equipo_id: equipoId,
        estado: 'activo'
    })
    const [fotoFile, setFotoFile] = useState<File | null>(null)

    const supabase = createClientComponentClient()

    useEffect(() => {
        cargarJugadores()
    }, [equipoId])

    async function cargarJugadores() {
        try {
            setError('')
            const { data: jugadoresData, error: jugadoresError } = await supabase
                .from('jugadores')
                .select('*')
                .eq('equipo_id', equipoId)

            if (jugadoresError) {
                setError('Error al cargar jugadores: ' + jugadoresError.message)
                return
            }

            if (jugadoresData) {
                setJugadores(jugadoresData)
            }
        } catch (err) {
            setError('Error inesperado: ' + (err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    async function validarCedula(cedula: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('jugadores')
            .select('id')
            .eq('cedula', cedula)
            .single()

        if (error) return true // En caso de error, permitimos continuar
        return !data // Si no hay datos, la cédula es válida
    }

    async function subirFoto(jugadorId: string): Promise<string | null> {
        if (!fotoFile) return null

        const fileExt = fotoFile.name.split('.').pop()
        const fileName = `${jugadorId}.${fileExt}`
        const filePath = `jugadores/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('fotos')
            .upload(filePath, fotoFile)

        if (uploadError) {
            throw new Error('Error al subir la foto: ' + uploadError.message)
        }

        const { data } = supabase.storage
            .from('fotos')
            .getPublicUrl(filePath)

        return data.publicUrl
    }

    async function crearJugador() {
        try {
            setError('')
            setSuccessMessage('')

            // Validaciones
            if (!nuevoJugador.nombre) {
                setError('El nombre es requerido')
                return
            }
            if (!nuevoJugador.cedula) {
                setError('La cédula es requerida')
                return
            }
            if (!nuevoJugador.fecha_nacimiento) {
                setError('La fecha de nacimiento es requerida')
                return
            }
            if (!nuevoJugador.posicion) {
                setError('La posición es requerida')
                return
            }

            // Validar cédula única
            const cedulaValida = await validarCedula(nuevoJugador.cedula)
            if (!cedulaValida) {
                setError('Ya existe un jugador con esta cédula')
                return
            }

            // Crear jugador
            const { data: jugador, error: createError } = await supabase
                .from('jugadores')
                .insert([nuevoJugador])
                .select()
                .single()

            if (createError) {
                setError('Error al crear jugador: ' + createError.message)
                return
            }

            // Subir foto si existe
            if (jugador && fotoFile) {
                try {
                    const fotoUrl = await subirFoto(jugador.id)
                    if (fotoUrl) {
                        await supabase
                            .from('jugadores')
                            .update({ foto_url: fotoUrl })
                            .eq('id', jugador.id)
                    }
                } catch (err) {
                    console.error('Error al subir la foto:', err)
                    // Continuamos aunque la foto falle
                }
            }

            setSuccessMessage('Jugador creado exitosamente')
            setShowNewJugador(false)
            setNuevoJugador({
                nombre: '',
                cedula: '',
                fecha_nacimiento: '',
                numero_camiseta: 0,
                posicion: '',
                equipo_id: equipoId,
                estado: 'activo'
            })
            setFotoFile(null)
            await cargarJugadores()
        } catch (err) {
            setError('Error inesperado: ' + (err as Error).message)
        }
    }

    if (loading) return <div>Cargando jugadores...</div>

    return (
        <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Jugadores del Equipo</h3>
                <button
                    onClick={() => setShowNewJugador(true)}
                    className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Jugador
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

            {showNewJugador && (
                <div className="mb-6 p-4 border rounded-lg">
                    <h4 className="text-lg font-medium mb-4">Nuevo Jugador</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                            <input
                                type="text"
                                value={nuevoJugador.nombre}
                                onChange={(e) => setNuevoJugador({...nuevoJugador, nombre: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cédula</label>
                            <input
                                type="text"
                                value={nuevoJugador.cedula}
                                onChange={(e) => setNuevoJugador({...nuevoJugador, cedula: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                value={nuevoJugador.fecha_nacimiento}
                                onChange={(e) => setNuevoJugador({...nuevoJugador, fecha_nacimiento: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Número de Camiseta</label>
                            <input
                                type="number"
                                value={nuevoJugador.numero_camiseta || ''}
                                onChange={(e) => setNuevoJugador({...nuevoJugador, numero_camiseta: parseInt(e.target.value)})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Posición</label>
                            <select
                                value={nuevoJugador.posicion}
                                onChange={(e) => setNuevoJugador({...nuevoJugador, posicion: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Seleccionar posición</option>
                                <option value="portero">Portero</option>
                                <option value="defensa">Defensa</option>
                                <option value="mediocampista">Mediocampista</option>
                                <option value="delantero">Delantero</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Foto</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFotoFile(e.target.files?.[0] || null)}
                                className="mt-1 block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-indigo-50 file:text-indigo-700
                                    hover:file:bg-indigo-100"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-3">
                        <button
                            onClick={() => setShowNewJugador(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={crearJugador}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Crear Jugador
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jugadores.map((jugador) => (
                    <div key={jugador.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center space-x-3">
                                    {jugador.foto_url && (
                                        <img 
                                            src={jugador.foto_url} 
                                            alt={jugador.nombre}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    )}
                                    <div>
                                        <h4 className="font-medium">{jugador.nombre}</h4>
                                        <p className="text-sm text-gray-500">#{jugador.numero_camiseta} - {jugador.posicion}</p>
                                    </div>
                                </div>
                                <p className="mt-2 text-sm text-gray-600">CI: {jugador.cedula}</p>
                                <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    jugador.estado === 'activo' ? 'bg-green-100 text-green-800' :
                                    jugador.estado === 'sancionado' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {jugador.estado.charAt(0).toUpperCase() + jugador.estado.slice(1)}
                                </span>
                            </div>
                            <div className="flex space-x-2">
                                <button className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-full">
                                    <Pencil className="w-4 h-4" />
                                </button>
                                {jugador.estado === 'activo' && (
                                    <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-full">
                                        <AlertCircle className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
