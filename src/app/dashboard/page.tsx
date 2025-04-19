import { NavBar } from "../components/layout/navBarComponents"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DashboardPage } from '../components/dashboard/dashboard-page'

export default async function Dashboard() {
    const supabase = createServerComponentClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        redirect('/')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-4 sm:p-6">
            <NavBar />
            <DashboardPage />
        </div>
    )
}
