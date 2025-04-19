'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/app/types/database'
import { MatchData } from '@/app/types/match'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function MatchesList() {
  const [matches, setMatches] = useState<MatchData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // Primero obtenemos la temporada activa
        const { data: temporadaData, error: temporadaError } = await supabase
          .from('temporada')
          .select('id')
          .is('fecha_final', null)
          .single()

        if (temporadaError) {
          throw new Error('No hay una temporada activa')
        }

        // Luego obtenemos los partidos de esa temporada
        const { data, error: partidosError } = await supabase
          .from('partidos')
          .select(`
            id,
            fecha,
            goles_local,
            goles_visitante,
            temporada_id,
            equipo_local:equipos!partidos_equipo_local_id_fkey (
              id,
              nombre
            ),
            equipo_visitante:equipos!partidos_equipo_visitante_id_fkey (
              id,
              nombre
            )
          `)
          .eq('temporada_id', temporadaData.id)
          .order('fecha', { ascending: true })

        if (partidosError) {
          throw partidosError
        }

        setMatches(data as MatchData[])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los partidos')
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    )
  }

  if (!matches.length) {
    return (
      <div className="text-center p-4">
        No hay partidos programados
      </div>
    )
  }

  return (
    <div className="grid gap-4 p-4">
      {matches.map((match) => (
        <Card key={match.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">{match.equipo_local.nombre}</span>
              </div>
              <div className="flex items-center gap-2 mx-4">
                <span className="text-lg font-bold">
                  {match.goles_local !== null ? match.goles_local : '-'}
                </span>
                <span className="text-sm">vs</span>
                <span className="text-lg font-bold">
                  {match.goles_visitante !== null ? match.goles_visitante : '-'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{match.equipo_visitante.nombre}</span>
              </div>
            </div>
            <div className="text-center mt-2 text-sm text-gray-500">
              {match.fecha ? new Date(match.fecha).toLocaleDateString() : 'Fecha por definir'}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
