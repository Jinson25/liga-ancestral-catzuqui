'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Equipo, FormatoTemporada, Temporada } from '@/app/types'
import { Plus, Save, Calendar } from 'lucide-react'

interface TemporadaForm {
    nombre: string
    fecha_inicio: string
    formato: {
        tipo: 'todos_contra_todos' | 'grupos' | 'eliminatoria'
        num_vueltas: number
        num_grupos?: number
        equipos_por_grupo?: number
        equipos_clasifican?: number
    }
}

export function TemporadaManager() {
    const [temporadas, setTemporadas] = useState<Temporada[]>([])
    const [equiposDisponibles, setEquiposDisponibles] = useState<Equipo[]>([])
    const [equiposSeleccionados, setEquiposSeleccionados] = useState<string[]>([])
    const [creando, setCreando] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [formData, setFormData] = useState<TemporadaForm>({
        nombre: '',
        fecha_inicio: new Date().toISOString().split('T')[0],
        formato: {
            tipo: 'todos_contra_todos',
            num_vueltas: 1
        }
    })

    const supabase = createClientComponentClient()

    useEffect(() => {
        cargarDatos()
    }, [])

    async function cargarDatos() {
        try {
            setLoading(true)
            setError('')

            // Cargar temporadas
            const { data: temporadasData, error: temporadasError } = await supabase
                .from('temporadas')
                .select('*')
                .order('fecha_inicio', { ascending: false })

            if (temporadasError) throw temporadasError
            setTemporadas(temporadasData || [])

            // Cargar equipos aprobados
            const { data: equiposData, error: equiposError } = await supabase
                .from('equipos')
                .select('*')
                .eq('aprobado', true)

            if (equiposError) throw equiposError
            setEquiposDisponibles(equiposData || [])

        } catch (err) {
            setError('Error al cargar datos: ' + (err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    async function crearTemporada() {
        try {
            if (equiposSeleccionados.length < 2) {
                setError('Se necesitan al menos 2 equipos para crear una temporada')
                return
            }

            const { data: temporada, error: createError } = await supabase
                .from('temporadas')
                .insert([{
                    nombre: formData.nombre,
                    fecha_inicio: formData.fecha_inicio,
                    estado: 'preparacion',
                    formato: formData.formato
                }])
                .select()
                .single()

            if (createError) throw createError

            // Asociar equipos a la temporada
            const { error: equiposError } = await supabase
                .from('temporada_equipos')
                .insert(
                    equiposSeleccionados.map(equipoId => ({
                        temporada_id: temporada.id,
                        equipo_id: equipoId
                    }))
                )

            if (equiposError) throw equiposError

            // Generar fixture
            await generarFixture(temporada.id, equiposSeleccionados, formData.formato)

            setSuccessMessage('Temporada creada exitosamente')
            setCreando(false)
            await cargarDatos()

        } catch (err) {
            setError('Error al crear temporada: ' + (err as Error).message)
        }
    }

    async function generarFixture(temporadaId: string, equipos: string[], formato: FormatoTemporada) {
        const partidos = []
        const fechaInicio = new Date(formData.fecha_inicio)

        const numVueltas = formato?.num_vueltas ?? 1;

        if (formato.tipo === 'todos_contra_todos') {
            for (let vuelta = 0; vuelta < numVueltas; vuelta++) {
                for (let i = 0; i < equipos.length - 1; i++) {
                    for (let j = i + 1; j < equipos.length; j++) {
                        const fecha = new Date(fechaInicio)
                        fecha.setDate(fechaInicio.getDate() + (Math.floor(partidos.length / 2) * 7))
                        
                        // Alternar entre sábado y domingo
                        if (partidos.length % 2 === 1) {
                            fecha.setDate(fecha.getDate() + 1)
                        }

                        partidos.push({
                            temporada_id: temporadaId,
                            equipo_local_id: vuelta % 2 === 0 ? equipos[i] : equipos[j],
                            equipo_visitante_id: vuelta % 2 === 0 ? equipos[j] : equipos[i],
                            fecha: fecha.toISOString().split('T')[0],
                            hora: ['09:00', '11:00', '13:00', '15:00'][Math.floor(Math.random() * 4)],
                            estado: 'programado',
                            fase: `Fecha ${Math.floor(partidos.length / 2) + 1}`
                        })
                    }
                }
            }
        }

        const { error } = await supabase
            .from('partidos')
            .insert(partidos)

        if (error) throw error
    }

    if (loading) {
        return <div>Cargando...</div>
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="p-4 bg-green-100 text-green-700 rounded-md">
                    {successMessage}
                </div>
            )}

            {!creando ? (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Temporadas</h3>
                        <button
                            onClick={() => setCreando(true)}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Temporada
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {temporadas.map(temporada => (
                            <div key={temporada.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-medium">{temporada.nombre}</h4>
                                        <p className="text-sm text-gray-500">
                                            Inicio: {new Date(temporada.fecha_inicio).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Estado: {temporada.estado}
                                        </p>
                                    </div>
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <form onSubmit={(e) => {
                    e.preventDefault()
                    crearTemporada()
                }} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Nombre de la Temporada
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
                            Fecha de Inicio
                        </label>
                        <input
                            type="date"
                            value={formData.fecha_inicio}
                            onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Formato
                        </label>
                        <select
                            value={formData.formato.tipo}
                            onChange={(e) => setFormData({
                                ...formData,
                                formato: {
                                    ...formData.formato,
                                    tipo: e.target.value as 'todos_contra_todos' | 'grupos' | 'eliminatoria'
                                }
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="todos_contra_todos">Todos contra todos</option>
                            <option value="grupos">Grupos</option>
                            <option value="eliminatoria">Eliminatoria directa</option>
                        </select>
                    </div>

                    {formData.formato.tipo === 'todos_contra_todos' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Número de Vueltas
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="4"
                                value={formData.formato.num_vueltas}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    formato: {
                                        ...formData.formato,
                                        num_vueltas: parseInt(e.target.value)
                                    }
                                })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Seleccionar Equipos
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            {equiposDisponibles.map(equipo => (
                                <label key={equipo.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={equiposSeleccionados.includes(equipo.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setEquiposSeleccionados([...equiposSeleccionados, equipo.id])
                                            } else {
                                                setEquiposSeleccionados(
                                                    equiposSeleccionados.filter(id => id !== equipo.id)
                                                )
                                            }
                                        }}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>{equipo.nombre}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={() => setCreando(false)}
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
    )
}
