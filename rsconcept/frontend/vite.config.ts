import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'url';

import { sitemapPlugin } from './vite-plugin-sitemap.ts';

function getPackageVersion(): string {
  const packageJsonPath = fileURLToPath(new URL('./package.json', import.meta.url));
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as { version: string };
  return packageJson.version;
}

function watchDomainDist(): Plugin {
  const domainDist = fileURLToPath(new URL('../domain/dist', import.meta.url));
  return {
    name: 'watch-domain-dist',
    configureServer(server) {
      server.watcher.add(domainDist);
    }
  };
}

/**
 * Registers React inspection/profiling tools for agents using Chrome DevTools MCP (dev server only).
 * Injected as a separate module script ahead of `main.tsx`: it must install the DevTools hook before React loads.
 */
function reactDevtoolsMcp(enabled: boolean): Plugin {
  return {
    name: 'react-devtools-cdt-mcp',
    apply: 'serve',
    transformIndexHtml: {
      order: 'pre',
      handler: () =>
        enabled
          ? [
              {
                tag: 'script',
                attrs: { type: 'module' },
                children: "import 'react-devtools-cdt-mcp/register';",
                injectTo: 'head-prepend'
              }
            ]
          : []
    }
  };
}

export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const release = `frontend@${getPackageVersion()}`;
  return defineConfig({
    appType: 'spa',

    plugins: [
      watchDomainDist(),
      reactDevtoolsMcp(env.VITE_REACT_DEVTOOLS_MCP === 'true'),
      tailwindcss(),
      react(),
      babel({
        presets: [reactCompilerPreset()]
      }),

      mode === 'analyze' &&
        visualizer({
          filename: 'stats.html',
          template: 'treemap'
        }),

      sitemapPlugin()
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
    optimizeDeps: {
      exclude: ['@rsconcept/domain']
    },
    build: {
      chunkSizeWarningLimit: 2000, // KB
      target: 'es2022',
      sourcemap: false
    },
    define: {
      'import.meta.env.VITE_SENTRY_RELEASE': JSON.stringify(release)
    }
  });
};
