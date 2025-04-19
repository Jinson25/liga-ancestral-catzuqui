import { NavBar } from "../components/layout/navBarComponents"
import { ProfileContent } from "../components/profile/profile-content"

export default function Perfil() {
    return (
        <>
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-4 sm:p-6">
            <NavBar />
            <ProfileContent />
        </div>
        </>
    )
}
