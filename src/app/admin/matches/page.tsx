import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/app/types/database'
import { redirect } from 'next/navigation'
import MatchAdmin from '@/app/components/match/match-admin'

export default async function MatchesAdminPage() {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Verificar si el usuario es administrador
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (userError || userData?.role !== 'admin') {
    redirect('/')
  }

  return (
    <main className="container mx-auto">
      <MatchAdmin />
    </main>
  )
}
