'use client'

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"
import { RoleDashboard } from './role-dashboard'

export function DashboardContent() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    
    const supabase = createClientComponentClient()

    useEffect(() => {
        checkSession()
    }, [])

    async function checkSession() {
        try {
            setLoading(true)
            setError('')

            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setError('No hay sesión activa')
                return
            }

        } catch (err) {
            setError('Error al verificar sesión: ' + (err as Error).message)
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

    return <RoleDashboard />
}
