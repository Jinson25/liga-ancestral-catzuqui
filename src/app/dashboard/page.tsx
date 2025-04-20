"use client"

import { useEffect, useState, useRef } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { BadgeCheck, Hourglass, Users, LayoutDashboard, Layers, ListChecks, User, Calendar, Settings, LogOut, Menu, X, Trophy } from "lucide-react"
import { NavBar } from "@/app/components/layout/navBarComponents"

type JSXElement = React.ReactElement;

interface SidebarItem {
  key: string;
  label: string;
  icon: JSXElement;
}

const sidebarItems: SidebarItem[] = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { key: "temporadas", label: "Temporadas", icon: <Calendar size={20} /> },
  { key: "categorias", label: "Categorías", icon: <Layers size={20} /> },
  { key: "fases", label: "Fases y Formatos", icon: <ListChecks size={20} /> },
  { key: "jugadores", label: "Jugadores", icon: <User size={20} /> },
  { key: "equipos", label: "Aprobar Equipos", icon: <Users size={20} /> },
]

interface Categoria {
  id: number
  nombre: string
  descripcion?: string
}

interface Equipo {
  id: number
  nombre: string
  categoria_id: number
}

interface Temporada {
  id: number
  nombre: string
  categoria_id: number
  fecha_inicio: string
  fecha_fin: string
  equipos: number[]
}

interface NuevaTemporada {
  nombre: string
  categoria_id: number | ""
  equipos: number[]
  fecha_inicio: string
  fecha_fin: string
}

interface Perfil {
  id: number
  rol: string
  nombre?: string
}

interface Fase {
  id: number
  nombre: string
  temporada_id: number
  orden: number
  formato_id?: number
}

interface Formato {
  id: number
  nombre: string
  descripcion?: string
  reglas?: string
}

interface NuevaFase {
  nombre: string
  temporada_id: number | null
  formato_id: number | null
  orden?: number
}

interface NuevoFormato {
  nombre: string
  descripcion?: string
  reglas?: string
}

interface Jugador {
  id: number
  nombre: string
  cedula: string
  equipo_id: number
  categoria_id: number
  fecha_nacimiento: string
  estado: string
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSection, setSelectedSection] = useState<string>("dashboard")
  const [equiposPendientes, setEquiposPendientes] = useState<Equipo[]>([])
  const [aprobando, setAprobando] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [temporadas, setTemporadas] = useState<Temporada[]>([])
  const [nuevaTemporada, setNuevaTemporada] = useState<NuevaTemporada>({ nombre: "", categoria_id: "", equipos: [], fecha_inicio: "", fecha_fin: "" })
  const [selectAllEquipos, setSelectAllEquipos] = useState(false)

  const [nuevaCategoria, setNuevaCategoria] = useState("")
  const [nuevaDescripcionCategoria, setNuevaDescripcionCategoria] = useState("")
  const [editandoCategoriaId, setEditandoCategoriaId] = useState<number|null>(null)
  const [editNombreCategoria, setEditNombreCategoria] = useState("")
  const [editDescripcionCategoria, setEditDescripcionCategoria] = useState("")

  const [fases, setFases] = useState<Fase[]>([])
  const [formatos, setFormatos] = useState<Formato[]>([])

  const [nuevaFase, setNuevaFase] = useState<NuevaFase>({ nombre: "", temporada_id: null, formato_id: null, orden: 1 })
  const [nuevoFormato, setNuevoFormato] = useState<NuevoFormato>({ nombre: "", descripcion: "", reglas: "" })

  const [jugadores, setJugadores] = useState<Jugador[]>([])
  const [searchJugador, setSearchJugador] = useState("")
  const [filtroEquipo, setFiltroEquipo] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState("")

  const editRef = useRef<HTMLDivElement>(null)

  const [editandoTemporadaId, setEditandoTemporadaId] = useState<number|null>(null)
  const [equiposEditTemp, setEquiposEditTemp] = useState<number[]>([])

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    const { data: categoriasData } = await supabase.from('categorias').select('id, nombre, descripcion')
    if (categoriasData) setCategorias(categoriasData)
  }

  function startEditarCategoria(cat: Categoria) {
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

  async function aprobarEquipo(equipoId: number) {
    setAprobando(String(equipoId))
    await supabase
      .from('equipos')
      .update({ estado: 'aprobado' })
      .eq('id', equipoId)

    const { data: equipo } = await supabase
      .from('equipos')
      .select('creado_por')
      .eq('id', equipoId)
      .single()

    if (equipo?.creado_por) {
      await supabase
        .from('perfiles')
        .update({ rol: 'equipo' })
        .eq('id', equipo.creado_por)
    }

    setAprobando(null)
    const { data, error } = await supabase
      .from('equipos')
      .select('id, nombre, estado, categoria_id, categorias(nombre), creado_por')
      .eq('estado', 'pendiente')
      .order('fecha_creacion', { ascending: true })
    if (!error && data) {
      setEquiposPendientes(data)
    }
  }

  useEffect(() => {
    async function fetchData() {
      const { data: categoriasData } = await supabase.from('categorias').select('id, nombre, descripcion')
      if (categoriasData) setCategorias(categoriasData)
      const { data: equiposData } = await supabase.from('equipos').select('id, nombre, categoria_id')
      if (equiposData) setEquipos(equiposData)
      const { data: temporadasData } = await supabase.from('temporadas').select('id, nombre, categoria_id, fecha_inicio, fecha_fin')
      const { data: equiposTemporadaData } = await supabase.from('equipos_temporada').select('equipo_id, temporada_id')
      if (temporadasData && equiposTemporadaData) {
        const temporadasConEquipos = temporadasData.map(temp => ({
          ...temp,
          equipos: equiposTemporadaData.filter(et => et.temporada_id === temp.id).map(et => et.equipo_id)
        }))
        setTemporadas(temporadasConEquipos)
      }
      const { data: fasesData } = await supabase.from('fases').select('id, nombre, temporada_id, orden, formato_id')
      if (fasesData) setFases(fasesData)
      const { data: formatosData } = await supabase.from('formatos').select('id, nombre, descripcion, reglas')
      if (formatosData) setFormatos(formatosData)
      const { data: jugadoresData } = await supabase.from('jugadores').select('id, nombre, cedula, equipo_id, categoria_id, fecha_nacimiento, estado')
      if (jugadoresData) setJugadores(jugadoresData)
    }
    fetchData()
  }, [supabase])

  async function handleCrearTemporada(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!nuevaTemporada.fecha_inicio || !nuevaTemporada.fecha_fin) {
      alert('Debes ingresar la fecha de inicio y fin')
      return
    }
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

    if (tempData && nuevaTemporada.equipos && nuevaTemporada.equipos.length > 0) {
      const insertData = nuevaTemporada.equipos.map(equipo_id => ({ equipo_id, temporada_id: tempData.id }))
      await supabase.from('equipos_temporada').insert(insertData)

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

  function startEditarTemporada(tempId: number, equipos: number[]) {
    setEditandoTemporadaId(tempId)
    setEquiposEditTemp([...equipos])
    setTimeout(() => {
      editRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 100)
  }

  function cancelarEditarTemporada() {
    setEditandoTemporadaId(null)
    setEquiposEditTemp([])
  }

  async function guardarEditarTemporada(tempId: number) {
    await supabase.from('equipos_temporada').delete().eq('temporada_id', tempId)
    const insertData = equiposEditTemp.map(equipo_id => ({ equipo_id, temporada_id: tempId }))
    if (insertData.length > 0) await supabase.from('equipos_temporada').insert(insertData)
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

  async function handleCrearFase(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!nuevaFase.nombre.trim() || !nuevaFase.temporada_id) return
    const { error } = await supabase.from('fases').insert({ 
      nombre: nuevaFase.nombre.trim(), 
      temporada_id: nuevaFase.temporada_id, 
      orden: nuevaFase.orden || 1,
      formato_id: nuevaFase.formato_id
    })
    
    if (error) {
      alert("Error al crear fase: " + error.message)
      return
    }
    
    setNuevaFase({ nombre: "", temporada_id: null, formato_id: null, orden: 1 })
    
    const { data: fasesData } = await supabase.from('fases').select('id, nombre, temporada_id, orden, formato_id')
    if (fasesData) setFases(fasesData)
  }

  async function handleCrearFormato(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!nuevoFormato.nombre.trim()) return
    
    // Usamos el operador de coalescencia nula para manejar los valores undefined
    const descripcion = nuevoFormato.descripcion?.trim() || null
    const reglas = nuevoFormato.reglas?.trim() || null
    
    const { error } = await supabase.from('formatos').insert({ 
      nombre: nuevoFormato.nombre.trim(),
      descripcion,
      reglas
    })
    
    if (error) {
      alert("Error al crear formato: " + error.message)
      return
    }
    setNuevoFormato({ nombre: "", descripcion: "", reglas: "" })
    const { data: formatosData } = await supabase.from('formatos').select('id, nombre, descripcion, reglas')
    if (formatosData) setFormatos(formatosData)
  }

  async function handleBorrarFormato(id: number) {
    if (!confirm("¿Estás seguro de eliminar este formato?")) return
    
    // Verificar si el formato está siendo usado en alguna fase
    const { data: fasesConFormato } = await supabase
      .from('fases')
      .select('id')
      .eq('formato_id', id)
    
    if (fasesConFormato && fasesConFormato.length > 0) {
      alert("No se puede eliminar este formato porque está siendo utilizado en una o más fases.")
      return
    }
    
    const { error } = await supabase.from('formatos').delete().eq('id', id)
    
    if (error) {
      alert("Error al eliminar formato: " + error.message)
      return
    }
    
    const { data: formatosData } = await supabase.from('formatos').select('id, nombre, descripcion, reglas')
    if (formatosData) setFormatos(formatosData)
  }

  async function handleBorrarFase(id: number) {
    if (!confirm("¿Estás seguro de eliminar esta fase?")) return
    
    const { error } = await supabase.from('fases').delete().eq('id', id)
    
    if (error) {
      alert("Error al eliminar fase: " + error.message)
      return
    }
    
    const { data: fasesData } = await supabase.from('fases').select('id, nombre, temporada_id, orden, formato_id')
    if (fasesData) setFases(fasesData)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-900 bg-gray-50">Cargando...</div>
  }
  if (!profile || profile.rol !== 'presidente' && profile.rol !== 'admin_liga') {
    return <div className="min-h-screen flex items-center justify-center text-xl text-red-400 bg-gray-50">Acceso denegado: solo presidentes o administradores pueden ver este panel.</div>
  }

  return (
    <div className="min-h-screen bg-[#f2fbfc] p-4 sm:p-6">
      {/* NavBar global arriba */}
      <NavBar />

      {/* Sidebar móvil: menú tipo "bottom navigation" similar a una app móvil */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-blue-100 shadow-lg flex items-center justify-around md:hidden">
        {sidebarItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setSelectedSection(item.key)}
            className="flex flex-col items-center py-2 px-1 w-full"
          >
            <div className={`p-1.5 rounded-full ${selectedSection === item.key ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}>
              {item.icon}
            </div>
            <span className={`text-xs mt-1 font-medium ${selectedSection === item.key ? 'text-blue-600' : 'text-gray-500'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-1">
        {/* Sidebar desktop */}
        <aside className="w-64 hidden md:flex flex-col py-8 px-4 gap-2 h-screen sticky top-0 bg-white border-r border-gray-100 overflow-y-auto">
          
          {sidebarItems.map(item => (
            <button
              key={item.key}
              onClick={() => setSelectedSection(item.key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                selectedSection === item.key 
                  ? 'bg-blue-600 text-white font-semibold shadow-md' 
                  : 'hover:bg-blue-50 text-gray-700'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          
          <div className="mt-auto flex flex-col gap-2 px-4 pt-6 border-t border-gray-100 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-white">
                {profile?.nombre?.substring(0, 2).toUpperCase() || 'AD'}
              </div>
              <div>
                <p className="font-medium text-sm">{profile?.nombre || 'Administrador'}</p>
                <p className="text-xs text-gray-500">{profile?.rol || 'admin_liga'}</p>
              </div>
            </div>
            <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition py-2">
              <Settings size={18}/> Configuración
            </button>
            <button className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition py-2">
              <LogOut size={18}/> Cerrar sesión
            </button>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0">
          <div className="bg-white p-4 shadow-sm border-b border-gray-100 flex items-center justify-between md:hidden sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 h-8 w-8 rounded-full flex items-center justify-center">
                <Trophy className="h-5 w-5 text-blue-600" />
              </span>
              <h1 className="text-lg font-bold"><a href="/">Liga Catzuqui</a></h1>
            </div>
          </div>
          
          {/* Dashboard Grid */}
          <div className="flex-1">
            {/* Mostrar solo el dashboard principal si está seleccionada esa sección */}
            {selectedSection === "dashboard" && (
              <div className="p-4 md:p-6">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 p-2 rounded-full"><LayoutDashboard size={24} /></span>
                    Panel de Control
                  </h1>
                  <p className="text-gray-600 mt-2">Bienvenido al panel de administración de la Liga Ancestral Catzuqui</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-md border border-blue-100 hover:shadow-lg transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-white">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <span className="text-amber-600 text-xs font-medium bg-amber-50 px-2 py-1 rounded-full">{temporadas.length} Total</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Temporadas</h3>
                    <p className="text-sm text-gray-500 mb-4">Gestiona temporadas activas</p>
                    <button 
                      onClick={() => setSelectedSection("temporadas")}
                      className="text-amber-600 text-sm font-semibold hover:text-amber-700 flex items-center gap-1 mt-auto"
                    >
                      Ver detalles 
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-md border border-blue-100 hover:shadow-lg transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white">
                        <Layers className="h-6 w-6" />
                      </div>
                      <span className="text-blue-600 text-xs font-medium bg-blue-50 px-2 py-1 rounded-full">{categorias.length} Total</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Categorías</h3>
                    <p className="text-sm text-gray-500 mb-4">Gestiona las divisiones por edad</p>
                    <button 
                      onClick={() => setSelectedSection("categorias")}
                      className="text-blue-600 text-sm font-semibold hover:text-blue-700 flex items-center gap-1 mt-auto"
                    >
                      Ver detalles 
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-md border border-blue-100 hover:shadow-lg transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-green-400 to-green-600 flex items-center justify-center text-white">
                        <User className="h-6 w-6" />
                      </div>
                      <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-full">{jugadores.length} Total</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Jugadores</h3>
                    <p className="text-sm text-gray-500 mb-4">Administra el registro de jugadores</p>
                    <button 
                      onClick={() => setSelectedSection("jugadores")}
                      className="text-green-600 text-sm font-semibold hover:text-green-700 flex items-center gap-1 mt-auto"
                    >
                      Ver detalles 
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-md border border-blue-100 hover:shadow-lg transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-400 to-red-600 flex items-center justify-center text-white">
                        <Users className="h-6 w-6" />
                      </div>
                      <span className="text-red-600 text-xs font-medium bg-red-50 px-2 py-1 rounded-full">{equiposPendientes.length} Pendientes</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Equipos</h3>
                    <p className="text-sm text-gray-500 mb-4">Aprueba equipos nuevos</p>
                    <button 
                      onClick={() => setSelectedSection("equipos")}
                      className="text-red-600 text-sm font-semibold hover:text-red-700 flex items-center gap-1 mt-auto"
                    >
                      Ver detalles 
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Gráficos y estadísticas - Solo en versión desktop */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 hidden md:grid">
                  <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Actividad Reciente</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Se creó la temporada <span className="text-blue-600">Apertura 2025</span></p>
                          <p className="text-xs text-gray-500 mt-1">Hace 2 días</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Se aprobó el equipo <span className="text-green-600">Deportivo Catzuqui</span></p>
                          <p className="text-xs text-gray-500 mt-1">Hace 3 días</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Se registraron <span className="text-amber-600">15 nuevos jugadores</span></p>
                          <p className="text-xs text-gray-500 mt-1">Hace 1 semana</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Próximos Eventos</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-100 bg-blue-50">
                        <div className="w-12 h-12 rounded-lg bg-white text-blue-600 flex flex-col items-center justify-center border border-blue-200">
                          <span className="text-xs font-semibold">Abr</span>
                          <span className="text-lg font-bold">25</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Reunión de delegados</p>
                          <p className="text-xs text-gray-500">18:00 - Sede Liga Catzuqui</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-green-100 bg-green-50">
                        <div className="w-12 h-12 rounded-lg bg-white text-green-600 flex flex-col items-center justify-center border border-green-200">
                          <span className="text-xs font-semibold">May</span>
                          <span className="text-lg font-bold">02</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Inicio de temporada</p>
                          <p className="text-xs text-gray-500">09:00 - Estadio Principal</p>
                        </div>
                      </div>
                    </div>
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
                        disabled={String(aprobando) === String(equipo.id)}
                      >
                        <BadgeCheck className="w-5 h-5" /> {String(aprobando) === String(equipo.id) ? 'Aprobando...' : 'Aprobar'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Sección: Categorías */}
            {selectedSection === "categorias" && (
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-blue-800 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 p-2 rounded-full"><Layers size={20} /></span>
                  Categorías
                </h2>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 items-end bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm" onSubmit={handleCrearCategoria}>
                  <div className="flex-1 md:col-span-2">
                    <label className="block text-sm font-semibold mb-2 text-blue-700">Nombre de la categoría <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="border border-blue-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none shadow-sm"
                    placeholder="Ej: PRIMERA"
                    value={nuevaCategoria}
                    onChange={e => setNuevaCategoria(e.target.value)}
                    required
                  />
                </div>
                <div className="flex-1 md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 text-blue-700">Descripción</label>
                  <textarea
                    className="border border-blue-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none shadow-sm"
                    placeholder="Ej: Categoría principal de la liga, edades entre 18-25 años"
                    value={nuevaDescripcionCategoria}
                    onChange={e => setNuevaDescripcionCategoria(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:from-blue-600 hover:to-blue-700 shadow-md transition-all transform hover:scale-105">
                    Crear Categoría
                  </button>
                </div>
              </form>
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm">
                        <th className="py-3 px-6 font-semibold">ID</th>
                        <th className="py-3 px-6 font-semibold">Nombre</th>
                        <th className="py-3 px-6 font-semibold">Descripción</th>
                        <th className="py-3 px-6 font-semibold text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categorias.map(cat => (
                        <tr key={cat.id} className="border-t border-gray-100 hover:bg-blue-50 transition-colors">
                          <td className="py-4 px-6 text-sm text-blue-500">{cat.id}</td>
                          <td className="py-4 px-6">
                            {editandoCategoriaId === cat.id ? (
                              <input
                                type="text"
                                className="border border-blue-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                value={editNombreCategoria}
                                onChange={e => setEditNombreCategoria(e.target.value)}
                                autoFocus
                              />
                            ) : (
                              <span className="font-semibold text-gray-800">{cat.nombre}</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            {editandoCategoriaId === cat.id ? (
                              <textarea
                                className="border border-blue-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                value={editDescripcionCategoria}
                                onChange={e => setEditDescripcionCategoria(e.target.value)}
                                placeholder="Descripción (opcional)"
                                rows={2}
                              />
                            ) : (
                              <span className="text-gray-600">{cat.descripcion || <span className="italic text-gray-400">Sin descripción</span>}</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right">
                            {editandoCategoriaId === cat.id ? (
                              <div className="flex gap-2 justify-end">
                                <button 
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg font-medium text-sm transition-colors"
                                  onClick={() => guardarEditarCategoria(cat.id)}
                                >
                                  Guardar
                                </button>
                                <button 
                                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-lg font-medium text-sm transition-colors"
                                  onClick={cancelarEditarCategoria}
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <button 
                                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg font-medium text-sm transition-colors"
                                onClick={() => startEditarCategoria(cat)}
                              >
                                Editar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {categorias.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-500 italic">
                            No hay categorías registradas. Crea la primera categoría para comenzar.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {/* Sección: Temporadas */}
          {selectedSection === "temporadas" && (
            <div className="max-w-6xl mx-auto p-4 md:p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 p-2 rounded-full"><Calendar size={20} /></span>
                  Temporadas
                </h1>
                <p className="text-gray-600 mt-1">Gestiona las temporadas de competición</p>
              </div>
              
              {/* Formulario crear temporada */}
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-blue-100 mb-8">
                <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Nueva Temporada
                </h2>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={handleCrearTemporada}>
                  <div className="space-y-4 md:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Nombre de la temporada</label>
                        <input 
                          type="text" 
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none shadow-sm" 
                          placeholder="Ej: Apertura 2025"
                          value={nuevaTemporada.nombre} 
                          onChange={e => setNuevaTemporada(t => ({...t, nombre: e.target.value}))} 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Categoría</label>
                        <select 
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none shadow-sm" 
                          value={nuevaTemporada.categoria_id} 
                          onChange={e => setNuevaTemporada(t => ({...t, categoria_id: Number(e.target.value), equipos: []}))}
                          required
                        >
                          <option value="">Selecciona una categoría</option>
                          {categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Fecha inicio</label>
                        <input 
                          type="date" 
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none shadow-sm" 
                          value={nuevaTemporada.fecha_inicio} 
                          onChange={e => setNuevaTemporada(t => ({...t, fecha_inicio: e.target.value}))}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Fecha fin</label>
                        <input 
                          type="date" 
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none shadow-sm" 
                          value={nuevaTemporada.fecha_fin} 
                          onChange={e => setNuevaTemporada(t => ({...t, fecha_fin: e.target.value}))}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="text-sm font-semibold mb-2 text-gray-700 flex items-center gap-1">
                      <span>Equipos participantes</span>
                      {nuevaTemporada.categoria_id && (
                        <button 
                          type="button" 
                          className="ml-2 px-3 py-1 rounded text-xs font-bold text-white bg-blue-500 hover:bg-blue-600"
                          onClick={handleSelectAllEquipos}
                        >
                          {selectAllEquipos ? 'Deseleccionar todos' : 'Seleccionar todos'}
                        </button>
                      )}
                    </h3>
                    
                    {!nuevaTemporada.categoria_id ? (
                      <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-600">
                        Selecciona una categoría para ver los equipos disponibles
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                        {equipos.filter(eq => eq.categoria_id === nuevaTemporada.categoria_id).map(eq => (
                          <label key={eq.id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100 rounded">
                            <input
                              type="checkbox"
                              checked={nuevaTemporada.equipos.includes(eq.id)}
                              onChange={e => handleEquiposCheckbox(e, eq.id)}
                              className="accent-blue-600 w-4 h-4"
                            />
                            <span className="text-sm font-medium">{eq.nombre}</span>
                          </label>
                        ))}
                        {equipos.filter(eq => eq.categoria_id === nuevaTemporada.categoria_id).length === 0 && (
                          <div className="col-span-full text-gray-500 text-sm p-2">
                            No hay equipos disponibles para esta categoría
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 flex justify-end">
                    <button 
                      type="submit" 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                      disabled={!nuevaTemporada.nombre || !nuevaTemporada.categoria_id || !nuevaTemporada.fecha_inicio || !nuevaTemporada.fecha_fin}
                    >
                      Crear Temporada
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Listado de temporadas existentes */}
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-blue-100">
                <h2 className="text-xl font-bold text-blue-700 mb-6 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 p-1.5 rounded-full">
                    <Calendar size={16} />
                  </span>
                  Temporadas Registradas
                </h2>
                
                {temporadas.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>No hay temporadas registradas.</p>
                    <p className="text-sm mt-1">Crea tu primera temporada para comenzar.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {temporadas.map(temp => (
                      <div 
                        key={temp.id} 
                        className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
                          <div className="flex items-center gap-3 mb-3 sm:mb-0">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                              <Calendar size={20} />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-800">{temp.nombre}</h3>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(temp.fecha_inicio).toLocaleDateString()} - {temp.fecha_fin ? new Date(temp.fecha_fin).toLocaleDateString() : 'En curso'}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => startEditarTemporada(temp.id, temp.equipos)}
                              className="text-blue-600 border border-blue-200 hover:bg-blue-50 font-medium rounded-lg px-3 py-1.5 text-sm flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-start"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Editar
                            </button>
                            <button
                              className="text-green-600 border border-green-200 hover:bg-green-50 font-medium rounded-lg px-3 py-1.5 text-sm flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-start"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              Ver Fases
                            </button>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h4 className="text-sm font-semibold mb-2 text-gray-700">Equipos ({temp.equipos.length})</h4>
                          <div className="flex flex-wrap gap-2">
                            {temp.equipos.length > 0 ? temp.equipos.map(equipoId => {
                              const equipo = equipos.find(eq => eq.id === equipoId);
                              return (
                                <span 
                                  key={equipoId} 
                                  className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium"
                                >
                                  {equipo?.nombre || `Equipo #${equipoId}`}
                                </span>
                              );
                            }) : (
                              <span className="text-sm text-gray-500">No hay equipos asignados a esta temporada</span>
                            )}
                          </div>
                        </div>
                        
                        {editandoTemporadaId === temp.id && (
                          <div className="p-4 bg-blue-50 border-t border-blue-200" ref={editRef}>
                            <h4 className="text-sm font-semibold mb-3 text-blue-700">Editar equipos de la temporada</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 max-h-40 overflow-y-auto p-2 bg-white rounded-lg">
                              {equipos.filter(eq => eq.categoria_id === temp.categoria_id).map(eq => (
                                <label key={eq.id} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={equiposEditTemp.includes(eq.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setEquiposEditTemp(prev => [...prev, eq.id]);
                                      } else {
                                        setEquiposEditTemp(prev => prev.filter(id => id !== eq.id));
                                      }
                                    }}
                                    className="accent-blue-600"
                                  />
                                  <span className="text-sm">{eq.nombre}</span>
                                </label>
                              ))}
                            </div>
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => cancelarEditarTemporada()}
                                className="px-3 py-1 border border-gray-300 rounded-md text-gray-600 text-sm"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={() => guardarEditarTemporada(temp.id)}
                                className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm"
                              >
                                Guardar Cambios
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
          </div>
          )}
          {/* Sección: Fases y Formatos */}
          {selectedSection === "fases" && (
            <div className="max-w-6xl mx-auto p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Columna izquierda: Formatos */}
                  <div className="w-full md:w-1/2">
                    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-blue-100 mb-6">
                      <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 p-1.5 rounded-full"><ListChecks size={16} /></span>
                        Formatos de Competición
                      </h2>
                      
                      {/* Formulario de creación de formato */}
                      <form className="mb-6" onSubmit={handleCrearFormato}>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700">Nombre del formato</label>
                            <input 
                              type="text" 
                              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none shadow-sm" 
                              placeholder="Ej: Liga, Copa, Eliminación directa"
                              value={nuevoFormato.nombre}
                              onChange={e => setNuevoFormato({...nuevoFormato, nombre: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700">Descripción</label>
                            <textarea 
                              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none shadow-sm" 
                              rows={3}
                              placeholder="Describe cómo funciona este formato de competición"
                              value={nuevoFormato.descripcion || ""}
                              onChange={e => setNuevoFormato({...nuevoFormato, descripcion: e.target.value})}
                            ></textarea>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700">Reglas específicas</label>
                            <textarea 
                              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none shadow-sm" 
                              rows={3}
                              placeholder="Ej: Puntos por victoria, empate, etc."
                              value={nuevoFormato.reglas || ""}
                              onChange={e => setNuevoFormato({...nuevoFormato, reglas: e.target.value})}
                            ></textarea>
                          </div>
                          <div className="flex justify-end">
                            <button 
                              type="submit" 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                            >
                              Crear Formato
                            </button>
                          </div>
                        </div>
                      </form>
                      
                      {/* Lista de formatos */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-600 border-b pb-2">Formatos disponibles</h3>
                        {formatos.length === 0 ? (
                          <div className="text-center text-gray-500 py-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="text-sm">No hay formatos registrados</p>
                          </div>
                        ) : (
                          <div className="max-h-[400px] overflow-y-auto pr-2">
                            {formatos.map(formato => (
                              <div 
                                key={formato.id} 
                                className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50 hover:bg-white hover:shadow-sm transition mb-3"
                              >
                                <div className="p-3 flex justify-between items-start">
                                  <div>
                                    <h4 className="font-semibold text-gray-800">{formato.nombre}</h4>
                                    <p className="text-xs text-gray-500 mt-1">{formato.descripcion || "Sin descripción"}</p>
                                  </div>
                                  <div className="flex gap-1">
                                    <button 
                                      onClick={() => handleBorrarFormato(formato.id)}
                                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Columna derecha: Fases */}
                  <div className="w-full md:w-1/2">
                    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-blue-100">
                      <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 p-1.5 rounded-full"><ListChecks size={16} /></span>
                        Fases de Competición
                      </h2>
                      
                      {/* Formulario de creación de fase */}
                      <form className="mb-6" onSubmit={handleCrearFase}>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700">Nombre de la fase</label>
                            <input 
                              type="text" 
                              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none shadow-sm" 
                              placeholder="Ej: Grupos, Octavos, Semifinal"
                              value={nuevaFase.nombre}
                              onChange={e => setNuevaFase({...nuevaFase, nombre: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700">Formato de competición</label>
                            <select 
                              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none shadow-sm" 
                              value={nuevaFase.formato_id ? nuevaFase.formato_id : ""}
                              onChange={e => setNuevaFase({...nuevaFase, formato_id: Number(e.target.value) || null})}
                              required
                            >
                              <option value="">Selecciona un formato</option>
                              {formatos.map(formato => (
                                <option key={formato.id} value={formato.id}>{formato.nombre}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700">Temporada</label>
                            <select 
                              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none shadow-sm" 
                              value={nuevaFase.temporada_id ? nuevaFase.temporada_id : ""}
                              onChange={e => setNuevaFase({...nuevaFase, temporada_id: Number(e.target.value) || null})}
                              required
                            >
                              <option value="">Selecciona una temporada</option>
                              {temporadas.map(temporada => (
                                <option key={temporada.id} value={temporada.id}>{temporada.nombre}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700">Orden</label>
                            <input 
                              type="number" 
                              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none shadow-sm" 
                              placeholder="Ej: 1"
                              value={nuevaFase.orden}
                              onChange={e => setNuevaFase({...nuevaFase, orden: Number(e.target.value)})}
                            />
                          </div>
                          <div className="flex justify-end">
                            <button 
                              type="submit" 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                            >
                              Crear Fase
                            </button>
                          </div>
                        </div>
                      </form>
                      
                      {/* Lista de fases */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-600 border-b pb-2">Fases registradas</h3>
                        
                        {fases.length === 0 ? (
                          <div className="text-center text-gray-500 py-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="text-sm">No hay fases registradas</p>
                          </div>
                        ) : (
                          <div className="max-h-[400px] overflow-y-auto pr-2">
                            {fases.map(fase => {
                              const temporada = temporadas.find(temp => temp.id === fase.temporada_id);
                              const formato = formatos.find(form => form.id === fase.formato_id);
                              
                              return (
                                <div 
                                  key={fase.id} 
                                  className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50 hover:bg-white hover:shadow-sm transition mb-3"
                                >
                                  <div className="p-3">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="font-semibold text-gray-800">{fase.nombre}</h4>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          {formato && (
                                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                                              {formato.nombre}
                                            </span>
                                          )}
                                          {temporada && (
                                            <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-medium">
                                              {temporada.nombre}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex gap-1">
                                        <button 
                                          onClick={() => handleBorrarFase(fase.id)}
                                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Sección: Jugadores */}
            {selectedSection === "jugadores" && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-blue-800 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 p-2 rounded-full"><User size={20} /></span>
                  Jugadores Registrados
                </h2>
                
                <div className="mb-6 flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                    <div className="relative w-full sm:w-64">
                      <input 
                        type="text" 
                        placeholder="Buscar jugador..." 
                        className="pl-10 pr-4 py-2 w-full rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none shadow-sm"
                        value={searchJugador}
                        onChange={e => setSearchJugador(e.target.value)}
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <select className="flex-1 min-w-[140px] border border-blue-200 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none shadow-sm" value={filtroEquipo} onChange={e => setFiltroEquipo(e.target.value)}>
                        <option value="">Todos los equipos</option>
                        {equipos.map(eq => (
                          <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                        ))}
                      </select>
                      <select className="flex-1 min-w-[140px] border border-blue-200 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none shadow-sm" value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
                        <option value="">Categorías</option>
                        {categorias.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition-all transform hover:scale-105 flex items-center gap-2 justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Inscribir Jugador
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm">
                          <th className="py-3 px-3 sm:px-4 font-semibold">Jugador</th>
                          <th className="py-3 px-3 sm:px-4 font-semibold">Cédula</th>
                          <th className="py-3 px-3 sm:px-4 font-semibold">Equipo</th>
                          <th className="py-3 px-3 sm:px-4 font-semibold text-center hidden md:table-cell">Categoría</th>
                          <th className="py-3 px-3 sm:px-4 font-semibold text-center hidden sm:table-cell">Edad</th>
                          <th className="py-3 px-3 sm:px-4 font-semibold text-center">Estado</th>
                          <th className="py-3 px-3 sm:px-4 font-semibold text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jugadores.filter(jugador => {
                          const equipo = equipos.find(eq => eq.id === jugador.equipo_id);
                          const categoria = categorias.find(cat => cat.id === jugador.categoria_id);
                          const edad = new Date().getFullYear() - new Date(jugador.fecha_nacimiento).getFullYear();
                          
                          return (
                            jugador.nombre.toLowerCase().includes(searchJugador.toLowerCase()) &&
                            (!filtroEquipo || equipo?.id === Number(filtroEquipo)) &&
                            (!filtroCategoria || categoria?.id === Number(filtroCategoria))
                          );
                        }).map(jugador => {
                          const equipo = equipos.find(eq => eq.id === jugador.equipo_id);
                          const categoria = categorias.find(cat => cat.id === jugador.categoria_id);
                          const edad = new Date().getFullYear() - new Date(jugador.fecha_nacimiento).getFullYear();
                          
                          return (
                            <tr key={jugador.id} className="border-t border-gray-100 hover:bg-blue-50 transition-colors">
                              <td className="py-3 px-3 sm:px-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs sm:text-sm">
                                    {jugador.nombre.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{jugador.nombre}</p>
                                    <p className="text-xs text-gray-500 sm:hidden">{equipo?.nombre || '-'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-3 sm:px-4 text-gray-700">{jugador.cedula}</td>
                              <td className="py-3 px-3 sm:px-4 font-medium text-blue-700">{equipo?.nombre || '-'}</td>
                              <td className="py-3 px-3 sm:px-4 text-center hidden md:table-cell">{categoria?.nombre || '-'}</td>
                              <td className="py-3 px-3 sm:px-4 text-center hidden sm:table-cell">{edad} años</td>
                              <td className="py-3 px-3 sm:px-4 text-center">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  jugador.estado === 'activo' ? 'bg-green-100 text-green-800' : 
                                  jugador.estado === 'suspendido' ? 'bg-red-100 text-red-800' : 
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {jugador.estado === 'activo' ? 'Activo' : 
                                   jugador.estado === 'suspendido' ? 'Susp.' : 'Pend.'}
                                </span>
                              </td>
                              <td className="py-3 px-3 sm:px-4 text-right">
                                <div className="flex gap-1 sm:gap-2 justify-end">
                                  <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-1 rounded-lg transition-colors" title="Ver detalles">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </button>
                                  <button 
                                    className="bg-amber-100 hover:bg-amber-200 text-amber-700 p-1 rounded-lg transition-colors sm:hidden" 
                                    title="Ver info completa"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </button>
                                  <button 
                                    className="hidden sm:block bg-amber-100 hover:bg-amber-200 text-amber-700 p-1 rounded-lg transition-colors" 
                                    title="Editar"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  {jugador.estado === 'activo' ? (
                                    <button 
                                      className="bg-red-100 hover:bg-red-200 text-red-700 p-1 rounded-lg transition-colors" 
                                      title="Suspender"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                      </svg>
                                    </button>
                                  ) : (
                                    <button 
                                      className="bg-green-100 hover:bg-green-200 text-green-700 p-1 rounded-lg transition-colors" 
                                      title="Activar"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-500 order-2 sm:order-1">Mostrando {jugadores.length} jugadores</div>
                  <div className="flex gap-2 order-1 sm:order-2">
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 text-sm">Anterior</button>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">1</button>
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 text-sm">2</button>
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 text-sm">3</button>
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 text-sm">Siguiente</button>
                  </div>
                </div>
              </div>
            )}
            {/* Aquí puedes agregar más secciones según selectedSection */}
          </div>
        </main>
      </div>
      {/* Espacio extra para móvil para evitar que el NavBar tape info */}
      <div className="block md:hidden h-24" />
    </div>
  );
}
