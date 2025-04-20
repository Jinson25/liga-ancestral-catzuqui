'use client'

import { type Session, createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Image from "next/image"
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AuthForms } from "./auth-forms";

type Equipo = { id: string; nombre: string | null };

export function AuthButton({ session: sessionProp }: { session?: Session | null }) {
    const [session, setSession] = useState<Session | null>(sessionProp ?? null);
    const [isOpen, setIsOpen] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [perfil, setPerfil] = useState<{ nombre: string | null, rol: string | null } | null>(null);
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const supabase = createClientComponentClient();
    const router = useRouter();

    useEffect(() => {
        if (sessionProp === undefined) {
            const getSession = async () => {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
            };
            getSession();
            const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
                setSession(session);
            });
            return () => {
                listener?.subscription.unsubscribe();
            };
        } else {
            setSession(sessionProp);
        }
    }, [supabase, sessionProp]);

    useEffect(() => {
        async function fetchOrCreatePerfil() {
            if (session) {
                // Buscar el perfil en la tabla 'perfiles'
                const { data, error } = await supabase
                    .from('perfiles')
                    .select('nombre, rol')
                    .eq('id', session.user.id)
                    .single();
                if (data) {
                    setPerfil({ nombre: data.nombre, rol: data.rol });
                } else if (error && error.code === 'PGRST116') { // Not found
                    // Crear perfil si no existe
                    const nombre = session.user.user_metadata.full_name || session.user.email;
                    await supabase
                        .from('perfiles')
                        .insert([{ id: session.user.id, nombre, rol: 'usuario' }]);
                    setPerfil({ nombre, rol: 'usuario' });
                } else {
                    setPerfil({ nombre: null, rol: null });
                }
            } else {
                setPerfil(null);
            }
        }
        fetchOrCreatePerfil();
    }, [session, supabase]);

    useEffect(() => {
        async function fetchEquipos() {
            if (session) {
                const { data, error } = await supabase
                    .from('equipos')
                    .select('id, nombre')
                    .eq('representante_id', session.user.id)
                if (!error && data) setEquipos(data)
                else setEquipos([])
            } else {
                setEquipos([])
            }
        }
        fetchEquipos();
    }, [session, supabase]);

    const user = session?.user;

    const userName = perfil?.nombre || user?.user_metadata.full_name || user?.email;
    const userImage = user?.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${userName}&background=random`;

    const handleGoogleSignIn = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/auth/callback',
            }
        });
    }

    const handleSignOut = async () => {
        setIsOpen(false);
        await supabase.auth.signOut();
        router.refresh();
    }

    return (
        <div className="relative">
            {session === null ? (
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowAuthModal(true)}
                        className="h-10 px-6 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300"
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        onClick={handleGoogleSignIn}
                        className="h-10 px-6 rounded-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 flex items-center"
                    >
                        <Image src="https://www.google.com/favicon.ico" alt="Google" width={20} height={20} className="mr-2" />
                        Iniciar con Google
                    </button>
                </div>
            ) : (
                <div>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center space-x-2 focus:outline-none"
                    >
                        <Image
                            src={userImage}
                            alt={userName || "Usuario"}
                            width={40}
                            height={40}
                            className="rounded-full"
                        />
                        <span className="text-gray-700">{userName}</span>
                    </button>

                    {isOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50">
                            {/* GESTIONAR LIGA solo para presidente, lleva a dashboard */}
                            {perfil?.rol === 'presidente' && (
                                <a href="/dashboard" className="block w-full text-left px-4 py-2 text-sm text-blue-700 font-semibold hover:bg-gray-100">Gestionar Liga</a>
                            )}
                            {/* GESTIONAR EQUIPO si tiene equipos, CREAR EQUIPO si no tiene */}
                            {perfil?.rol !== 'presidente' && equipos.length > 0 && (
                                <>
                                    <span className="block px-4 py-2 text-xs text-gray-500">Tus equipos</span>
                                    {equipos.map(eq => (
                                        <a key={eq.id} href={`/equipo/${eq.id}`} className="block w-full text-left px-6 py-1 text-sm text-gray-700 hover:bg-gray-100">{eq.nombre}</a>
                                    ))}
                                    <a href="/crear-equipo" className="block w-full text-left px-4 py-2 text-sm text-blue-700 font-semibold hover:bg-gray-100">Gestionar equipo</a>
                                </>
                            )}
                            {perfil?.rol !== 'presidente' && equipos.length === 0 && (
                                <a href="/crear-equipo" className="block w-full text-left px-4 py-2 text-sm text-blue-700 font-semibold hover:bg-gray-100">Crear equipo</a>
                            )}
                            {/* Liga (dashboard) solo para presidente */}
                            {/* <a href="/dashboard" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Liga</a> */}
                            <a href="/perfil" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Perfil</a>
                            <button
                                onClick={handleSignOut}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            )}

            {showAuthModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="relative bg-white rounded-lg max-w-md w-full mx-4">
                        <button
                            onClick={() => setShowAuthModal(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <AuthForms onClose={() => setShowAuthModal(false)} />
                    </div>
                </div>
            )}
        </div>
    )
}