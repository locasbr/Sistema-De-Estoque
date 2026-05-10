import { createClient } from '@/lib/supabase/server'
import ProdutosClient from '@/components/ProdutosClient'

export default async function ProdutosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: produtos } = await supabase
    .from('produtos')
    .select('*')
    .eq('user_id', user.id)
    .eq('ativo', true)
    .order('nome')

  return <ProdutosClient produtosIniciais={produtos ?? []} userId={user.id} />
}
