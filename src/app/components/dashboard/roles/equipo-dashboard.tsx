'use client'

import { useState } from 'react'
import { User } from '@/app/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { JugadorManager } from '@/app/components/dashboard/jugadores/jugador-manager'
import { TablaPosiciones } from '@/app/components/dashboard/temporadas/tabla-posiciones'
import { FixtureEquipo } from '@/app/components/dashboard/partidos/fixture-equipo'

interface EquipoDashboardProps {
    user: User
}

export function EquipoDashboard({ user }: EquipoDashboardProps) {
    const [activeTab, setActiveTab] = useState('jugadores')

    if (!user.equipo_id) {
        return (
            <div className="container mx-auto py-6">
                <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md">
                    No tienes un equipo asignado. Por favor, contacta al administrador.
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">Panel de Equipo</h1>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 w-full max-w-lg mb-6">
                    <TabsTrigger value="jugadores">
                        Jugadores
                    </TabsTrigger>
                    <TabsTrigger value="posiciones">
                        Posiciones
                    </TabsTrigger>
                    <TabsTrigger value="fixture">
                        Fixture
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="jugadores">
                    <JugadorManager equipoId={user.equipo_id} />
                </TabsContent>
                
                <TabsContent value="posiciones">
                    <TablaPosiciones />
                </TabsContent>

                <TabsContent value="fixture">
                    <FixtureEquipo />
                </TabsContent>
            </Tabs>
        </div>
    )
}
