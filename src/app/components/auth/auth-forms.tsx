'use client'

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'

export function AuthForms({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
        }
      })
      if (error) throw error
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Ha ocurrido un error inesperado')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (signInError) throw signInError

        // Only close and refresh if successful
        onClose()
        router.refresh()
      } else {
        if (!username.trim()) {
          throw new Error('El nombre de usuario es obligatorio')
        }

        // Registro
        const { error: signUpError, data: { user } } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: username
            }
          }
        })
        
        if (signUpError) throw signUpError
        if (!user) throw new Error('Error al crear el usuario')

        // Insertar perfil en la tabla perfiles
        const { error: insertError } = await supabase
          .from('perfiles')
          .insert([{
            id: user.id, // UUID de Supabase Auth
            nombre: username,
            rol: 'usuario'
          }])
        
        if (insertError) {
          // Si falla, intenta eliminar el usuario auth
          await supabase.auth.admin.deleteUser(user.id)
          throw new Error('Error al crear el perfil de usuario')
        }

        // Solo cerrar y refrescar si todo fue exitoso
        onClose()
        router.refresh()
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message?.includes('Too many requests')) {
          setErrorMessage('Demasiados intentos. Por favor, espera unos minutos.')
        } else {
          setErrorMessage(error.message || 'Error al procesar la solicitud')
        }
      } else {
        setErrorMessage('Ha ocurrido un error inesperado')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        {mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
      </h2>
      
      <form onSubmit={handleEmailSignIn} className="space-y-5">
        {mode === 'register' && (
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User size={20} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Tu nombre de usuario"
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>
          </div>
        )}

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail size={20} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="tucorreo@ejemplo.com"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>
        </div>
        
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock size={20} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••"
              required
              disabled={loading}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={6}
            />
          </div>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle size={20} />
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={20} className="animate-spin" />}
          {loading ? 'Procesando...' : (mode === 'login' ? 'Iniciar Sesión' : 'Registrarse')}
        </button>

        <div className="text-sm text-center">
          {mode === 'login' ? (
            <button
              type="button"
              onClick={() => setMode('register')}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
              disabled={loading}
            >
              ¿No tienes cuenta? Regístrate
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
              disabled={loading}
            >
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          )}
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">O continuar con</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="mt-4 w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <Image src="https://www.google.com/favicon.ico" alt="Google" width={20} height={20} />
          Iniciar con Google
          {loading && <Loader2 size={20} className="animate-spin" />}
        </button>
      </div>
    </div>
  )
}
