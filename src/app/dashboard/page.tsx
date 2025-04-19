"use client"

import { useEffect, useState } from "react"
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
          <section className="flex-1 p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 bg-gray-50">
            {/* Métricas principales */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-yellow-200 to-yellow-50 text-yellow-900 font-bold text-lg flex flex-col gap-2 shadow">
              <span className="text-xs font-semibold text-yellow-800">% Jugadores Validados</span>
              <span className="text-3xl">98.5%</span>
            </div>
            <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-200 to-blue-50 text-blue-900 font-bold text-lg flex flex-col gap-2 shadow">
              <span className="text-xs font-semibold text-blue-800">Equipos en espera</span>
              <span className="text-3xl">{equiposPendientes.length}</span>
            </div>
            <div className="rounded-2xl p-6 bg-gradient-to-br from-green-200 to-green-50 text-green-900 font-bold text-lg flex flex-col gap-2 shadow">
              <span className="text-xs font-semibold text-green-800">Total Jugadores</span>
              <span className="text-3xl">312</span>
            </div>
            <div className="rounded-2xl p-6 bg-gradient-to-br from-pink-200 to-pink-50 text-pink-900 font-bold text-lg flex flex-col gap-2 shadow">
              <span className="text-xs font-semibold text-pink-800">Pagos recibidos</span>
              <span className="text-3xl">$2,125</span>
            </div>
            {/* Equipos pendientes */}
            {selectedSection === "equipos" && (
              <div className="rounded-2xl p-6 bg-white text-gray-900 font-bold text-lg flex flex-col gap-2 shadow col-span-1 md:col-span-2 xl:col-span-4">
                <span className="text-xs font-semibold text-blue-700">Equipos pendientes de aprobación</span>
                <div className="flex flex-col gap-4">
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
          </section>
        </main>
      </div>
    </div>
  )
}
