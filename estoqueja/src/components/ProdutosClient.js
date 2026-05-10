'use client'
import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'

const CATEGORIAS = [
  'Grãos e cereais', 'Laticínios', 'Bebidas', 'Carnes', 'Hortifruti',
  'Higiene', 'Limpeza', 'Padaria', 'Frios', 'Outros',
]

const EMPTY = { nome: '', categoria: 'Outros', quantidade: 0, qtd_minima: 5, preco_custo: '', preco_venda: '', codigo_barras: '' }

function StatusBadge({ qty, min }) {
  if (qty === 0) return <span className="badge badge-out">Esgotado</span>
  if (qty <= min) return <span className="badge badge-baixo">Baixo</span>
  return <span className="badge badge-ok">Normal</span>
}

export default function ProdutosClient({ produtosIniciais, userId }) {
  const supabase = createClient()
  const [produtos, setProdutos] = useState(produtosIniciais)
  const [busca, setBusca] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [erro, setErro] = useState('')
  const [isPending, startTransition] = useTransition()

  const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const filtered = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.categoria.toLowerCase().includes(busca.toLowerCase())
  )

  function openAdd() {
    setEditando(null)
    setForm(EMPTY)
    setErro('')
    setModalOpen(true)
  }

  function openEdit(p) {
    setEditando(p.id)
    setForm({ nome: p.nome, categoria: p.categoria, quantidade: p.quantidade, qtd_minima: p.qtd_minima, preco_custo: p.preco_custo, preco_venda: p.preco_venda, codigo_barras: p.codigo_barras || '' })
    setErro('')
    setModalOpen(true)
  }

  function setF(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSalvar() {
    if (!form.nome.trim()) { setErro('Informe o nome do produto.'); return }
    setErro('')
    const payload = {
      ...form,
      quantidade: parseInt(form.quantidade) || 0,
      qtd_minima: parseInt(form.qtd_minima) || 0,
      preco_custo: parseFloat(form.preco_custo) || 0,
      preco_venda: parseFloat(form.preco_venda) || 0,
      user_id: userId,
    }
    startTransition(async () => {
      if (editando) {
        const { data, error } = await supabase.from('produtos').update(payload).eq('id', editando).select().single()
        if (error) { setErro(error.message); return }
        setProdutos(ps => ps.map(p => p.id === editando ? data : p))
      } else {
        const { data, error } = await supabase.from('produtos').insert(payload).select().single()
        if (error) { setErro(error.message); return }
        setProdutos(ps => [...ps, data].sort((a, b) => a.nome.localeCompare(b.nome)))
      }
      setModalOpen(false)
    })
  }

  async function handleDeletar(id) {
    if (!confirm('Remover este produto?')) return
    const { error } = await supabase.from('produtos').update({ ativo: false }).eq('id', id)
    if (!error) setProdutos(ps => ps.filter(p => p.id !== id))
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-ink">Produtos</h1>
          <p className="text-sm text-ink-3">{produtos.length} produto{produtos.length !== 1 ? 's' : ''} cadastrado{produtos.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary">+ Novo produto</button>
      </div>

      {/* Busca */}
      <input
        className="input mb-4 max-w-sm"
        placeholder="Buscar por nome ou categoria..."
        value={busca}
        onChange={e => setBusca(e.target.value)}
      />

      {/* Tabela */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-paper-2 border-b border-paper-3">
              {['Produto', 'Categoria', 'Qtd', 'Mín.', 'Custo', 'Venda', 'Status', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-ink-3 uppercase tracking-wide font-medium first:pl-5 last:pr-5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-ink-4 py-10 text-sm">Nenhum produto encontrado</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="border-b border-paper-3 last:border-0 hover:bg-paper transition-colors">
                <td className="px-4 py-3 pl-5 font-medium text-ink">{p.nome}</td>
                <td className="px-4 py-3 text-ink-3">{p.categoria}</td>
                <td className="px-4 py-3 font-medium">{p.quantidade}</td>
                <td className="px-4 py-3 text-ink-3">{p.qtd_minima}</td>
                <td className="px-4 py-3 text-ink-3">{fmt(p.preco_custo)}</td>
                <td className="px-4 py-3 text-ink-3">{fmt(p.preco_venda)}</td>
                <td className="px-4 py-3"><StatusBadge qty={p.quantidade} min={p.qtd_minima} /></td>
                <td className="px-4 py-3 pr-5">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => openEdit(p)} className="btn btn-sm">Editar</button>
                    <button onClick={() => handleDeletar(p.id)} className="btn btn-sm text-danger border-danger/20 hover:bg-danger-light">✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-base font-semibold text-ink mb-5">{editando ? 'Editar produto' : 'Novo produto'}</h2>

            <div className="space-y-4">
              <div>
                <label className="label">Nome do produto *</label>
                <input className="input" placeholder="Ex: Arroz 5kg Tio João" value={form.nome} onChange={e => setF('nome', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Categoria</label>
                  <select className="input" value={form.categoria} onChange={e => setF('categoria', e.target.value)}>
                    {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Código de barras</label>
                  <input className="input" placeholder="Opcional" value={form.codigo_barras} onChange={e => setF('codigo_barras', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Quantidade atual</label>
                  <input className="input" type="number" min="0" value={form.quantidade} onChange={e => setF('quantidade', e.target.value)} />
                </div>
                <div>
                  <label className="label">Qtd mínima (alerta)</label>
                  <input className="input" type="number" min="0" value={form.qtd_minima} onChange={e => setF('qtd_minima', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Preço de custo (R$)</label>
                  <input className="input" type="number" step="0.01" min="0" placeholder="0,00" value={form.preco_custo} onChange={e => setF('preco_custo', e.target.value)} />
                </div>
                <div>
                  <label className="label">Preço de venda (R$)</label>
                  <input className="input" type="number" step="0.01" min="0" placeholder="0,00" value={form.preco_venda} onChange={e => setF('preco_venda', e.target.value)} />
                </div>
              </div>

              {form.preco_custo > 0 && form.preco_venda > 0 && (
                <div className="bg-success-light rounded-lg px-3 py-2 text-xs text-success-dark">
                  Margem: {(((form.preco_venda - form.preco_custo) / form.preco_custo) * 100).toFixed(1)}%
                </div>
              )}

              {erro && <div className="bg-danger-light text-danger-dark text-sm px-3 py-2 rounded-lg">{erro}</div>}
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setModalOpen(false)} className="btn">Cancelar</button>
              <button onClick={handleSalvar} disabled={isPending} className="btn btn-primary">
                {isPending ? 'Salvando...' : 'Salvar produto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
