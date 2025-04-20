import React, { useState } from "react"
import { Trophy, Users, ClipboardCheck, Layers, FilePlus2, ListChecks, LayoutDashboard, Menu } from "lucide-react"

const sidebarItems = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { key: "equipos", label: "Aprobar Equipos", icon: <Trophy className="w-5 h-5" /> },
  { key: "categorias", label: "Categorías", icon: <Layers className="w-5 h-5" /> },
  { key: "fases", label: "Fases y Formatos", icon: <ListChecks className="w-5 h-5" /> },
  { key: "jugadores", label: "Jugadores", icon: <Users className="w-5 h-5" /> },
  { key: "temporadas", label: "Temporadas", icon: <ClipboardCheck className="w-5 h-5" /> },
  { key: "crear-categoria", label: "Crear Categoría", icon: <FilePlus2 className="w-5 h-5" /> },
]

export default function Sidebar({ selected, onSelect }: { selected: string, onSelect: (key: string) => void }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Sidebar para desktop/tablet
  const sidebarContent = (
    <nav className="flex flex-col gap-2 md:gap-4 items-center md:items-stretch w-full">
      {sidebarItems.map(item => (
        <button
          key={item.key}
          onClick={() => { onSelect(item.key); setDrawerOpen(false); }}
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition text-base font-semibold w-full text-left ${selected === item.key ? 'bg-blue-900/80 text-white' : 'hover:bg-blue-800/70 text-blue-900'}`}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )

  return (
    <>
      {/* Botón hamburguesa solo en móvil */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 bg-blue-700 text-white p-2 rounded-full shadow-lg focus:outline-none"
        onClick={() => setDrawerOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu className="w-7 h-7" />
      </button>

      {/* Drawer lateral en móvil */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Fondo oscuro */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative w-64 max-w-[80vw] bg-white h-full shadow-2xl p-6 flex flex-col gap-6 animate-slide-in-left">
            <button
              className="absolute top-2 right-2 text-blue-700 hover:text-blue-900 text-xl"
              onClick={() => setDrawerOpen(false)}
              aria-label="Cerrar menú"
            >
              ×
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Sidebar clásico en desktop/tablet */}
      <aside className="hidden md:flex text-white w-full md:w-64 min-h-full rounded-3xl md:rounded-l-3xl md:rounded-r-none shadow-xl p-4 bg-blue-900">
        {sidebarContent}
      </aside>
    </>
  )
}

// Animación simple para el drawer
// Agrega esto a tu CSS global o tailwind.config.js:
// .animate-slide-in-left { animation: slide-in-left 0.2s cubic-bezier(0.4,0,0.2,1) both; }
// @keyframes slide-in-left { from { transform: translateX(-100%); opacity:0; } to { transform: translateX(0); opacity:1; } }
