import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Bundle analyzer - chỉ chạy khi mode là 'analyze'
    mode === 'analyze' && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),

  // Tối ưu build
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Tách vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            if (id.includes('axios')) {
              return 'vendor-axios';
            }
            return 'vendor-other';
          }
        },
      },
    },
    // Tăng chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },

  // Tối ưu dev server
  server: {
    port: 5173,
    host: true,
  },
}))
