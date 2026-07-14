import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 13001,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:13000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
