"use client";

import { NavBar } from "../components/layout/navBarComponents";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function CrearEquipoPage() {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState(""); // Aquí guardaremos el id de la categoría
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Define el tipo correcto para Equipo
  interface Equipo {
    id: string;
    nombre: string;
    estado: string;
    categoria_id: string;
    categorias: { nombre: string };
  }

  // --- NUEVO: Mostrar equipos del usuario arriba del formulario ---
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [equiposLoading, setEquiposLoading] = useState(true);

  useEffect(() => {
    async function fetchCategorias() {
      const { data } = await supabase.from("categorias").select("id, nombre");
      if (data) {
        setCategorias(data);
      }
    }
    fetchCategorias();
  }, [supabase]);

  useEffect(() => {
    async function fetchEquipos() {
      setEquiposLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setEquipos([]);
        setEquiposLoading(false);
        return;
      }
      const { data } = await supabase
        .from('equipos')
        .select('id, nombre, estado, categoria_id, categorias(nombre)')
        .eq('creado_por', session.user.id)
        .order('fecha_creacion', { ascending: false });
      if (data) {
        // Corrige el tipo del mapeo para evitar conflicto entre datos crudos y Equipo
        interface CategoriaDB {
          nombre: string;
        }
        const equiposMap = (data ?? []).map((eq: { id: string; nombre: string; estado: string; categoria_id: string; categorias: CategoriaDB[] | CategoriaDB }) => ({
          ...eq,
          categorias: Array.isArray(eq.categorias) ? eq.categorias[0] : eq.categorias
        })) as Equipo[];
        setEquipos(equiposMap);
      } else {
        setEquipos([]);
      }
      setEquiposLoading(false);
    }
    fetchEquipos();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setMensaje("Debes iniciar sesión para crear un equipo.");
      setLoading(false);
      return;
    }
    // Insertar equipo en estado 'pendiente' con categoria_id y creado_por correctos
    const { data } = await supabase
      .from("equipos")
      .insert([
        {
          nombre,
          categoria_id: parseInt(categoria), // id de la categoría seleccionado
          estado: "pendiente",
          creado_por: session.user.id, // UUID del usuario actual
        },
      ])
      .select("id")
      .single();
    setLoading(false);
    if (data && data.id) {
      setMensaje("Equipo creado correctamente. Redirigiendo...");
      setNombre("");
      setCategoria("");
      setTimeout(() => router.push(`/equipo/${data.id}?edit=1`), 1200);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2fbfc] p-4 sm:p-6">
      <NavBar />
      <div className="max-w-5xl mx-auto mt-10 p-4 sm:p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-900">Crear equipo</h1>
        {/* Layout responsive: en desktop dos columnas separadas, en móvil una */}
        <div className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-12 items-stretch">
          {/* Card: Tus equipos */}
          <section className="lg:w-1/2 flex flex-col justify-center">
            <div className="h-full flex flex-col rounded-2xl border border-blue-200 bg-white/95 shadow-lg p-0 overflow-hidden">
              <header className="bg-gradient-to-r from-blue-100 to-blue-50 px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-9 h-9 bg-blue-200 text-blue-700 rounded-xl">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-1.13V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v8m10 4v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2a4 4 0 013-3.87" /></svg>
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-blue-900">Tus equipos</h2>
                </div>
                <span className="text-xs sm:text-sm text-blue-700 bg-blue-100 rounded-full px-3 py-1 font-semibold">Gestiona y edita tus equipos</span>
              </header>
              <div className="flex-1 p-0">
                {equiposLoading ? (
                  <div className="text-gray-500 text-sm px-8 py-8">Cargando equipos...</div>
                ) : equipos.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-blue-800">
                    <svg className="w-10 h-10 text-blue-100" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-1.13V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v8m10 4v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2a4 4 0 013-3.87" /></svg>
                    <span className="text-base font-medium">Aún no has creado equipos.</span>
                  </div>
                ) : (
                  <ul className="divide-y divide-blue-100 w-full">
                    <li className="hidden lg:grid grid-cols-4 gap-6 items-center py-3 px-8 bg-blue-50 rounded-t-xl font-semibold text-blue-900 text-base border-b border-blue-200">
                      <span className="col-span-2">Nombre del equipo</span>
                      <span>Categoría</span>
                      <span className="text-center">Estado</span>
                    </li>
                    {equipos.map((eq: Equipo) => (
                      <li
                        key={eq.id}
                        className="flex flex-col lg:grid lg:grid-cols-4 gap-2 lg:gap-6 items-start lg:items-center py-4 px-4 lg:px-8 hover:bg-blue-50 transition rounded-xl w-full"
                      >
                        {/* Nombre */}
                        <div className="flex items-center gap-2 col-span-2 w-full min-w-0">
                          <span className="inline-block w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"></span>
                          <span className="font-medium text-blue-900 text-base lg:text-lg break-words w-full">{eq.nombre}</span>
                        </div>
                        {/* Categoría */}
                        <span className="text-xs text-blue-700 bg-blue-100 rounded px-3 py-1 w-full lg:w-auto break-words text-left font-semibold" title={eq.categorias?.nombre || ''}>
                          {eq.categorias?.nombre || 'Sin categoría'}
                        </span>
                        {/* Estado */}
                        <span className={`inline-block min-w-[90px] text-xs px-2 py-1 rounded font-semibold shadow-sm text-center w-full lg:w-auto ${eq.estado === 'aprobado' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-yellow-100 text-yellow-700 border border-yellow-300'}`}>{eq.estado === 'aprobado' ? 'Aprobado' : 'Pendiente'}</span>
                        {/* Botón */}
                        <div className="w-full flex lg:justify-center">
                          <a href={`/equipo/${eq.id}`} className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs lg:text-sm font-semibold shadow hover:bg-blue-700 transition">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M12 19l7-7a2.828 2.828 0 00-4-4l-7 7v4h4z" /></svg>
                            Gestionar
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
          {/* Card: Formulario para crear equipo */}
          <section className="lg:w-1/2 flex flex-col justify-center">
            <div className="h-full flex flex-col rounded-2xl border border-blue-200 bg-white/95 shadow-lg p-0 overflow-hidden">
              <header className="bg-gradient-to-r from-blue-100 to-blue-50 px-8 py-5 border-b border-blue-100">
                <h2 className="text-lg sm:text-xl font-bold text-blue-900">Nuevo equipo</h2>
              </header>
              <div className="flex-1 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del equipo</label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      required
                      maxLength={40}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría</label>
                    <select
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      required
                    >
                      <option value="">Selecciona una categoría</option>
                      {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? "Creando..." : "Crear equipo"}
                  </button>
                  {mensaje && <p className="mt-4 text-center text-md text-blue-700 font-semibold">{mensaje}</p>}
                </form>
              </div>
            </div>
          </section>
        </div>
      </div>
      {/* Espacio extra para móvil para evitar que el NavBar tape info */}
      <div className="block lg:hidden h-24" />
    </div>
  );
}
