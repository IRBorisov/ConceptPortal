import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

import { dependencies } from './package.json';

const inlinePackages = ['react', 'react-router-dom', 'react-dom'];
function renderChunks(deps: Record<string, string>) {
  const chunks = {};
  Object.keys(deps).forEach((key) => {
    if (inlinePackages.includes(key)) {
      return;
    }
    chunks[key] = [key];
  })
  return chunks;
}

// https://vitejs.dev/config/
export default (({ mode }: { mode: string }) => {
  process.env = {
    ...process.env,
    ...loadEnv(mode, process.cwd())
  };
  const enableHttps = process.env.VITE_PORTAL_FRONT_HTTPS === 'true';
  return defineConfig({
    plugins: [react()],
    server: {
      port: Number(process.env.VITE_PORTAL_FRONT_PORT),

      // NOTE: https is not used for dev builds currently
      https: enableHttps,
    },
    build: {
      chunkSizeWarningLimit: 4000, // KB
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            // Load chunks for dependencies separately
            ...renderChunks(dependencies),
          },
        },
      },
    }
  });
});
