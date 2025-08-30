import '../styles/globals.css'
import ThemeToggle from '../components/ThemeToggle'

export const metadata = {
  title: 'Service-Buddy - Your AI Government Services Navigator',
  description: 'From crisis to care — one AI agent that helps Australians navigate government services with clarity, empathy, and inclusion.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <ThemeToggle />
        {children}
      </body>
    </html>
  )
}
