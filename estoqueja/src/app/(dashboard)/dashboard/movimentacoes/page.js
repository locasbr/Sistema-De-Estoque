import { createClient } from '@/lib/supabase/server'
import MovimentacoesClient from '@/components/MovimentacoesClient'

export default async function MovimentacoesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: produtos }, { data: movs }] = await Promise.all([
    supabase.from('produtos').select('id, nome, quantidade').eq('user_id', user.id).eq('ativo', true).order('nome'),
    supabase.from('movimentacoes')
      .select('*, produtos(nome)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  return <MovimentacoesClient produtosIniciais={produtos ?? []} movsIniciais={movs ?? []} userId={user.id} />
}
