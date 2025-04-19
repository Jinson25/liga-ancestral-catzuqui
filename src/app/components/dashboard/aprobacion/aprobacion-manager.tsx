'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User, Equipo } from '@/app/types'
import { Check, X } from 'lucide-react'

export function AprobacionManager() {
    const [equipos, setEquipos] = useState<Equipo[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const supabase = createClientComponentClient()

    useEffect(() => {
        cargarEquiposPendientes()
    }, [])

    async function cargarEquiposPendientes() {
        try {
            setLoading(true)
            setError('')

            const { data, error: equiposError } = await supabase
                .from('equipos')
                .select(`
                    *,
                    representante:usuarios(
                        correo,
                        nombre
                    )
                `)
                .eq('aprobado', false)

            if (equiposError) throw equiposError
            setEquipos(data || [])

        } catch (err) {
            console.error('Error completo:', err)
            setError('Error al cargar equipos: ' + (err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    async function aprobarEquipo(equipoId: string) {
        try {
            const { error: updateError } = await supabase
                .from('equipos')
                .update({ aprobado: true })
                .eq('id', equipoId)

            if (updateError) throw updateError

            // Actualizar la lista después de aprobar
            await cargarEquiposPendientes()

        } catch (err) {
            setError('Error al aprobar equipo: ' + (err as Error).message)
        }
    }

    async function rechazarEquipo(equipoId: string) {
        try {
            const { error: deleteError } = await supabase
                .from('equipos')
                .delete()
                .eq('id', equipoId)

            if (deleteError) throw deleteError

            // Actualizar la lista después de rechazar
            await cargarEquiposPendientes()

        } catch (err) {
            setError('Error al rechazar equipo: ' + (err as Error).message)
        }
    }

    if (loading) return <div>Cargando...</div>
    if (error) return <div className="text-red-500">{error}</div>

    return (
        <div className="space-y-4">
            {equipos.length === 0 ? (
                <div className="text-gray-500">No hay equipos pendientes de aprobación</div>
            ) : (
                equipos.map(equipo => (
                    <div key={equipo.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold">
                                {equipo.nombre}
                            </h3>
                            <p className="text-gray-500">
                                Representante: {equipo.representante?.nombre} ({equipo.representante?.correo})
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => aprobarEquipo(equipo.id)}
                                className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                            >
                                <Check size={20} />
                            </button>
                            <button
                                onClick={() => rechazarEquipo(equipo.id)}
                                className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}
