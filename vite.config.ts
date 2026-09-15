import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/codechef-proxy': {
        target: 'https://www.codechef.com',
        changeOrigin: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        rewrite: (path) => path.replace(/^\/api\/codechef-proxy/, '/users')
      }
    }
  },
  optimizeDeps: {
    include: ['@react-three/fiber', '@react-three/drei', 'three', 'gsap'],
  },
})
