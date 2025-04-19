'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/app/types/database'
import { MatchData, MatchUpdateData } from '@/app/types/match'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface Team {
  id: string
  nombre: string | null
}

export default function MatchAdmin() {
  const [matches, setMatches] = useState<MatchData[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener equipos
        const { data: teamsData, error: teamsError } = await supabase
          .from('equipos')
          .select('id, nombre')
          .eq('aprobado', true)

        if (teamsError) throw teamsError
        setTeams(teamsData)

        // Obtener temporada activa
        const { data: temporadaData, error: temporadaError } = await supabase
          .from('temporada')
          .select('id')
          .is('fecha_final', null)
          .single()

        if (temporadaError) throw new Error('No hay una temporada activa')

        // Obtener partidos
        const { data: matchesData, error: matchesError } = await supabase
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

        if (matchesError) throw matchesError
        setMatches(matchesData as MatchData[])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los datos')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  const handleUpdateScore = async (matchId: string, data: MatchUpdateData) => {
    try {
      const { error } = await supabase
        .from('partidos')
        .update(data)
        .eq('id', matchId)

      if (error) throw error

      // Actualizar el estado local
      setMatches(matches.map(match => 
        match.id === matchId 
          ? { ...match, ...data }
          : match
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el resultado')
    }
  }

  const handleCreateMatch = async (formData: FormData) => {
    try {
      const localTeamId = formData.get('local_team')
      const visitorTeamId = formData.get('visitor_team')
      const matchDate = formData.get('match_date')

      if (!localTeamId || !visitorTeamId) {
        throw new Error('Debes seleccionar ambos equipos')
      }

      if (localTeamId === visitorTeamId) {
        throw new Error('No puedes seleccionar el mismo equipo')
      }

      // Obtener temporada activa
      const { data: temporadaData, error: temporadaError } = await supabase
        .from('temporada')
        .select('id')
        .is('fecha_final', null)
        .single()

      if (temporadaError) throw new Error('No hay una temporada activa')

      const { data, error } = await supabase
        .from('partidos')
        .insert({
          equipo_local_id: localTeamId as string,
          equipo_visitante_id: visitorTeamId as string,
          fecha: matchDate ? new Date(matchDate as string).toISOString() : null,
          temporada_id: temporadaData.id
        })
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
        .single()

      if (error) throw error

      setMatches([...matches, data as MatchData])
      setIsDialogOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el partido')
    }
  }

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

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Administrar Partidos</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Partido
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Partido</DialogTitle>
            </DialogHeader>
            <form action={handleCreateMatch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="local_team">Equipo Local</Label>
                <select
                  id="local_team"
                  name="local_team"
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Selecciona un equipo</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitor_team">Equipo Visitante</Label>
                <select
                  id="visitor_team"
                  name="visitor_team"
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Selecciona un equipo</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="match_date">Fecha del Partido</Label>
                <Input
                  id="match_date"
                  name="match_date"
                  type="datetime-local"
                />
              </div>
              <Button type="submit" className="w-full">
                Crear Partido
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {matches.map((match) => (
          <Card key={match.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{match.equipo_local.nombre}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="space-x-2">
                    <Input
                      type="number"
                      min="0"
                      value={match.goles_local ?? ''}
                      className="w-16 text-center"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value === '' ? null : parseInt(e.target.value)
                        handleUpdateScore(match.id, { goles_local: value })
                      }}
                    />
                    <span>-</span>
                    <Input
                      type="number"
                      min="0"
                      value={match.goles_visitante ?? ''}
                      className="w-16 text-center"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value === '' ? null : parseInt(e.target.value)
                        handleUpdateScore(match.id, { goles_visitante: value })
                      }}
                    />
                  </div>
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
    </div>
  )
}
