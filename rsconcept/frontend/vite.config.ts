import path from 'path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type PluginOption } from 'vite';

import { dependencies } from './package.json';

const reactCompilerConfig = {
  /* ... */
};

// Packages to include in main app bundle
const inlinePackages = [
  'react',
  'react-router',
  'react-dom',
  'react-icons',
  'react-hook-form',
  'react-tooltip',
  'react-toastify',

  'global',
  'react-scan',

  'axios',
  'zod',
  'zustand',
  '@tanstack/react-query',
  '@hookform/resolvers'
];

// Rollup warnings that should not be displayed
const warningsToIgnore = [
  ['SOURCEMAP_ERROR', "Can't resolve original location of error"],
  ['MODULE_LEVEL_DIRECTIVE', 'Module level directives cause errors when bundled']
];

// https://vitejs.dev/config/
export default ({ mode }: { mode: string }) => {
  process.env = {
    ...process.env,
    ...loadEnv(mode, process.cwd())
  };
  return defineConfig({
    appType: 'spa',

    plugins: [
      tailwindcss(),

      react({
        babel: {
          plugins: [['babel-plugin-react-compiler', reactCompilerConfig]]
        }
      }),
      ,
      muteWarningsPlugin(warningsToIgnore)
    ],
    server: {
      port: Number(process.env.VITE_PORTAL_FRONT_PORT)
    },
    publicDir: 'public',
    build: {
      chunkSizeWarningLimit: 4000, // KB
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: { ...renderChunks(dependencies) }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  });
};

// ======== Internals =======
function renderChunks(deps: Record<string, string>) {
  const chunks = {};
  Object.keys(deps).forEach(key => {
    if (inlinePackages.includes(key)) {
      return;
    }
    chunks[key] = [key];
  });
  return chunks;
}

function muteWarningsPlugin(warningsToIgnore: string[][]): PluginOption {
  const mutedMessages = new Set();
  return {
    name: 'mute-warnings',
    enforce: 'pre',
    config: userConfig => ({
      build: {
        rollupOptions: {
          onwarn(warning, defaultHandler) {
            if (warning.code) {
              const muted = warningsToIgnore.find(
                ([code, message]) => code == warning.code && warning.message.includes(message)
              );

              if (muted) {
                mutedMessages.add(muted.join());
                return;
              }
            }

            if (userConfig.build?.rollupOptions?.onwarn) {
              userConfig.build.rollupOptions.onwarn(warning, defaultHandler);
            } else {
              defaultHandler(warning);
            }
          }
        }
      }
    }),
    closeBundle() {
      const diff = warningsToIgnore.filter(x => !mutedMessages.has(x.join()));
      if (diff.length > 0) {
        this.warn('Some of your muted warnings never appeared during the build process:');
        diff.forEach(m => this.warn(`- ${m.join(': ')}`));
      }
    }
  };
}
