'use client'

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"
import Image from "next/image"
import { Trophy, Users, Calendar, ClipboardCheck, Settings } from 'lucide-react'
import Link from "next/link"

interface UserProfile {
    id: string
    nombre: string
    correo: string
    rol: 'presidente' | 'vocal' | 'equipo'
}

interface QuickAction {
    title: string
    href: string
    icon: React.ReactNode
    color: string
}

export default function Perfil() {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClientComponentClient()

    const quickActions: QuickAction[] = [
        {
            title: "Gestionar Liga",
            href: "/dashboard/liga",
            icon: <Trophy className="h-6 w-6" />,
            color: "bg-indigo-600 hover:bg-indigo-700"
        },
        {
            title: "Gestionar Equipos",
            href: "/dashboard/equipos",
            icon: <Users className="h-6 w-6" />,
            color: "bg-green-600 hover:bg-green-700"
        },
        {
            title: "Gestionar Temporadas",
            href: "/dashboard/temporadas",
            icon: <Calendar className="h-6 w-6" />,
            color: "bg-yellow-600 hover:bg-yellow-700"
        },
        {
            title: "Gestionar Partidos",
            href: "/dashboard/partidos",
            icon: <ClipboardCheck className="h-6 w-6" />,
            color: "bg-purple-600 hover:bg-purple-700"
        }
    ]

    useEffect(() => {
        async function loadProfile() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', session.user.id)
                .single()

            if (!error && data) {
                setProfile(data)
            }
            setLoading(false)
        }

        loadProfile()
    }, [supabase])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 pt-16">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!profile) return null

    return (
        <div className="min-h-screen bg-gray-100 pt-16">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                    {/* Portada */}
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                    
                    {/* Información del perfil */}
                    <div className="relative px-8 -mt-16">
                        <div className="flex flex-col sm:flex-row items-center">
                            <div className="flex-shrink-0">
                                <Image
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.nombre)}&background=random&size=128`}
                                    alt={profile.nombre}
                                    width={128}
                                    height={128}
                                    className="rounded-full ring-4 ring-white"
                                />
                            </div>
                            <div className="mt-6 sm:mt-0 sm:ml-6 text-center sm:text-left">
                                <h2 className="text-2xl font-bold text-gray-900">{profile.nombre}</h2>
                                <p className="text-sm text-gray-500">{profile.correo}</p>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mt-2">
                                    {profile.rol.charAt(0).toUpperCase() + profile.rol.slice(1)}
                                </span>
                            </div>
                        </div>

                        {/* Acciones rápidas para presidentes */}
                        {profile.rol === 'presidente' && (
                            <div className="mt-8 border-t border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-4">
                                    Acciones de Administración
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    {quickActions.map((action) => (
                                        <Link
                                            key={action.title}
                                            href={action.href}
                                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white ${action.color} transition-colors duration-200 hover:shadow-lg`}
                                        >
                                            {action.icon}
                                            <span>{action.title}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Información detallada */}
                        <div className="mt-8 border-t border-gray-200 pt-8 pb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Información de la cuenta</h3>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Nombre completo</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{profile.nombre}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Correo electrónico</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{profile.correo}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Rol en la liga</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {profile.rol.charAt(0).toUpperCase() + profile.rol.slice(1)}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Botón de editar */}
                        <div className="flex justify-end pb-6">
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <Settings className="h-4 w-4" />
                                Editar perfil
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
