'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BuscarJugador from '@/app/components/dashboard/jugadores/buscar-jugador'
import { TablaPosiciones } from '@/app/components/dashboard/temporadas/tabla-posiciones'
import { ResultadosPublicos } from '@/app/components/dashboard/partidos/resultados-publicos'

export function PublicDashboard() {
    const [activeTab, setActiveTab] = useState('jugadores')

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">Liga Ancestral Catzuqui</h1>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 w-full max-w-lg mb-6">
                    <TabsTrigger value="jugadores">
                        Jugadores
                    </TabsTrigger>
                    <TabsTrigger value="posiciones">
                        Posiciones
                    </TabsTrigger>
                    <TabsTrigger value="resultados">
                        Resultados
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="jugadores" className="space-y-4">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Buscar Jugador</h2>
                        <BuscarJugador />
                    </div>
                </TabsContent>

                <TabsContent value="posiciones" className="space-y-4">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Tabla de Posiciones</h2>
                        <TablaPosiciones />
                    </div>
                </TabsContent>

                <TabsContent value="resultados" className="space-y-4">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Resultados</h2>
                        <ResultadosPublicos />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
