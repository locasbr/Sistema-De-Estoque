'use client'
import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'

function MovIcon({ tipo }) {
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
      tipo === 'entrada' ? 'bg-success-light text-success' : 'bg-danger-light text-danger'
    }`}>
      {tipo === 'entrada' ? '↓' : '↑'}
    </div>
  )
}

export default function MovimentacoesClient({ produtosIniciais, movsIniciais, userId }) {
  const supabase = createClient()
  const [produtos, setProdutos] = useState(produtosIniciais)
  const [movs, setMovs] = useState(movsIniciais)
  const [form, setForm] = useState({ produtoId: produtosIniciais[0]?.id || '', tipo: 'entrada', quantidade: 1, motivo: '' })
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [isPending, startTransition] = useTransition()

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const prodSelecionado = produtos.find(p => p.id === form.produtoId)
  const fmtDate = (d) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

  async function handleRegistrar() {
    setErro('')
    setSucesso('')
    const qty = parseInt(form.quantidade)
    if (!form.produtoId) { setErro('Selecione um produto.'); return }
    if (!qty || qty < 1) { setErro('Quantidade deve ser maior que zero.'); return }

    const prod = produtos.find(p => p.id === form.produtoId)
    if (form.tipo === 'saida' && prod.quantidade < qty) {
      setErro(`Estoque insuficiente. Disponível: ${prod.quantidade} unidade(s).`)
      return
    }

    startTransition(async () => {
      // Insere movimentação
      const { data: novaMov, error: movError } = await supabase
        .from('movimentacoes')
        .insert({ produto_id: form.produtoId, tipo: form.tipo, quantidade: qty, motivo: form.motivo, user_id: userId })
        .select('*, produtos(nome)')
        .single()

      if (movError) { setErro(movError.message); return }

      // Atualiza quantidade
      const novaQtd = form.tipo === 'entrada' ? prod.quantidade + qty : prod.quantidade - qty
      const { error: updateError } = await supabase
        .from('produtos')
        .update({ quantidade: novaQtd })
        .eq('id', form.produtoId)

      if (updateError) { setErro(updateError.message); return }

      setProdutos(ps => ps.map(p => p.id === form.produtoId ? { ...p, quantidade: novaQtd } : p))
      setMovs(ms => [novaMov, ...ms].slice(0, 50))
      setForm(f => ({ ...f, quantidade: 1, motivo: '' }))
      setSucesso(`${form.tipo === 'entrada' ? 'Entrada' : 'Saída'} registrada: ${qty}x ${prod.nome}`)
      setTimeout(() => setSucesso(''), 3000)
    })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink">Movimentações</h1>
        <p className="text-sm text-ink-3">Registre entradas e saídas de estoque</p>
      </div>

      {/* Formulário */}
      <div className="card p-5 mb-6">
        <h2 className="text-sm font-medium text-ink mb-4">Nova movimentação</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Produto</label>
            <select className="input" value={form.produtoId} onChange={e => setF('produtoId', e.target.value)}>
              {produtos.map(p => (
                <option key={p.id} value={p.id}>{p.nome} (estoque: {p.quantidade})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Tipo</label>
            <select className="input" value={form.tipo} onChange={e => setF('tipo', e.target.value)}>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </div>
          <div>
            <label className="label">Quantidade</label>
            <input className="input" type="number" min="1" value={form.quantidade} onChange={e => setF('quantidade', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Motivo (opcional)</label>
            <input className="input" placeholder="Ex: Compra fornecedor ABC" value={form.motivo} onChange={e => setF('motivo', e.target.value)} />
          </div>
          <div className="sm:col-span-2 flex items-end">
            <button onClick={handleRegistrar} disabled={isPending || !produtosIniciais.length} className="btn btn-primary w-full justify-center">
              {isPending ? 'Registrando...' : 'Registrar movimentação'}
            </button>
          </div>
        </div>

        {prodSelecionado && (
          <p className="text-xs text-ink-3 mt-3">
            Estoque atual de <strong>{prodSelecionado.nome}</strong>: {prodSelecionado.quantidade} unidade(s)
            {form.quantidade > 0 && (
              <> → após: <strong>{form.tipo === 'entrada' ? prodSelecionado.quantidade + parseInt(form.quantidade || 0) : prodSelecionado.quantidade - parseInt(form.quantidade || 0)}</strong></>
            )}
          </p>
        )}

        {erro && <div className="mt-3 bg-danger-light text-danger-dark text-sm px-3 py-2 rounded-lg">{erro}</div>}
        {sucesso && <div className="mt-3 bg-success-light text-success-dark text-sm px-3 py-2 rounded-lg">✓ {sucesso}</div>}
      </div>

      {/* Histórico */}
      <div className="card">
        <div className="px-5 py-3.5 border-b border-paper-3">
          <h2 className="text-sm font-medium text-ink">Histórico (últimas 50)</h2>
        </div>
        {movs.length === 0 ? (
          <p className="text-sm text-ink-4 text-center py-10">Nenhuma movimentação ainda</p>
        ) : (
          <ul className="divide-y divide-paper-3">
            {movs.map(m => (
              <li key={m.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-paper transition-colors">
                <MovIcon tipo={m.tipo} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{m.produtos?.nome}</p>
                  <p className="text-xs text-ink-4">{m.motivo || (m.tipo === 'entrada' ? 'Entrada de estoque' : 'Saída de estoque')}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-semibold ${m.tipo === 'entrada' ? 'text-success' : 'text-danger'}`}>
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
  )
}
