import React from "react"
import { Trophy, Users, ClipboardCheck, Layers, FilePlus2, ListChecks, LayoutDashboard } from "lucide-react"

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
  return (
    <aside className=" text-white w-full md:w-64 min-h-full rounded-3xl md:rounded-l-3xl md:rounded-r-none shadow-xl p-4 flex flex-row md:flex-col gap-2 md:gap-4 items-center md:items-stretch">
      {sidebarItems.map(item => (
        <button
          key={item.key}
          onClick={() => onSelect(item.key)}
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition text-base font-semibold w-full text-left ${selected === item.key ? 'bg-blue-900/80' : 'hover:bg-blue-800/70'}`}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </aside>
  )
}
