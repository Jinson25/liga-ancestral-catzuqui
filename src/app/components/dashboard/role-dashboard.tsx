'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User, UserRole } from '@/app/types'
import { PresidenteDashboard } from './roles/presidente-dashboard'
import { VocalDashboard } from './roles/vocal-dashboard'
import { EquipoDashboard } from './roles/equipo-dashboard'
import { PublicDashboard } from './roles/public-dashboard'

export function RoleDashboard() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    
    const supabase = createClientComponentClient()

    useEffect(() => {
        cargarUsuario()
    }, [])

    async function cargarUsuario() {
        try {
            setLoading(true)
            setError('')

            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                // Si no hay sesión, mostrar el dashboard público
                setUser(null)
                return
            }

            // Obtener el rol del usuario
            const { data: userData, error: userError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', session.user.id)
                .single()

            if (userError) throw userError

            setUser({
                id: session.user.id,
                correo: userData.correo,
                nombre: userData.nombre,
                rol: userData.rol || 'public'
            })

        } catch (err) {
            console.error('Error completo:', err)
            setError('Error al cargar usuario: ' + (err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div>Cargando...</div>
    }

    if (error) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded-md">
                {error}
            </div>
        )
    }

    // Si no hay usuario o no tiene rol, mostrar dashboard público
    if (!user) {
        return <PublicDashboard />
    }

    // Renderizar el dashboard según el rol
    switch (user.rol) {
        case 'presidente':
            return <PresidenteDashboard user={user} />
        case 'vocal':
            return <VocalDashboard user={user} />
        case 'equipo':
            return <EquipoDashboard user={user} />
        default:
            return <PublicDashboard />
    }
}
