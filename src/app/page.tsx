
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NavBar } from "./components/layout/navBarComponents";
import { Trophy, Calendar, Users, Search, Bell, ChevronRight } from "lucide-react";
import { NextMatch } from "./components/match/next-match";
import { TableStandings } from "./components/standings/table-standings";
import { Database } from "./types/database";
import { Stats } from "./components/statistics/stats";


export default async function Home() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const { data: equiposData } = await supabase
    .from("equipos")
    .select("nombre, logo, stats(partidos_jugados, victorias, empates, derrotas, goles_a_favor, goles_encontra, puntos)");

  // Transformar datos para cumplir con el tipo esperado
  const equipos: Equipo[] = equiposData?.map(equipo => ({
    nombre: equipo.nombre,
    logo: equipo.logo,
    stats: {
      partidos_jugados: equipo.stats?.partidos_jugados || 0,
      victorias: equipo.stats?.victorias || 0,
      empates: equipo.stats?.empates || 0,
      derrotas: equipo.stats?.derrotas || 0,
      goles_a_favor: equipo.stats?.goles_a_favor || 0,
      goles_encontra: equipo.stats?.goles_encontra || 0,
      puntos: equipo.stats?.puntos || 0
    }
  })) || [];
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-4 sm:p-6">
        {/* Header */}
        <NavBar />
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Próximo Partido */}
          <NextMatch />
          {/* Estadísticas */}
          <Stats />
          {/* Tabla de Posiciones */}
          <TableStandings equipos={equipos} />

          {/* Tarjeta de Entrenamiento */}
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-4 sm:p-6 text-white shadow-sm">
            <h2 className="text-lg font-semibold mb-6">Próximo Entrenamiento</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5" />
                <span>Martes, 15:00</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5" />
                <span>18 jugadores confirmados</span>
              </div>
              <button className="w-full mt-4 bg-white text-teal-600 py-2 rounded-lg font-medium hover:bg-teal-50 transition-colors">
                Ver detalles
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

}
