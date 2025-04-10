'use client'

import { type Session, createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Image from "next/image"
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AuthForms } from "./auth-forms";

export function AuthButton({ session }: { session: Session | null }) {
    const [isOpen, setIsOpen] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [userDBName, setUserDBName] = useState<string | null>(null);
    const supabase = createClientComponentClient();
    const router = useRouter();

    const user = session?.user;

    useEffect(() => {
        async function fetchUserName() {
            if (user) {
                const { data, error } = await supabase
                    .from('usuarios')
                    .select('nombre')
                    .eq('id', user.id)
                    .single();

                if (!error && data) {
                    setUserDBName(data.nombre);
                }
            }
        }
        fetchUserName();
    }, [user, supabase]);

    const userName = user?.user_metadata.full_name || userDBName || user?.email;
    const userImage = user?.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${userName}&background=random`;

    const handleGoogleSignIn = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: 'http://localhost:3000/auth/callback',
            }
        });
    }

    const handleSignOut = async () => {
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
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                            <a href="/liga" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Liga</a>
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