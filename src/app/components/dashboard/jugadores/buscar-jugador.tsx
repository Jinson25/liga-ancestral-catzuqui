'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Search } from 'lucide-react'
import { Jugador } from '@/app/types'

export default function BuscarJugador() {
    const [cedula, setCedula] = useState('')
    const [jugador, setJugador] = useState<Jugador | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const supabase = createClientComponentClient()

    async function buscarJugador(e: React.FormEvent) {
        e.preventDefault()
        try {
            setLoading(true)
            setError('')
            setJugador(null)

            const { data, error: searchError } = await supabase
                .from('jugadores')
                .select(`
                    *,
                    equipo:equipos (
                        nombre
                    )
                `)
                .eq('cedula', cedula)
                .single()

            if (searchError) throw searchError

            if (!data) {
                setError('No se encontró ningún jugador con esa cédula')
                return
            }

            setJugador(data)

        } catch (err) {
            setError('Error al buscar jugador: ' + (err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <form onSubmit={buscarJugador} className="flex gap-2">
                <input
                    type="text"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    placeholder="Ingrese número de cédula"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                </button>
            </form>

            {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {jugador && (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-start space-x-4">
                        {jugador.foto_url && (
                            <img
                                src={jugador.foto_url}
                                alt={`${jugador.nombres} ${jugador.apellidos}`}
                                className="w-24 h-24 object-cover rounded-lg"
                            />
                        )}
                        <div>
                            <h3 className="text-lg font-medium">
                                {jugador.nombres} {jugador.apellidos}
                            </h3>
                            <p className="text-gray-500">Cédula: {jugador.cedula}</p>
                            <p className="text-gray-500">
                                Equipo: {(jugador as any).equipo?.nombre || 'No asignado'}
                            </p>
                            <p className="text-gray-500">
                                Estado: {jugador.estado}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
