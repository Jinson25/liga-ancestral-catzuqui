'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DashboardContent } from "./dashboard-content"

export function DashboardPage() {
    return (
        <div className="max-w-7xl mx-auto mt-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Panel de Control</h1>
            <DashboardContent />
        </div>
    )
}
