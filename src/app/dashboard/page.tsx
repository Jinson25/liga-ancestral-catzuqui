"use client"

import { useEffect, useState, useRef } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { getRolLabel } from "@/app/lib/roles"
import { BadgeCheck, Hourglass, Shield, Users, LayoutDashboard, Layers, ListChecks, User, Calendar, BarChart2, Settings, MessageSquare, Bell, Search, LogOut } from "lucide-react"
import { NavBar } from "@/app/components/layout/navBarComponents"

const sidebarItems = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { key: "equipos", label: "Aprobar Equipos", icon: <Users size={20} /> },
  { key: "categorias", label: "Categorías", icon: <Layers size={20} /> },
  { key: "fases", label: "Fases y Formatos", icon: <ListChecks size={20} /> },
  { key: "jugadores", label: "Jugadores", icon: <User size={20} /> },
  { key: "temporadas", label: "Temporadas", icon: <Calendar size={20} /> },
]

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSection, setSelectedSection] = useState<string>("dashboard")
  const [equiposPendientes, setEquiposPendientes] = useState<any[]>([])
  const [aprobando, setAprobando] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Estados para datos reales desde Supabase
  const [categorias, setCategorias] = useState<{id: number, nombre: string, descripcion?: string}[]>([])
  const [equipos, setEquipos] = useState<{id: number, nombre: string, categoria_id: number}[]>([])
  const [temporadas, setTemporadas] = useState<{id: number, nombre: string, categoria_id: number, fecha_inicio: string, fecha_fin: string, equipos: number[]}[]>([])
  const [nuevaTemporada, setNuevaTemporada] = useState<{
    nombre: string,
    categoria_id: number | "",
    equipos: number[],
    fecha_inicio: string,
    fecha_fin: string
  }>({ nombre: "", categoria_id: "", equipos: [], fecha_inicio: "", fecha_fin: "" })
  const [selectAllEquipos, setSelectAllEquipos] = useState(false)

  // --- Categorías ---
  const [nuevaCategoria, setNuevaCategoria] = useState("")
  const [nuevaDescripcionCategoria, setNuevaDescripcionCategoria] = useState("")
  const [editandoCategoriaId, setEditandoCategoriaId] = useState<number|null>(null)
  const [editNombreCategoria, setEditNombreCategoria] = useState("")
  const [editDescripcionCategoria, setEditDescripcionCategoria] = useState("")

  // --- NUEVO: Edición de equipos de temporada ---
  const editRef = useRef<HTMLDivElement>(null)

  // Estado para edición de equipos en temporada
  const [editandoTemporadaId, setEditandoTemporadaId] = useState<number|null>(null)
  const [equiposEditTemp, setEquiposEditTemp] = useState<number[]>([])

  async function handleCrearCategoria(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!nuevaCategoria.trim()) return
    const { error } = await supabase.from('categorias').insert({ nombre: nuevaCategoria.trim(), descripcion: nuevaDescripcionCategoria.trim() || null })
    if (error) {
      alert("Error al crear categoría: " + error.message)
      return
    }
    setNuevaCategoria("")
    setNuevaDescripcionCategoria("")
    // Refrescar categorías
    const { data: categoriasData } = await supabase.from('categorias').select('id, nombre, descripcion')
    if (categoriasData) setCategorias(categoriasData)
  }

  function startEditarCategoria(cat: {id: number, nombre: string, descripcion?: string}) {
    setEditandoCategoriaId(cat.id)
    setEditNombreCategoria(cat.nombre)
    setEditDescripcionCategoria(cat.descripcion || "")
  }

  function cancelarEditarCategoria() {
    setEditandoCategoriaId(null)
    setEditNombreCategoria("")
    setEditDescripcionCategoria("")
  }

  async function guardarEditarCategoria(id: number) {
    if (!editNombreCategoria.trim()) return
    const { error } = await supabase.from('categorias').update({ nombre: editNombreCategoria.trim(), descripcion: editDescripcionCategoria.trim() || null }).eq('id', id)
    if (error) {
      alert("Error al editar categoría: " + error.message)
      return
    }
    setEditandoCategoriaId(null)
    setEditNombreCategoria("")
    setEditDescripcionCategoria("")
    // Refrescar categorías
    const { data: categoriasData } = await supabase.from('categorias').select('id, nombre, descripcion')
    if (categoriasData) setCategorias(categoriasData)
  }

  useEffect(() => {
    async function fetchProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      if (!error && data) {
        setProfile(data)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [supabase])

  useEffect(() => {
    async function fetchEquipos() {
      const { data, error } = await supabase
        .from('equipos')
        .select('id, nombre, estado, categoria_id, categorias(nombre), creado_por')
        .eq('estado', 'pendiente')
        .order('fecha_creacion', { ascending: true })
      if (!error && data) {
        setEquiposPendientes(data)
      }
    }
    fetchEquipos()
  }, [supabase, aprobando])

  async function aprobarEquipo(equipoId: string) {
    setAprobando(equipoId)
    await supabase
      .from('equipos')
      .update({ estado: 'aprobado' })
      .eq('id', equipoId)
    setAprobando(null)
    // Refresca lista
    const { data, error } = await supabase
      .from('equipos')
      .select('id, nombre, estado, categoria_id, categorias(nombre), creado_por')
      .eq('estado', 'pendiente')
      .order('fecha_creacion', { ascending: true })
    if (!error && data) {
      setEquiposPendientes(data)
    }
  }

  // Cargar datos reales de Supabase
  useEffect(() => {
    async function fetchData() {
      // Categorías
      const { data: categoriasData } = await supabase.from('categorias').select('id, nombre, descripcion')
      if (categoriasData) setCategorias(categoriasData)
      // Equipos
      const { data: equiposData } = await supabase.from('equipos').select('id, nombre, categoria_id')
      if (equiposData) setEquipos(equiposData)
      // Temporadas
      const { data: temporadasData } = await supabase.from('temporadas').select('id, nombre, categoria_id, fecha_inicio, fecha_fin')
      // Equipos por temporada
      const { data: equiposTemporadaData } = await supabase.from('equipos_temporada').select('equipo_id, temporada_id')
      if (temporadasData && equiposTemporadaData) {
        // Asocia equipos a cada temporada
        const temporadasConEquipos = temporadasData.map(temp => ({
          ...temp,
          equipos: equiposTemporadaData.filter(et => et.temporada_id === temp.id).map(et => et.equipo_id)
        }))
        setTemporadas(temporadasConEquipos)
      }
    }
    fetchData()
  }, [])

  // Handlers para la sección de temporadas
  async function handleCrearTemporada(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Validar fechas
    if (!nuevaTemporada.fecha_inicio || !nuevaTemporada.fecha_fin) {
      alert('Debes ingresar la fecha de inicio y fin')
      return
    }
    // Insertar temporada
    const { data: tempData, error: tempError } = await supabase.from('temporadas').insert({
      nombre: nuevaTemporada.nombre,
      categoria_id: nuevaTemporada.categoria_id,
      fecha_inicio: nuevaTemporada.fecha_inicio,
      fecha_fin: nuevaTemporada.fecha_fin
    }).select().single()
    if (tempError) {
      alert('Error al crear temporada: ' + tempError.message)
      return
    }

    // Asociar equipos a la temporada y crear posiciones
    if (tempData && nuevaTemporada.equipos && nuevaTemporada.equipos.length > 0) {
      // Insertar en equipos_temporada
      const insertData = nuevaTemporada.equipos.map(equipo_id => ({ equipo_id, temporada_id: tempData.id }))
      await supabase.from('equipos_temporada').insert(insertData)

      // Crear posiciones en 0 para cada equipo
      const posiciones = nuevaTemporada.equipos.map(equipo_id => ({
        temporada_id: tempData.id,
        equipo_id,
        puntos: 0,
        partidos_jugados: 0,
        victorias: 0,
        empates: 0,
        derrotas: 0,
        goles_favor: 0,
        goles_contra: 0
      }))
      await supabase.from('posiciones').insert(posiciones)
    }
    setNuevaTemporada({ nombre: "", categoria_id: "", equipos: [], fecha_inicio: "", fecha_fin: "" })
    setSelectAllEquipos(false)
    // Recargar temporadas y asociaciones
    const { data: temporadasData } = await supabase.from('temporadas').select('id, nombre, categoria_id, fecha_inicio, fecha_fin')
    const { data: equiposTemporadaData } = await supabase.from('equipos_temporada').select('equipo_id, temporada_id')
    if (temporadasData && equiposTemporadaData) {
      const temporadasConEquipos = temporadasData.map(temp => ({
        ...temp,
        equipos: equiposTemporadaData.filter(et => et.temporada_id === temp.id).map(et => et.equipo_id)
      }))
      setTemporadas(temporadasConEquipos)
    }
  }

  async function agregarEquipoATemporada(equipo_id: number, temporada_id: number) {
    // Insertar en equipos_temporada si no existe
    await supabase.from('equipos_temporada').insert({ equipo_id, temporada_id })
    // Insertar en posiciones SOLO si no existe ese equipo-temporada
    const { data: existe, error } = await supabase.from('posiciones').select('id').eq('temporada_id', temporada_id).eq('equipo_id', equipo_id).maybeSingle()
    if (!existe) {
      await supabase.from('posiciones').insert({
        temporada_id,
        equipo_id,
        puntos: 0,
        partidos_jugados: 0,
        victorias: 0,
        empates: 0,
        derrotas: 0,
        goles_favor: 0,
        goles_contra: 0
      })
    }
  }

  function handleEquiposCheckbox(e: React.ChangeEvent<HTMLInputElement>, equipoId: number) {
    if (e.target.checked) {
      setNuevaTemporada(t => ({ ...t, equipos: [...t.equipos, equipoId] }))
    } else {
      setNuevaTemporada(t => ({ ...t, equipos: t.equipos.filter(id => id !== equipoId) }))
    }
  }

  function handleSelectAllEquipos() {
    const equiposFiltrados = equipos.filter(eq => eq.categoria_id === nuevaTemporada.categoria_id)
    const allIds = equiposFiltrados.map(eq => eq.id)
    if (selectAllEquipos) {
      setNuevaTemporada(t => ({ ...t, equipos: [] }))
      setSelectAllEquipos(false)
    } else {
      setNuevaTemporada(t => ({ ...t, equipos: allIds }))
      setSelectAllEquipos(true)
    }
  }

  // Iniciar edición
  function startEditarTemporada(tempId: number, equipos: number[]) {
    setEditandoTemporadaId(tempId)
    setEquiposEditTemp([...equipos])
    setTimeout(() => {
      editRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 100)
  }
  // Cancelar edición
  function cancelarEditarTemporada() {
    setEditandoTemporadaId(null)
    setEquiposEditTemp([])
  }
  // Guardar edición
  async function guardarEditarTemporada(tempId: number) {
    // Quitar todos los equipos actuales
    await supabase.from('equipos_temporada').delete().eq('temporada_id', tempId)
    // Insertar los nuevos
    const insertData = equiposEditTemp.map(equipo_id => ({ equipo_id, temporada_id: tempId }))
    if (insertData.length > 0) await supabase.from('equipos_temporada').insert(insertData)
    // Chequear posiciones (crear si no existe)
    for (const equipo_id of equiposEditTemp) {
      const { data: existe } = await supabase.from('posiciones').select('id').eq('temporada_id', tempId).eq('equipo_id', equipo_id).maybeSingle()
      if (!existe) {
        await supabase.from('posiciones').insert({
          temporada_id: tempId,
          equipo_id,
          puntos: 0,
          partidos_jugados: 0,
          victorias: 0,
          empates: 0,
          derrotas: 0,
          goles_favor: 0,
          goles_contra: 0
        })
      }
    }
    // Refrescar temporadas
    const { data: temporadasData } = await supabase.from('temporadas').select('id, nombre, categoria_id, fecha_inicio, fecha_fin')
    const { data: equiposTemporadaData } = await supabase.from('equipos_temporada').select('equipo_id, temporada_id')
    if (temporadasData && equiposTemporadaData) {
      const temporadasConEquipos = temporadasData.map(temp => ({
        ...temp,
        equipos: equiposTemporadaData.filter(et => et.temporada_id === temp.id).map(et => et.equipo_id)
      }))
      setTemporadas(temporadasConEquipos)
    }
    setEditandoTemporadaId(null)
    setEquiposEditTemp([])
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-900 bg-gray-50">Cargando...</div>
  }
  if (!profile || (profile.rol !== 'presidente' && profile.rol !== 'admin_liga')) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-red-400 bg-gray-50">Acceso denegado: solo presidentes o administradores pueden ver este panel.</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-4 sm:p-6">
      {/* NavBar global arriba */}
      <NavBar />
      <div className="flex flex-1">
        {/* Sidebar claro, sin título extra */}
        <aside className="w-60  flex flex-col py-8 px-2 gap-2 min-h-screen">
          {sidebarItems.map(item => (
            <button
              key={item.key}
              onClick={() => setSelectedSection(item.key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-semibold text-left w-full text-gray-700 ${selectedSection === item.key ? 'bg-blue-100 text-blue-700 shadow' : 'hover:bg-blue-50'}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          <div className="mt-auto flex flex-col gap-2 px-4">
            <button className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition"><Settings size={18}/> Configuración</button>
            <button className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition"><LogOut size={18}/> Salir</button>
          </div>
        </aside>
        {/* Main content */}
        <main className="flex-1 flex flex-col min-h-screen">
          {/* Dashboard Grid */}
          <section className="flex-1 p-8">
            {/* Mostrar solo el dashboard principal si está seleccionada esa sección */}
            {selectedSection === "dashboard" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
                <div className="aspect-square rounded-3xl bg-white flex flex-col items-center justify-center shadow-xl border border-blue-100 hover:scale-105 hover:shadow-2xl transition-all group cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-blue-400 text-lg font-bold group-hover:text-blue-600 transition">% Jugadores Validados</span>
                    <span className="text-4xl font-extrabold text-blue-700">98.5%</span>
                  </div>
                </div>
                <div className="aspect-square rounded-3xl bg-white flex flex-col items-center justify-center shadow-xl border border-blue-100 hover:scale-105 hover:shadow-2xl transition-all group cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-blue-400 text-lg font-bold group-hover:text-blue-600 transition">Equipos en espera</span>
                    <span className="text-4xl font-extrabold text-blue-700">{equiposPendientes.length}</span>
                  </div>
                </div>
                <div className="aspect-square rounded-3xl bg-white flex flex-col items-center justify-center shadow-xl border border-blue-100 hover:scale-105 hover:shadow-2xl transition-all group cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-blue-400 text-lg font-bold group-hover:text-blue-600 transition">Total Jugadores</span>
                    <span className="text-4xl font-extrabold text-blue-700">312</span>
                  </div>
                </div>
                <div className="aspect-square rounded-3xl bg-white flex flex-col items-center justify-center shadow-xl border border-blue-100 hover:scale-105 hover:shadow-2xl transition-all group cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-blue-400 text-lg font-bold group-hover:text-blue-600 transition">Pagos recibidos</span>
                    <span className="text-4xl font-extrabold text-blue-700">$2,125</span>
                  </div>
                </div>
              </div>
            )}
            {/* Sección: Aprobar Equipos */}
            {selectedSection === "equipos" && (
              <div className="rounded-2xl p-6 bg-white text-gray-900 font-bold text-lg flex flex-col gap-2 shadow col-span-1 md:col-span-2 xl:col-span-4">
                <span className="text-xl font-semibold text-blue-700 mb-4">Equipos pendientes de aprobación</span>
                <div className="flex flex-col gap-4">
                  {equiposPendientes.length === 0 && (
                    <span className="text-gray-400">No hay equipos pendientes.</span>
                  )}
                  {equiposPendientes.map(equipo => (
                    <div key={equipo.id} className="flex items-center justify-between bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-blue-800">{equipo.nombre}</span>
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full"><Hourglass className="w-4 h-4 mr-1"/>En espera</span>
                      </div>
                      <button
                        onClick={() => aprobarEquipo(equipo.id)}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-600 text-white rounded-lg font-bold shadow transition disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={aprobando === equipo.id}
                      >
                        <BadgeCheck className="w-5 h-5" /> {aprobando === equipo.id ? 'Aprobando...' : 'Aprobar'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Sección: Categorías */}
            {selectedSection === "categorias" && (
              <section className="bg-white rounded-xl shadow p-8 mt-8 max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold mb-6 text-blue-800 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-lg">🏷️</span>
                  Categorías
                </h2>
                <form className="flex flex-col md:flex-row gap-4 mb-8 items-end bg-blue-50/50 p-4 rounded-xl border border-blue-100" onSubmit={handleCrearCategoria}>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-1">Nombre de la categoría <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="border border-gray-200 rounded-lg px-4 py-2 w-full"
                      placeholder="Ej: PRIMERA"
                      value={nuevaCategoria}
                      onChange={e => setNuevaCategoria(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-1">Descripción (opcional)</label>
                    <input
                      type="text"
                      className="border border-gray-200 rounded-lg px-4 py-2 w-full"
                      placeholder="Ej: Categoría principal de la liga"
                      value={nuevaDescripcionCategoria}
                      onChange={e => setNuevaDescripcionCategoria(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 w-fit">Crear</button>
                </form>
                <div className="overflow-x-auto rounded-xl border border-blue-100 bg-blue-50/30">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-blue-700 text-xs uppercase">
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">Nombre</th>
                        <th className="py-3 px-4">Descripción</th>
                        <th className="py-3 px-4">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categorias.map(cat => (
                        <tr key={cat.id} className="border-t border-blue-100 hover:bg-blue-100/40">
                          <td className="py-2 px-4 text-xs text-blue-400">{cat.id}</td>
                          <td className="py-2 px-4">
                            {editandoCategoriaId === cat.id ? (
                              <input
                                type="text"
                                className="border border-blue-300 rounded px-2 py-1 w-full"
                                value={editNombreCategoria}
                                onChange={e => setEditNombreCategoria(e.target.value)}
                                autoFocus
                              />
                            ) : (
                              <span className="font-semibold text-blue-800">{cat.nombre}</span>
                            )}
                          </td>
                          <td className="py-2 px-4">
                            {editandoCategoriaId === cat.id ? (
                              <input
                                type="text"
                                className="border border-blue-300 rounded px-2 py-1 w-full"
                                value={editDescripcionCategoria}
                                onChange={e => setEditDescripcionCategoria(e.target.value)}
                                placeholder="Descripción (opcional)"
                              />
                            ) : (
                              <span className="text-gray-600">{cat.descripcion || <span className="italic text-gray-400">Sin descripción</span>}</span>
                            )}
                          </td>
                          <td className="py-2 px-4">
                            {editandoCategoriaId === cat.id ? (
                              <div className="flex gap-2">
                                <button className="text-green-600 font-bold" onClick={() => guardarEditarCategoria(cat.id)}>Guardar</button>
                                <button className="text-gray-500" onClick={cancelarEditarCategoria}>Cancelar</button>
                              </div>
                            ) : (
                              <button className="text-blue-600 font-bold" onClick={() => startEditarCategoria(cat)}>Editar</button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {categorias.length === 0 && (
                        <tr><td colSpan={4} className="text-blue-400 italic py-6 text-center">No hay categorías registradas.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
            {/* Sección: Temporadas */}
            {selectedSection === "temporadas" && (
              <div className="max-w-4xl mx-auto flex flex-col gap-8">
                {/* Formulario crear temporada */}
                <div className="bg-white rounded-2xl shadow p-6 border border-blue-100">
                  <h2 className="text-2xl font-bold text-blue-700 mb-4">Crear nueva temporada</h2>
                  <form className="flex flex-col gap-4" onSubmit={handleCrearTemporada}>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold mb-1">Nombre de la temporada</label>
                        <input type="text" className="w-full border border-gray-200 rounded-lg px-4 py-2" value={nuevaTemporada.nombre} onChange={e => setNuevaTemporada(t => ({...t, nombre: e.target.value}))} required />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-semibold mb-1">Categoría</label>
                        <select className="w-full border border-gray-200 rounded-lg px-4 py-2" value={nuevaTemporada.categoria_id} onChange={e => setNuevaTemporada(t => ({...t, categoria_id: Number(e.target.value), equipos: []}))} required>
                          <option value="">Selecciona una categoría</option>
                          {categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold mb-1">Fecha inicio</label>
                        <input type="date" className="w-full border border-gray-200 rounded-lg px-4 py-2" value={nuevaTemporada.fecha_inicio} onChange={e => setNuevaTemporada(t => ({...t, fecha_inicio: e.target.value}))} required />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-semibold mb-1">Fecha fin</label>
                        <input type="date" className="w-full border border-gray-200 rounded-lg px-4 py-2" value={nuevaTemporada.fecha_fin} onChange={e => setNuevaTemporada(t => ({...t, fecha_fin: e.target.value}))} required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Equipos participantes</label>
                      <button type="button" className="mb-2 px-3 py-1 rounded bg-blue-500 text-white text-xs font-bold hover:bg-blue-600" onClick={handleSelectAllEquipos}>
                        {selectAllEquipos ? 'Deseleccionar todos' : 'Seleccionar todos'}
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {equipos.filter(eq => eq.categoria_id === nuevaTemporada.categoria_id).map(eq => (
                          <label key={eq.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={nuevaTemporada.equipos.includes(eq.id)}
                              onChange={e => handleEquiposCheckbox(e, eq.id)}
                              className="accent-blue-600"
                            />
                            <span>{eq.nombre}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-blue-700 transition w-fit self-end">Crear temporada</button>
                  </form>
                </div>
                {/* Listado de temporadas */}
                <div className="bg-white rounded-2xl shadow p-6 border border-blue-100">
                  <h2 className="text-xl font-bold text-blue-700 mb-4">Temporadas existentes</h2>
                  {temporadas.length === 0 ? (
                    <p className="text-gray-400">No hay temporadas registradas.</p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {temporadas.map(temp => (
                        <div key={temp.id} className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <div className="font-bold text-lg text-blue-700">{temp.nombre}</div>
                            <div className="text-sm text-gray-500">Categoría: <span className="font-semibold text-blue-600">{categorias.find(cat => cat.id === temp.categoria_id)?.nombre}</span></div>
                            <div className="text-sm text-gray-500">Fecha inicio: <span className="font-semibold text-blue-600">{temp.fecha_inicio}</span></div>
                            <div className="text-sm text-gray-500">Fecha fin: <span className="font-semibold text-blue-600">{temp.fecha_fin}</span></div>
                          </div>
                          <div className="flex flex-wrap gap-2 items-center">
                            {editandoTemporadaId === temp.id ? (
                              <div ref={editRef} className="flex flex-col gap-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {equipos.filter(eq => eq.categoria_id === temp.categoria_id).map(eq => (
                                    <label key={eq.id} className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={equiposEditTemp.includes(eq.id)}
                                        onChange={e => {
                                          if (e.target.checked) setEquiposEditTemp(arr => [...arr, eq.id])
                                          else setEquiposEditTemp(arr => arr.filter(id => id !== eq.id))
                                        }}
                                        className="accent-blue-600"
                                      />
                                      <span>{eq.nombre}</span>
                                    </label>
                                  ))}
                                </div>
                                <div className="flex gap-2 mt-2">
                                  <button className="bg-green-600 text-white px-4 py-1 rounded-lg font-bold hover:bg-green-700" onClick={() => guardarEditarTemporada(temp.id)}>Guardar</button>
                                  <button className="bg-gray-300 text-gray-700 px-4 py-1 rounded-lg font-bold hover:bg-gray-400" onClick={cancelarEditarTemporada}>Cancelar</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {temp.equipos.map(eqId => {
                                  const eq = equipos.find(e => e.id === eqId)
                                  return eq ? (
                                    <span key={eq.id} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-100">{eq.nombre}</span>
                                  ) : null
                                })}
                                <button className="ml-2 text-blue-600 font-bold underline text-xs" onClick={() => startEditarTemporada(temp.id, temp.equipos)}>Editar equipos</button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Aquí puedes agregar más secciones según selectedSection */}
          </section>
        </main>
      </div>
    </div>
  )
}
