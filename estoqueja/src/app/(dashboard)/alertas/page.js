import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AlertasPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: produtos } = await supabase
    .from('produtos')
    .select('*')
    .eq('user_id', user.id)
    .eq('ativo', true)
    .order('quantidade', { ascending: true })

  const esgotados = produtos?.filter(p => p.quantidade === 0) ?? []
  const baixos    = produtos?.filter(p => p.quantidade > 0 && p.quantidade <= p.qtd_minima) ?? []

  const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const ProdRow = ({ p, tipo }) => (
    <tr className="border-b border-paper-3 last:border-0 hover:bg-paper transition-colors">
      <td className="px-5 py-3.5 font-medium text-ink">{p.nome}</td>
      <td className="px-4 py-3.5 text-ink-3">{p.categoria}</td>
      <td className="px-4 py-3.5">
        <span className={tipo === 'esgotado' ? 'text-danger font-semibold' : 'text-warn font-semibold'}>
          {p.quantidade}
        </span>
        <span className="text-ink-4 text-xs"> / {p.qtd_minima} mín.</span>
      </td>
      <td className="px-4 py-3.5 text-ink-3">{fmt(p.preco_venda)}</td>
      <td className="px-4 py-3.5 text-right pr-5">
        <Link href={`/dashboard/movimentacoes`} className="btn btn-sm">
          + Registrar entrada
        </Link>
      </td>
    </tr>
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink">Alertas de Estoque</h1>
        <p className="text-sm text-ink-3">{esgotados.length + baixos.length} produto(s) precisam de atenção</p>
      </div>

      {esgotados.length === 0 && baixos.length === 0 && (
        <div className="card p-10 text-center">
          <div className="text-4xl mb-3">✓</div>
          <p className="text-ink font-medium">Estoque em dia!</p>
          <p className="text-sm text-ink-3 mt-1">Nenhum produto esgotado ou abaixo do mínimo.</p>
        </div>
      )}

      {esgotados.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="badge badge-out">Esgotados</span>
            <span className="text-sm text-ink-3">{esgotados.length} produto(s) sem estoque</span>
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-danger-light/50 border-b border-paper-3">
                  {['Produto', 'Categoria', 'Quantidade', 'Preço venda', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-danger-dark uppercase tracking-wide font-medium first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{esgotados.map(p => <ProdRow key={p.id} p={p} tipo="esgotado" />)}</tbody>
            </table>
          </div>
        </div>
      )}

      {baixos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="badge badge-baixo">Estoque baixo</span>
            <span className="text-sm text-ink-3">{baixos.length} produto(s) abaixo do mínimo</span>
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-warn-light/50 border-b border-paper-3">
                  {['Produto', 'Categoria', 'Quantidade', 'Preço venda', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-warn-dark uppercase tracking-wide font-medium first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{baixos.map(p => <ProdRow key={p.id} p={p} tipo="baixo" />)}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
