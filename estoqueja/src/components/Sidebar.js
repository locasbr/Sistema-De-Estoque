'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard',          label: 'Dashboard',      icon: '▦' },
  { href: '/dashboard/produtos', label: 'Produtos',       icon: '⬡' },
  { href: '/dashboard/movimentacoes', label: 'Movimentações', icon: '⇅' },
  { href: '/dashboard/alertas',  label: 'Alertas',        icon: '◉' },
]

export default function Sidebar({ nomeNegocio }) {
  const path = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-56 flex-shrink-0 bg-ink flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-ink-2/40">
        <div className="text-paper font-semibold tracking-tight text-base">
          estoque<span className="text-brand">já</span>
        </div>
        <div className="text-ink-3 text-xs mt-0.5 truncate">{nomeNegocio}</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 px-3">
        <p className="text-ink-3 text-[10px] uppercase tracking-widest px-2 mb-2">Menu</p>
        {navItems.map(item => {
          const active = path === item.href ||
            (item.href !== '/dashboard' && path.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-100 ${
                active
                  ? 'bg-white/10 text-paper font-medium'
                  : 'text-ink-3 hover:bg-white/5 hover:text-paper-2'
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-ink-2/40">
        <button
          onClick={handleLogout}
          className="text-ink-3 text-xs hover:text-paper transition-colors w-full text-left"
        >
          Sair da conta →
        </button>
      </div>
    </aside>
  )
}
