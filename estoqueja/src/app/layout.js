import './globals.css'

export const metadata = {
  title: 'EstoqueJá',
  description: 'Controle de estoque para pequenos mercados',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
