import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({ children }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfis')
    .select('nome_negocio')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen bg-paper overflow-hidden">
      <Sidebar nomeNegocio={perfil?.nome_negocio || 'Meu Mercado'} />
      <main className="flex-1 overflow-auto bg-paper-2">
        {children}
      </main>
    </div>
  )
}
