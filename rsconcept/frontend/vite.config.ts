import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { dependencies } from './package.json'

const exclVendors = ['react', 'react-router-dom', 'react-dom']
function renderChunks(deps: Record<string, string>) {
  const chunks = {}
  Object.keys(deps).forEach((key) => {
    if (exclVendors.includes(key)) return
    chunks[key] = [key]
  })
  return chunks
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    chunkSizeWarningLimit: 4000, // KB
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          ...renderChunks(dependencies),
        },
      },
    },
  }
})
