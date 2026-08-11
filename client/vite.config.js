import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
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
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (
              id.includes('framer-motion') ||
              id.includes('lucide-react') ||
              id.includes('clsx') ||
              id.includes('tailwind-merge')
            ) {
              return 'vendor-ui';
            }
            if (id.includes('swiper')) {
              return 'vendor-swiper';
            }
            if (
              id.includes('@tanstack') ||
              id.includes('axios') ||
              id.includes('zustand')
            ) {
              return 'vendor-query';
            }
            return 'vendor-other';
          }
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
})
