'use client'

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"

export default function GestionarLiga() {
    const [loading, setLoading] = useState(true)
    const supabase = createClientComponentClient()

    useEffect(() => {
        async function fetchLiga() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const { data, error } = await supabase
                .from('ligas')
                .select('*')
                .eq('presidente_id', session.user.id)
                .single()

            if (!error && data) {
                // Por ahora solo verificamos si existe la liga
                console.log('Liga encontrada:', data)
            }
            setLoading(false)
        }

        fetchLiga()
    }, [supabase])

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-5">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                    Panel de Control de Liga
                </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Tarjeta de Temporada Actual */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Temporada Actual
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            2025
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <a href="/dashboard/temporadas" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Ver detalles
                            </a>
                        </div>
                    </div>
                </div>

                {/* Tarjeta de Equipos */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Equipos Registrados
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            12
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <a href="/dashboard/equipos" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Gestionar equipos
                            </a>
                        </div>
                    </div>
                </div>

                {/* Tarjeta de Próximos Partidos */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Próximos Partidos
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            5
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <a href="/dashboard/partidos" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Ver calendario
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="mt-8">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Acciones Rápidas</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Crear Nueva Temporada
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        Aprobar Equipos
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                        Generar Calendario
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                        Gestionar Categorías
                    </button>
                </div>
            </div>
        </div>
    )
}
