'use client'

// Limpia imports y variables no usadas
import { Trophy, BadgeCheck, Hourglass, Medal, Shield, Star, UserCircle2 } from 'lucide-react'
import Image from "next/image"
import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface UserProfile {
    id: string
    nombre: string
    correo?: string
    rol: 'presidente' | 'vocal' | 'equipo'
    avatar_url?: string
}

export function ProfileContent() {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [equipos, setEquipos] = useState<any[]>([])
    const [equipoLoading, setEquipoLoading] = useState(true)
    const [googleAvatar, setGoogleAvatar] = useState<string | null>(null)
    const [correo, setCorreo] = useState<string | null>(null)
    const supabase = createClientComponentClient()

    useEffect(() => {
        async function loadProfile() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            setGoogleAvatar(null)
            setCorreo(null)
            if (session.user) {
                if (session.user.user_metadata && session.user.user_metadata.avatar_url) {
                    setGoogleAvatar(session.user.user_metadata.avatar_url)
                }
                if (session.user.email) {
                    setCorreo(session.user.email)
                }
            }

            const { data, error } = await supabase
                .from('perfiles')
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

    useEffect(() => {
        async function fetchEquipos() {
            setEquipoLoading(true)
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return
            const { data, error } = await supabase
                .from('equipos')
                .select('id, nombre, estado, categoria_id, categorias(nombre)')
                .eq('creado_por', session.user.id)
                .order('fecha_creacion', { ascending: false })
            if (!error && data) {
                setEquipos(data)
            }
            setEquipoLoading(false)
        }
        fetchEquipos()
    }, [supabase])

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-200 via-blue-100 to-blue-400 pt-16">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-32 bg-gradient-to-r from-blue-200 to-green-100 rounded-lg mb-4"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-blue-200 rounded w-3/4"></div>
                            <div className="h-4 bg-green-200 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    if (!profile) return null

    return (
        <div className=" pt-5 z-0 font-sans flex items-center justify-center">
            <div className="w-full max-w-7xl mx-auto sm:px-8 lg:px-14 z-0"> 
                <div className="bg-white rounded-3xl shadow-2xl border-4 border-blue-200 p-0 md:p-0 overflow-hidden">
                    {/* Portada y perfil */}
                    <div className="relative bg-gradient-to-r from-blue-700 via-teal-500 to-green-400 p-6 md:p-10 flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-10">
                        {/* Avatar */}
                        <div className="relative flex flex-col items-center md:items-start">
                            <div className="relative z-10">
                                {googleAvatar ? (
                                    <Image src={googleAvatar} alt={profile.nombre} width={128} height={128} className="rounded-full ring-4 ring-yellow-400 shadow-xl border-4 border-white object-cover" />
                                ) : (
                                    <Image src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.nombre)}&background=random&size=128`} alt={profile.nombre} width={128} height={128} className="rounded-full ring-4 ring-yellow-400 shadow-xl border-4 border-white object-cover" />
                                )}
                            </div>
                        </div>
                        {/* Info usuario */}
                        <div className="flex-1 flex flex-col items-center md:items-start">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-2 drop-shadow-lg">
                                <UserCircle2 className="w-7 h-7 text-yellow-300" />
                                {profile.nombre}
                            </h2>
                            {correo && (
                                <p className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-70 text-blue-900 mt-2 shadow">
                                    {correo}
                                </p>
                            )}
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mt-2 shadow">
                                {profile.rol.charAt(0).toUpperCase() + profile.rol.slice(1)}
                            </span>
                        </div>
                        {/* Iconos portada */}
                        <div className="absolute left-4 top-4 opacity-20"><Shield className="w-24 h-24 text-white" /></div>
                        <div className="absolute right-8 top-8 opacity-30"><Medal className="w-16 h-16 text-yellow-200" /></div>
                        <div className="absolute right-20 bottom-4 opacity-10"><Star className="w-12 h-12 text-white" /></div>
                    </div>
                    {/* Info y equipos */}
                    <div className="flex flex-col md:flex-row gap-8 px-6 md:px-10 py-10 bg-white">
                        {/* Info detallada */}
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2"><BadgeCheck className="w-5 h-5 text-blue-500"/>Información de la cuenta</h3>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
                                <div>
                                    <dt className="text-sm font-medium text-blue-500">Nombre completo</dt>
                                    <dd className="mt-1 text-lg text-blue-900 font-semibold">{profile.nombre}</dd>
                                </div>
                                {correo && (
                                    <div>
                                        <dt className="text-sm font-medium text-blue-500">Correo electrónico</dt>
                                        <dd className="mt-1 text-lg text-blue-900 font-semibold">{correo}</dd>
                                    </div>
                                )}
                                <div>
                                    <dt className="text-sm font-medium text-blue-500">Rol en la liga</dt>
                                    <dd className="mt-1 text-lg text-blue-900 font-semibold">
                                        {profile.rol.charAt(0).toUpperCase() + profile.rol.slice(1)}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                        {/* Equipos */}
                        <div className="flex-1">
                            <div className="border-b border-blue-100 pb-4 mb-6">
                                <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2"><Trophy className="w-6 h-6 text-yellow-500"/>Mis equipos</h3>
                            </div>
                            {equipoLoading ? (
                                <div className="text-gray-500">Cargando equipos...</div>
                            ) : equipos.length > 0 ? (
                                <div className="grid gap-4">
                                    {equipos.map((equipo) => (
                                        <div key={equipo.id} className="rounded-xl border-2 border-blue-200 p-5 bg-gradient-to-r from-blue-50 to-green-50 flex flex-col gap-2 shadow-lg">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl font-bold text-blue-900 tracking-wide uppercase">{equipo.nombre}</span>
                                                {equipo.estado === 'pendiente' && (
                                                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full"><Hourglass className="w-4 h-4 mr-1"/>En espera de aprobación</span>
                                                )}
                                                {equipo.estado === 'aprobado' && (
                                                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full"><BadgeCheck className="w-4 h-4 mr-1"/>Aprobado</span>
                                                )}
                                                {equipo.estado === 'rechazado' && (
                                                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Rechazado</span>
                                                )}
                                            </div>
                                            <div className="text-gray-700 text-sm">Categoría: <span className="font-semibold text-blue-700">{equipo.categorias?.nombre || 'Sin categoría'}</span></div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500">No has creado ningún equipo.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
