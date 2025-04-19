'use client'

import { useState } from 'react'
import { User } from '@/app/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { JugadorManager } from '../jugadores/jugador-manager'
import { PartidoManager } from '../partidos/partido-manager'

interface VocalDashboardProps {
    user: User
}

export function VocalDashboard({ user }: VocalDashboardProps) {
    const [activeTab, setActiveTab] = useState('jugadores')

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">Panel de Vocal</h1>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
                    <TabsTrigger value="jugadores">
                        Jugadores
                    </TabsTrigger>
                    <TabsTrigger value="partidos">
                        Partidos
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="jugadores" className="space-y-4">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Gestión de Jugadores</h2>
                        <JugadorManager equipoId={user.equipo_id || ''} />
                    </div>
                </TabsContent>

                <TabsContent value="partidos" className="space-y-4">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Registro de Resultados</h2>
                        <PartidoManager role="vocal" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
