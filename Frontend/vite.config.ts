import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/auth': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/audit': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/upload-config': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        homepage: resolve(import.meta.dirname, 'homepage.html'),
        dashboard: resolve(import.meta.dirname, 'dashboard.html'),
        upload: resolve(import.meta.dirname, 'upload.html'),
        result: resolve(import.meta.dirname, 'result.html'),
        login: resolve(import.meta.dirname, 'login.html'),
        signup: resolve(import.meta.dirname, 'signup.html'),
      },
    },
  },
})

