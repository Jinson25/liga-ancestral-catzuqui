"use client"

import { NavBar } from "./components/layout/navBarComponents";
import { Calendar, Users } from "lucide-react";
import { NextMatch } from "./components/match/next-match";
import { TableStandings } from "./components/standings/table-standings";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState, useEffect } from "react";

const supabase = createClientComponentClient();

interface EquipoData {
  nombre: string;
}

export default function Home() {
  const [temporadas, setTemporadas] = useState<any[]>([])
  const [temporadaSeleccionada, setTemporadaSeleccionada] = useState<number|null>(null)

  useEffect(() => {
    async function fetchTemporadas() {
      // El nombre correcto de la tabla es probablemente 'temporadas', no 'temporada'
      const { data, error } = await supabase
        .from("temporadas")
        .select("id, nombre")
        .order("fecha_inicio", { ascending: false });
      if (!error) {
        setTemporadas(data || []);
        if (data && data.length > 0 && temporadaSeleccionada === null) {
          setTemporadaSeleccionada(Number(data[0].id));
        }
      } else {
        setTemporadas([]);
      }
    }
    fetchTemporadas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="min-h-screen bg-[#f2fbfc] p-4 sm:p-6">
        {/* Header */}
        <NavBar />

        {/* Main Content */}
        <div className="container mx-auto mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 flex flex-col gap-6">
              {/* Próximo Partido */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 min-h-[170px]">
                <NextMatch />
              </div>
              {/* Tabla de posiciones */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 min-h-[170px]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-gray-800">Tabla de Posiciones</h2>
                  <select
                    className="border border-gray-200 rounded px-3 py-1 text-gray-700 font-semibold bg-white"
                    value={temporadaSeleccionada ?? ''}
                    onChange={e => setTemporadaSeleccionada(Number(e.target.value))}
                  >
                    {temporadas.map(temp => (
                      <option key={temp.id} value={temp.id}>{temp.nombre}</option>
                    ))}
                  </select>
                </div>
                {temporadaSeleccionada && (
                  <TableStandings temporadaId={temporadaSeleccionada} />
                )}
              </div>
            </div>
            {/* Estadísticas y Accesos Rápidos */}
            <div className="flex flex-col gap-6">
              {/* Estadísticas */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-base font-bold text-gray-800 mb-4">Estadísticas</h2>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1"><span>Victorias</span><span className="font-bold">-</span></div>
                  <div className="flex justify-between items-center py-1"><span>Empates</span><span className="font-bold">-</span></div>
                  <div className="flex justify-between items-center py-1"><span>Derrotas</span><span className="font-bold">-</span></div>
                </div>
              </div>
              {/* Próximo Entrenamiento (placeholder) */}
              <div className="bg-[#13b5c9] rounded-xl p-6 shadow-sm text-white">
                <h2 className="text-base font-bold mb-2">Próximo Entrenamiento</h2>
                <div className="flex items-center gap-2 mb-2"><span className="material-icons">event</span> Martes, 15:00</div>
                <div className="flex items-center gap-2 mb-4"><span className="material-icons">groups</span> 18 jugadores confirmados</div>
                <button className="w-full bg-white text-[#13b5c9] font-bold rounded-lg py-2 hover:bg-blue-50 transition">Ver detalles</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
