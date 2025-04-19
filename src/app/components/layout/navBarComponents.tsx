

import Link from "next/link"
import { AuthButtonServer } from "../auth/auth-button-server"
import { Search, Trophy } from "lucide-react"

export function NavBar() {
    return (
        <div className="flex flex-wrap justify-between items-center mb-6 space-y-4 sm:space-y-0 md:space-x-4 z-99">
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
                <AuthButtonServer></AuthButtonServer>
            </div>
        </div>
    )

}
