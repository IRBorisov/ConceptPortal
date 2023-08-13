import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    chunkSizeWarningLimit: 1024, // KB
    rollupOptions: {
      output: {
        manualChunks:
        (id) => {
          if (id.includes('@codemirror') || id.includes('@uiw') || id.includes('@lezer/lr')) return 'parsing';
          if (id.includes('reagraph') || id.includes('graphology')) return 'graph';
          if (id.includes('react-data-table-component')) return 'data-table';
          if (id.includes('@react-three')) return 'react-three';
          if (id.includes('three') || id.includes('camera')) return 'graphics';
          if (id.includes('node_modules')) return 'imports';
          return 'index';
        },
      },
    },
  }
})
