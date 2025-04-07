'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
    const router = useRouter()

    useEffect(() => {
        // Redirigir a la página principal del dashboard de liga
        router.push('/dashboard/liga')
    }, [router])

    return null
}
