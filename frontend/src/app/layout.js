// First, create a new Next.js project with the following command:
// npx create-next-app@latest sequence-app
// Choose the following options:
// √ Would you like to use TypeScript? ... No
// √ Would you like to use ESLint? ... Yes
// √ Would you like to use Tailwind CSS? ... Yes
// √ Would you like to use `src/` directory? ... Yes
// √ Would you like to use App Router? ... Yes
// √ Would you like to customize the default import alias? ... No

// src/app/layout.js
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Sequence App',
  description: 'CAD Build Sequence Creator',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

