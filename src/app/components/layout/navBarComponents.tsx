"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { AuthButton } from "../auth/auth-button"
import { Search, Trophy } from "lucide-react"

// --- BOTTOM NAVBAR FOR MOBILE ---
function MobileBottomNav({ isLoggedIn, userRole, showButton }: { isLoggedIn: boolean, userRole?: string | null, showButton?: 'crear'|'gestionar'|null }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg flex justify-around items-center h-16 md:hidden">
      <Link href="/" className="flex flex-col items-center text-blue-700 hover:text-blue-900 text-xs font-semibold">
        <Trophy className="w-6 h-6 mb-1" />Inicio
      </Link>
      
      {/* Botón azul: Gestionar Liga o Crear equipo - CENTRADO */}
      {isLoggedIn && showButton === 'gestionar' && (
        <Link href="/dashboard" className="flex flex-col items-center">
          <span className="inline-block w-6 h-6 mb-1 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">⚡</span>
          <span className="text-xs font-semibold text-blue-700">Gestionar Liga</span>
        </Link>
      )}
      {isLoggedIn && showButton === 'crear' && (
        <Link href="/crear-equipo" className="flex flex-col items-center">
          <span className="inline-block w-6 h-6 mb-1 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">+</span>
          <span className="text-xs font-semibold text-blue-700">Equipo</span>
        </Link>
      )}
      {/* Si está logeado: botón perfil; si no, botón iniciar sesión */}
      {isLoggedIn ? (
        <Link href="/perfil" className="flex flex-col items-center text-blue-700 hover:text-blue-900 text-xs font-semibold">
          <span className="inline-block w-6 h-6 mb-1 bg-gray-300 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-700"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 0115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75V19.5z" /></svg>
          </span>
          Perfil
        </Link>
      ) : (
        <AuthButton />
      )}
    </nav>
  );
}

export function NavBar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userRole, setUserRole] = useState<string | null>(null)
    const supabase = createClientComponentClient()
    const [showButton, setShowButton] = useState<'crear'|'gestionar'|null>(null)
    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setIsLoggedIn(!!session)
            if (session) {
                // Obtener el perfil y rol del usuario
                const { data, error } = await supabase
                    .from('perfiles')
                    .select('rol')
                    .eq('id', session.user.id)
                    .single()
                if (!error && data) {
                    setUserRole(data.rol)
                    setShowButton(data.rol === 'presidente' ? 'gestionar' : 'crear')
                }
                else {
                    setUserRole(null)
                    setShowButton(null)
                }
            } else {
                setUserRole(null)
                setShowButton(null)
            }
        }
        getSession()
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session)
            if (session) {
                supabase
                  .from('perfiles')
                  .select('rol')
                  .eq('id', session.user.id)
                  .single()
                  .then(({ data, error }) => {
                    if (!error && data) {
                        setUserRole(data.rol)
                        setShowButton(data.rol === 'presidente' ? 'gestionar' : 'crear')
                    }
                    else {
                        setUserRole(null)
                        setShowButton(null)
                    }
                  })
            } else {
                setUserRole(null)
                setShowButton(null)
            }
        })
        return () => {
            listener?.subscription.unsubscribe()
        }
    }, [supabase])

    return (
      <>
        {/* Desktop/Tablet Navbar */}
        <div className="hidden md:flex flex-wrap justify-between items-center mb-6 space-y-4 sm:space-y-0 md:space-x-4 z-20">
            <div className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-teal-600 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-white" />
                </div>
                <Link href="/"> <h1 className="text-xl sm:text-2xl font-bold">Liga Catzuqui</h1></Link>
            </div>
            <div className="flex items-center space-x-4">
                <div className="relative w-full sm:w-auto">
                    <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="w-full sm:w-auto pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                </div>
                {/* Botón azul: Gestionar Liga para presidente, Crear equipo para otros logeados */}
                {isLoggedIn && showButton === 'gestionar' && (
                    <Link
                        href="/dashboard"
                        className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-semibold"
                    >
                        Gestionar Liga
                    </Link>
                )}
                {isLoggedIn && showButton === 'crear' && (
                    <Link
                        href="/crear-equipo"
                        className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-semibold"
                    >
                        Crear equipo
                    </Link>
                )}
                <AuthButton />
            </div>
        </div>
        {/* Mobile Bottom Navbar */}
        <MobileBottomNav isLoggedIn={isLoggedIn} userRole={userRole} showButton={showButton} />
      </>
    )
}
