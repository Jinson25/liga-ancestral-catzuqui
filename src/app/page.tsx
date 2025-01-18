
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NavBar } from "./components/layout/navBarComponents";
import { Trophy, Calendar, Users, Search, Bell, ChevronRight } from "lucide-react";
import { NextMatch } from "./components/match/next-match";
import { Stats } from "./components/statistics/stats";
import { TableStandings } from "./components/standings/table-standings";



export default async function Home() {
  const supabase = createServerComponentClient({ cookies });
  const { data: equipos } = await supabase.from("equipos").select("*");
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
          <TableStandings />

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
