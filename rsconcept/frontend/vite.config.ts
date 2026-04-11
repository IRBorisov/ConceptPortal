import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { fileURLToPath } from 'url';

export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return defineConfig({
    appType: 'spa',

    plugins: [
      tailwindcss(),
      react(),
      babel({
        presets: [reactCompilerPreset()]
      }),

      mode === 'analyze' &&
        visualizer({
          filename: 'stats.html',
          template: 'treemap'
        })
    ],
    server: {
      port: Number(env.VITE_PORTAL_FRONT_PORT),
      watch: {
        ignored: ['**/tests/**']
      }
    },
    publicDir: 'public',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    build: {
      chunkSizeWarningLimit: 2000, // KB
      target: 'es2022',
      sourcemap: false
    }
  });
};
