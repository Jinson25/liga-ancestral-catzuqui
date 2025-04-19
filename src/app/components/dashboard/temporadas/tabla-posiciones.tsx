import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { TablaPosicion } from '@/app/types'

export function TablaPosiciones() {
    const [posiciones, setPosiciones] = useState<TablaPosicion[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const supabase = createClientComponentClient()

    useEffect(() => {
        cargarPosiciones()
    }, [])

    async function cargarPosiciones() {
        try {
            setLoading(true)
            setError('')

            // Obtener la temporada activa
            const { data: temporadaData, error: temporadaError } = await supabase
                .from('temporadas')
                .select('id')
                .eq('estado', 'en_curso')
                .single()

            if (temporadaError) throw temporadaError

            // Cargar la tabla de posiciones
            const { data, error: posicionesError } = await supabase
                .from('tabla_posiciones')
                .select(`
                    *,
                    equipo:equipos (
                        nombre
                    )
                `)
                .eq('temporada_id', temporadaData.id)
                .order('puntos', { ascending: false })

            if (posicionesError) throw posicionesError
            setPosiciones(data || [])

        } catch (err) {
            setError('Error al cargar posiciones: ' + (err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div>Cargando tabla de posiciones...</div>
    }

    return (
        <div className="space-y-4">
            {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Pos
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Equipo
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                PJ
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                G
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                E
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                P
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                GF
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                GC
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                DG
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Pts
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {posiciones.map((posicion, index) => (
                            <tr key={posicion.equipo_id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {(posicion as any).equipo.nombre}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                    {posicion.partidos_jugados}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                    {posicion.ganados}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                    {posicion.empatados}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                    {posicion.perdidos}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                    {posicion.goles_favor}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                    {posicion.goles_contra}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                    {posicion.diferencia_goles}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-900">
                                    {posicion.puntos}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
