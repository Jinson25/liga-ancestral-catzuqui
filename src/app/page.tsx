import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NavBar } from "./components/layout/navBarComponents";
import { Calendar, Users } from "lucide-react";
import { NextMatch } from "./components/match/next-match";
import { TableStandings } from "./components/standings/table-standings";
import { Database } from "./types/database";
import { Stats } from "./components/statistics/stats";
import { Equipo } from "./interfaces/equipoInterfaces";

interface EquipoData {
  nombre: string;
}

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({
    cookies: () => cookieStore
  });

  try {
    const { data: equiposData, error } = await supabase
      .from("equipos")
      .select("nombre");

    if (error) throw error;

    // Transformar datos para cumplir con el tipo esperado
    const equipos: Equipo[] = (equiposData as EquipoData[])?.map(equipo => {
      return {
        nombre: equipo.nombre,
        stats: {
          partidos_jugados: 0,
          victorias: 0,
          empates: 0,
          derrotas: 0,
          goles_a_favor: 0,
          goles_encontra: 0,
          puntos: 0
        }
      };
    }) || [];

    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-4 sm:p-6">
          {/* Header */}
          <NavBar />

          {/* Main Content */}
          <div className="container mx-auto mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Próximo Partido y Tabla de Posiciones */}
              <div className="lg:col-span-3 grid grid-cols-1 gap-6">
                <NextMatch />
                <TableStandings />
              </div>

              {/* Estadísticas y Accesos Rápidos */}
              <div className="space-y-6">
                <Stats />

                {/* Quick Access */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">Accesos Rápidos</h2>
                  <div className="space-y-4">
                    <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-teal-600 mr-3" />
                        <span>Calendario</span>
                      </div>
                    </button>
                    <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-teal-600 mr-3" />
                        <span>Jugadores</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error('Error en la página principal:', error);
    return (
      <div className="text-center text-red-500 p-4">
        Error al cargar la página
      </div>
    );
  }
}
