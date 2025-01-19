'use client'

import { type Session, createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation";
import { useState } from "react";
export function AuthButton({ session }: { session: Session | null }) {

    const [isOpen, setIsOpen] = useState(false);
    const supabase = createClientComponentClient();
    const router = useRouter();

    const user = session?.user;
    const userName = user?.user_metadata.full_name || user?.email;
    const userImage = user?.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${userName}&background=random`;

    const handleSignIn = async () => {
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
                <button
                    onClick={handleSignIn}
                    className="h-10 px-6 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300"
                >
                    Iniciar Sesión
                </button>
            ) : (
                <div>
                    {/* User Avatar Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center space-x-2 focus:outline-none"
                    >
                        <img
                            src={userImage}
                            alt="Profile"
                            className="w-10 h-10 rounded-full border-2 border-gray-200"
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                        <div
                            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-10 border border-gray-200"
                        >
                            <div className="px-4 py-2 border-b">
                                <p className="text-sm font-semibold text-gray-700 truncate">
                                    {userName}
                                </p>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors duration-200"
                            >
                                Salir
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

}