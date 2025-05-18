import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/language-chatbot/',  // Base path for GitHub Pages
  server: {
    port: 5173,
    hmr: false
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        proxyChecker: resolve(__dirname, 'proxy-checker.html')
      }
    }
  }
})
