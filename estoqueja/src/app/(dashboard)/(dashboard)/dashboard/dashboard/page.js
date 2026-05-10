import { createClient } from '@/lib/supabase/server'

function MetricCard({ label, value, sub, variant }) {
  const color = variant === 'danger' ? 'text-danger' : variant === 'warn' ? 'text-warn' : 'text-ink'
  return (
    <div className="card p-5">
      <p className="text-xs text-ink-3 uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-3xl font-semibold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-ink-4 mt-1">{sub}</p>}
    </div>
  )
}

function StatusBadge({ qty, min }) {
  if (qty === 0) return <span className="badge badge-out">Esgotado</span>
  if (qty <= min) return <span className="badge badge-baixo">Baixo</span>
  return <span className="badge badge-ok">Normal</span>
}

function MovIcon({ tipo }) {
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
      tipo === 'entrada' ? 'bg-success-light text-success' : 'bg-danger-light text-danger'
    }`}>
      {tipo === 'entrada' ? '↓' : '↑'}
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: produtos }, { data: movs }] = await Promise.all([
    supabase.from('produtos').select('*').eq('user_id', user.id).eq('ativo', true).order('nome'),
    supabase.from('movimentacoes')
      .select('*, produtos(nome)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const total     = produtos?.length ?? 0
  const esgotados = produtos?.filter(p => p.quantidade === 0).length ?? 0
  const baixos    = produtos?.filter(p => p.quantidade > 0 && p.quantidade <= p.qtd_minima).length ?? 0
  const valorTotal = produtos?.reduce((acc, p) => acc + p.quantidade * Number(p.preco_custo), 0) ?? 0
  const alertas   = produtos?.filter(p => p.quantidade <= p.qtd_minima) ?? []

  const fmt     = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const fmtDate = d => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink">Dashboard</h1>
        <p className="text-sm text-ink-3">Visão geral do seu estoque</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total de produtos" value={total} sub="cadastrados" />
        <MetricCard label="Esgotados" value={esgotados} sub="sem estoque" variant={esgotados > 0 ? 'danger' : undefined} />
        <MetricCard label="Estoque baixo" value={baixos} sub="abaixo do mínimo" variant={baixos > 0 ? 'warn' : undefined} />
        <MetricCard label="Valor em estoque" value={fmt(valorTotal)} sub="preço de custo" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-paper-3">
            <h2 className="text-sm font-medium text-ink">Produtos para repor</h2>
            <a href="/dashboard/alertas" className="text-xs text-ink-3 hover:text-ink">Ver todos →</a>
          </div>
          {alertas.length === 0 ? (
            <p className="text-sm text-ink-4 text-center py-8">Estoque em dia ✓</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {alertas.slice(0, 5).map(p => (
                  <tr key={p.id} className="border-b border-paper-3 last:border-0 hover:bg-paper">
                    <td className="px-5 py-3 font-medium text-ink truncate max-w-[140px]">{p.nome}</td>
                    <td className="px-3 py-3 text-ink-3 text-center">{p.quantidade}/{p.qtd_minima}</td>
                    <td className="px-5 py-3 text-right"><StatusBadge qty={p.quantidade} min={p.qtd_minima} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-paper-3">
            <h2 className="text-sm font-medium text-ink">Últimas movimentações</h2>
            <a href="/dashboard/movimentacoes" className="text-xs text-ink-3 hover:text-ink">Ver todas →</a>
          </div>
          {!movs?.length ? (
            <p className="text-sm text-ink-4 text-center py-8">Nenhuma movimentação ainda</p>
          ) : (
            <ul className="divide-y divide-paper-3">
              {movs.map(m => (
                <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                  <MovIcon tipo={m.tipo} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{m.produtos?.nome}</p>
                    <p className="text-xs text-ink-4">{m.motivo || m.tipo}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-medium ${m.tipo === 'entrada' ? 'text-success' : 'text-danger'}`}>
                      {m.tipo === 'entrada' ? '+' : '-'}{m.quantidade}
                    </p>
                    <p className="text-xs text-ink-4">{fmtDate(m.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
