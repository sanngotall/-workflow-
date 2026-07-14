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
    port: 3000,
    host: 'localhost',
    strictPort: false,
    // 开发环境代理：所有 /api 请求转发到后端 NestJS（避免 CORS）
    proxy: {
      '/api': {
        target: 'http://localhost:13000',
        changeOrigin: true,
      },
    },
  }
})
