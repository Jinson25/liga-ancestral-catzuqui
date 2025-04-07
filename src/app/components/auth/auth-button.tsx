'use client'

import { type Session, createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Image from "next/image"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthForms } from "./auth-forms";

export function AuthButton({ session }: { session: Session | null }) {
    const [isOpen, setIsOpen] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const supabase = createClientComponentClient();
    const router = useRouter();

    const user = session?.user;  
    const userName = user?.user_metadata.full_name || ;
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
                        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-2" />
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
                            src={userImage || `https://ui-avatars.com/api/?name=${userName}&background=0D8ABC&color=fff&size=128`}
                            alt={userName || "Usuario"}
                            width={40}
                            height={40}
                            className="rounded-full"
                        />
                        <span className="text-gray-700">{userName}</span>
                    </button>

                    {isOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
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
                        <AuthForms mode={authMode} onClose={() => setShowAuthModal(false)} />
                    </div>
                </div>
            )}
        </div>
    )
}