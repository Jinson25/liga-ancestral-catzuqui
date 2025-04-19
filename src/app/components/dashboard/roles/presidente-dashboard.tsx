'use client'

import { useState } from 'react'
import { User } from '@/app/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TemporadaManager } from '../temporadas/temporada-manager'
import { AprobacionManager } from '../aprobacion/aprobacion-manager'
import { PartidoManager } from '../partidos/partido-manager'
import { EstadisticasManager } from '../estadisticas/estadisticas-manager'

interface PresidenteDashboardProps {
    user: User
}

export function PresidenteDashboard({ user }: PresidenteDashboardProps) {
    const [activeTab, setActiveTab] = useState('temporadas')

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">Panel de Presidente</h1>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 w-full max-w-2xl mb-6">
                    <TabsTrigger value="temporadas">
                        Temporadas
                    </TabsTrigger>
                    <TabsTrigger value="aprobaciones">
                        Aprobaciones
                    </TabsTrigger>
                    <TabsTrigger value="partidos">
                        Partidos
                    </TabsTrigger>
                    <TabsTrigger value="estadisticas">
                        Estadísticas
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="temporadas" className="space-y-4">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Gestión de Temporadas</h2>
                        <TemporadaManager />
                    </div>
                </TabsContent>

                <TabsContent value="aprobaciones" className="space-y-4">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Aprobaciones Pendientes</h2>
                        <AprobacionManager />
                    </div>
                </TabsContent>

                <TabsContent value="partidos" className="space-y-4">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Gestión de Partidos</h2>
                        <PartidoManager />
                    </div>
                </TabsContent>

                <TabsContent value="estadisticas" className="space-y-4">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Estadísticas Generales</h2>
                        <EstadisticasManager />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
