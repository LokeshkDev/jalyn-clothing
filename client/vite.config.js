import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), splitVendorChunkPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    minify: 'esbuild',
    rollupOptions: {
    },
    chunkSizeWarningLimit: 800,
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
})
