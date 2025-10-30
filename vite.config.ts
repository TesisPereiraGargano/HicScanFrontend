import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    base: './',
    server: {
      proxy: {
        '/hicscan-api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8082',
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})