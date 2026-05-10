'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [negocio, setNegocio] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [msg, setMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setMsg('')
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          emailRedirectTo: `${location.origin}/api/auth/callback`,
          data: { nome_negocio: negocio },
        },
      })
      if (error) setErro(error.message)
      else setMsg('Verifique seu e-mail para confirmar o cadastro.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (error) setErro('E-mail ou senha incorretos.')
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Painel esquerdo — decorativo */}
      <div className="hidden lg:flex w-1/2 bg-ink flex-col justify-between p-12">
        <div>
          <span className="text-paper text-xl font-semibold tracking-tight">
            estoque<span className="text-brand">já</span>
          </span>
        </div>
        <div>
          <blockquote className="text-paper-2 text-2xl font-light leading-relaxed mb-6">
            "Chega de caderno.<br />
            Controle seu estoque<br />
            pelo celular."
          </blockquote>
          <div className="flex gap-4">
            {['Alertas automáticos', 'Multi-usuário', 'Funciona offline'].map(f => (
              <span key={f} className="text-xs text-ink-3 border border-ink-2 rounded-full px-3 py-1">{f}</span>
            ))}
          </div>
        </div>
        <p className="text-ink-3 text-xs">© {new Date().getFullYear()} EstoqueJá</p>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 text-center">
            <span className="text-2xl font-semibold tracking-tight">
              estoque<span className="text-brand">já</span>
            </span>
          </div>

          <h1 className="text-2xl font-semibold text-ink mb-1">
            {mode === 'login' ? 'Bem-vindo de volta' : 'Criar conta grátis'}
          </h1>
          <p className="text-sm text-ink-3 mb-8">
            {mode === 'login'
              ? 'Entre na sua conta para continuar'
              : 'Configure seu mercado em 2 minutos'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="label">Nome do negócio</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Ex: Mercadinho do Zé"
                  value={negocio}
                  onChange={e => setNegocio(e.target.value)}
                  required
                />
              </div>
            )}
            <div>
              <label className="label">E-mail</label>
              <input
                className="input"
                type="email"
                placeholder="voce@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Senha</label>
              <input
                className="input"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {erro && (
              <div className="bg-danger-light text-danger-dark text-sm px-3 py-2 rounded-lg">
                {erro}
              </div>
            )}
            {msg && (
              <div className="bg-success-light text-success-dark text-sm px-3 py-2 rounded-lg">
                {msg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center py-2.5 text-sm"
            >
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <p className="text-sm text-center text-ink-3 mt-6">
            {mode === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErro(''); setMsg('') }}
              className="text-ink font-medium hover:underline"
            >
              {mode === 'login' ? 'Criar grátis' : 'Entrar'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
