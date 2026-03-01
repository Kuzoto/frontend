import type { Config } from 'tailwindcss'

// In Tailwind v4, colors are defined via @theme inline in index.css.
// This file is kept for any remaining v3-compat options still supported by the vite plugin.
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
}

export default config
