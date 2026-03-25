import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_API_BASE_URL || 'http://192.168.1.34:7144'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          ws: true,
          timeout: 120000,
          proxyTimeout: 120000,
        },
        '/uploads': { target, changeOrigin: true },
      },
    },
  }
})
