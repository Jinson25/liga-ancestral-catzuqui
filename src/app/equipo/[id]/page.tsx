"use client"

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useParams } from "next/navigation";
import React from "react";
import { NavBar } from "../../components/layout/navBarComponents";

// Define tipos para Equipo y Jugador
interface Equipo {
  id: string;
  nombre: string;
  estado: string;
  categoria_id: string;
  categorias: { nombre: string };
  creado_por: string;
}
interface Jugador {
  id: string;
  nombre: string;
  cedula: string;
  fecha_nacimiento: string;
  equipo_id: string;
  estado: string;
}

export default function GestionEquipoPage() {
  // Next.js 14: useParams() returns unknown, so we must cast it
  const params = useParams() as { id?: string };
  const supabase = createClientComponentClient();
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Estado para edición y gestión de jugadores
  const [editando, setEditando] = useState(false);
  const [nombreEdit, setNombreEdit] = useState("");
  const [categoriaEdit, setCategoriaEdit] = useState("");
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [jugadoresLoading, setJugadoresLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [estadoEdit, setEstadoEdit] = useState("");
  const [mostrarFormularioJugador, setMostrarFormularioJugador] = useState(false);
  const [jugadorEditando, setJugadorEditando] = useState<Jugador | null>(null);
  const [mostrarConfirmarEliminar, setMostrarConfirmarEliminar] = useState<{ visible: boolean, jugador: Jugador | null }>({ visible: false, jugador: null });

  // Cargar categorías y rol usuario
  useEffect(() => {
    async function fetchCategoriasYRol() {
      const { data: categoriasData } = await supabase.from("categorias").select("id, nombre");
      if (categoriasData) setCategorias(categoriasData);
      // Obtener rol usuario actual
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", session.user.id).single();
        setUserRole(perfil?.rol || null);
      }
    }
    fetchCategoriasYRol();
  }, []);

  useEffect(() => {
    async function fetchEquipo() {
      if (!params.id) return;
      const { data, error } = await supabase
        .from("equipos")
        .select("id, nombre, estado, categoria_id, categorias(nombre), creado_por")
        .eq("id", params.id)
        .single();
      if (!error && data) {
        const equipoMap: Equipo = {
          ...data,
          categorias: Array.isArray(data.categorias) ? data.categorias[0] : data.categorias
        };
        setEquipo(equipoMap);
      }
      setLoading(false);
    }
    fetchEquipo();
  }, [params.id, supabase]);

  useEffect(() => {
    if (equipo && editando) {
      setNombreEdit(equipo.nombre);
      setCategoriaEdit(equipo.categoria_id?.toString() || "");
      setEstadoEdit(equipo.estado);
    }
  }, [equipo, editando]);

  // --- FIX: Cargar jugadores cuando el equipo esté cargado ---
  useEffect(() => {
    if (equipo?.id) {
      cargarJugadores();
    }
  }, [equipo, supabase, cargarJugadores]);

  // Cargar jugadores
  async function cargarJugadores() {
    setJugadoresLoading(true);
    const { data, error } = await supabase
      .from("jugadores")
      .select("id, nombre, cedula, fecha_nacimiento, estado")
      .eq("equipo_id", equipo?.id);
    if (!error && data) setJugadores(data as Jugador[]);
    setJugadoresLoading(false);
  }

  // Guardar edición
  async function guardarEdicion(e: React.FormEvent) {
    e.preventDefault();
    setMensaje("");
    const { error } = await supabase
      .from("equipos")
      .update({ nombre: nombreEdit, categoria_id: parseInt(categoriaEdit), estado: userRole === "presidente" ? estadoEdit : equipo?.estado })
      .eq("id", equipo?.id);
    if (error) {
      setMensaje("Error al guardar: " + error.message);
    } else {
      setMensaje("¡Equipo actualizado!");
      setEditando(false);
      router.refresh();
    }
  }

  async function eliminarJugador(jugadorId: string) {
    await supabase.from("jugadores").delete().eq("id", jugadorId);
    setMostrarConfirmarEliminar({ visible: false, jugador: null });
    cargarJugadores();
  }

  if (loading) return <div className="p-10 text-center">Cargando equipo...</div>;
  if (!equipo) return <div className="p-10 text-center text-red-500">Equipo no encontrado.</div>;

  return (
    <div className="min-h-screen bg-[#f2fbfc] p-4 sm:p-6">
      <NavBar />
      <div className="max-w-3xl mx-auto mt-10 p-6 sm:p-10 bg-white rounded-2xl shadow-lg border border-blue-100 flex flex-col gap-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-2 text-center">Gestión del equipo</h1>
        {/* Info o edición */}
        {!editando ? (
          <div className="flex flex-col gap-4">
            <div>
              <span className="font-bold text-blue-700">Nombre:</span> {equipo?.nombre}
            </div>
            <div>
              <span className="font-bold text-blue-700">Categoría:</span> {equipo?.categorias?.nombre || 'Sin categoría'}
            </div>
            <div>
              <span className="font-bold text-blue-700">Estado:</span> <span className={`inline-block text-xs px-2 py-1 rounded font-semibold shadow-sm text-center ml-2 ${equipo?.estado === 'aprobado' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-yellow-100 text-yellow-700 border border-yellow-300'}`}>{equipo?.estado === 'aprobado' ? 'Aprobado' : 'Pendiente'}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-base" onClick={() => setEditando(true)}>Editar equipo</button>
              {mensaje && <div className="mt-2 text-center text-blue-700 font-semibold">{mensaje}</div>}
            </div>
          </div>
        ) : (
          <form onSubmit={guardarEdicion} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
              <input type="text" value={nombreEdit} onChange={e => setNombreEdit(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400" required maxLength={40} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría</label>
              <select value={categoriaEdit} onChange={e => setCategoriaEdit(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400" required>
                <option value="">Selecciona una categoría</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>
            {/* Estado solo editable por presidente */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
              <select value={equipo?.estado} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">
                <option value="aprobado">Aprobado</option>
                <option value="pendiente">Pendiente</option>
              </select>
              {userRole === "presidente" && (
                <select value={estadoEdit} onChange={e => setEstadoEdit(e.target.value)} className="w-full px-4 py-2 border border-blue-400 rounded-lg mt-2">
                  <option value="aprobado">Aprobado</option>
                  <option value="pendiente">Pendiente</option>
                </select>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Guardar</button>
              <button type="button" className="bg-gray-300 text-blue-900 px-5 py-2 rounded-lg font-semibold hover:bg-gray-400 transition" onClick={() => setEditando(false)}>Cancelar</button>
            </div>
            {mensaje && <div className="mt-2 text-center text-blue-700 font-semibold">{mensaje}</div>}
          </form>
        )}
        {/* Gestión de jugadores SIEMPRE visible */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-blue-800">Jugadores del equipo</h2>
            <button
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-semibold shadow transition"
              onClick={() => setMostrarFormularioJugador(true)}
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Inscribir jugador
            </button>
          </div>
          {/* Modal para agregar jugador */}
          {mostrarFormularioJugador && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
                <button className="absolute top-3 right-3 text-blue-700 hover:text-blue-900 text-2xl" onClick={() => setMostrarFormularioJugador(false)}>&times;</button>
                <h3 className="text-xl font-bold mb-4 text-blue-800">Inscribir nuevo jugador</h3>
                <form
                  className="flex flex-col gap-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target as typeof e.target & {
                      nombre: { value: string },
                      cedula: { value: string },
                      fecha_nacimiento: { value: string }
                    };
                    if (!form.nombre.value.trim() || !form.cedula.value.trim() || !form.fecha_nacimiento.value) return;
                    const { error } = await supabase.from("jugadores").insert({
                      nombre: form.nombre.value.trim(),
                      cedula: form.cedula.value.trim(),
                      equipo_id: equipo?.id,
                      estado: "pendiente",
                      fecha_inscripcion: new Date().toISOString(),
                      fecha_nacimiento: form.fecha_nacimiento.value
                    });
                    if (!error) {
                      form.nombre.value = "";
                      form.cedula.value = "";
                      form.fecha_nacimiento.value = "";
                      setMostrarFormularioJugador(false);
                      // Espera un poco antes de recargar para asegurar que el registro esté en la DB
                      setTimeout(() => cargarJugadores(), 300);
                    }
                  }}
                >
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="nombre">Nombre completo</label>
                    <input name="nombre" id="nombre" type="text" placeholder="Ej: Juan Pérez" className="px-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400" required maxLength={40} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="cedula">Cédula o pasaporte</label>
                    <input
                      name="cedula"
                      id="cedula"
                      type="text"
                      inputMode="numeric"
                      pattern="^[0-9]{10,15}$"
                      placeholder="Solo números, 10 para cédula, hasta 15 para pasaporte"
                      className="px-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      required
                      maxLength={15}
                      minLength={10}
                      autoComplete="off"
                      onInput={e => {
                        // Solo permite números
                        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "");
                      }}
                    />
                    <span className="text-xs text-gray-500">Ejemplo: 0102030405 (cédula) o 123456789012345 (pasaporte)</span>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="fecha_nacimiento">Fecha de nacimiento</label>
                    <input
                      name="fecha_nacimiento"
                      id="fecha_nacimiento"
                      type="date"
                      className="px-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      required
                      min="1940-01-01"
                      max={new Date().toISOString().split('T')[0]}
                      placeholder="YYYY-MM-DD"
                    />
                    <span className="text-xs text-gray-500">Ejemplo: 2000-05-15</span>
                  </div>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Guardar jugador</button>
                </form>
              </div>
            </div>
          )}
          {jugadoresLoading ? (
            <div className="text-gray-500 text-sm">Cargando jugadores...</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-blue-100 shadow bg-white">
              <table className="w-full text-left">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="p-2 font-semibold text-blue-900">Nombre</th>
                    <th className="p-2 font-semibold text-blue-900">Cédula</th>
                    <th className="p-2 font-semibold text-blue-900">Fecha nacimiento</th>
                    <th className="p-2 font-semibold text-blue-900">Estado</th>
                    <th className="p-2 font-semibold text-blue-900 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {jugadores.length === 0 ? (
                    <tr><td className="p-2 text-gray-400 italic text-center" colSpan={5}>No hay jugadores registrados.</td></tr>
                  ) : jugadores.map(j => (
                    <tr key={j.id} className="border-t border-blue-100">
                      <td className="p-2">{j.nombre}</td>
                      <td className="p-2">{j.cedula}</td>
                      <td className="p-2">{j.fecha_nacimiento ? new Date(j.fecha_nacimiento).toLocaleDateString() : '-'}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 text-xs rounded font-semibold ${j.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{j.estado}</span>
                      </td>
                      <td className="p-2 flex gap-2 justify-center">
                        <button
                          className="text-blue-600 hover:bg-blue-100 p-1 rounded transition"
                          title="Editar jugador"
                          onClick={() => setJugadorEditando(j)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3h3z" /></svg>
                        </button>
                        <button
                          className="text-red-600 hover:bg-red-100 p-1 rounded transition"
                          title="Eliminar jugador"
                          onClick={() => setMostrarConfirmarEliminar({ visible: true, jugador: j })}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* Espacio extra para móvil para evitar que el NavBar tape info */}
      <div className="block lg:hidden h-24" />
      {jugadorEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-2">
            <h2 className="text-lg font-bold mb-4">Editar jugador</h2>
            <form
              className="flex flex-col gap-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as typeof e.target & {
                  nombre: { value: string },
                  cedula: { value: string },
                  fecha_nacimiento: { value: string }
                };
                if (!form.nombre.value.trim() || !form.cedula.value.trim() || !form.fecha_nacimiento.value) return;
                await supabase.from("jugadores").update({
                  nombre: form.nombre.value.trim(),
                  cedula: form.cedula.value.trim(),
                  fecha_nacimiento: form.fecha_nacimiento.value
                }).eq("id", jugadorEditando.id);
                setJugadorEditando(null);
                cargarJugadores();
              }}
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="nombre_edit">Nombre completo</label>
                <input name="nombre" id="nombre_edit" type="text" defaultValue={jugadorEditando.nombre} className="px-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400" required maxLength={40} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="cedula_edit">Cédula o pasaporte</label>
                <input name="cedula" id="cedula_edit" type="text" inputMode="numeric" pattern="^[0-9]{10,15}$" defaultValue={jugadorEditando.cedula} className="px-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400" required maxLength={15} minLength={10} autoComplete="off"
                  onInput={e => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, ""); }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="fecha_nacimiento_edit">Fecha de nacimiento</label>
                <input name="fecha_nacimiento" id="fecha_nacimiento_edit" type="date" defaultValue={jugadorEditando.fecha_nacimiento?.split('T')[0]} className="px-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400" required min="1940-01-01" max={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300" onClick={() => setJugadorEditando(null)}>Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {mostrarConfirmarEliminar.visible && mostrarConfirmarEliminar.jugador && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm mx-2">
            <h2 className="text-lg font-bold mb-4 text-red-600">¿Eliminar jugador?</h2>
            <p className="mb-4">Esta acción es irreversible. ¿Deseas eliminar al jugador <span className="font-semibold">{mostrarConfirmarEliminar.jugador.nombre}</span>?</p>
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300" onClick={() => setMostrarConfirmarEliminar({ visible: false, jugador: null })}>Cancelar</button>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition" onClick={() => mostrarConfirmarEliminar.jugador && eliminarJugador(mostrarConfirmarEliminar.jugador.id)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
