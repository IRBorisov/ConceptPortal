import { defineConfig, mergeConfig } from 'vitest/config';
import config from './vite.config';

export default mergeConfig(
  typeof config === 'function' ? config({ mode: process.env.NODE_ENV || 'test' }) : config,
  defineConfig({
    resolve: {
      // Redirect the browser font-path module to its Vitest variant, which resolves
      // bundled fonts from the filesystem instead of a server-relative `/fonts/...` URL.
      // Matching is on the import specifier, so use a regex that excludes the `.vitest` file itself.
      alias: [
        {
          find: /(^|\/)font-path$/,
          replacement: '$1font-path.vitest'
        }
      ]
    },
    test: {
      watch: false,
      exclude: ['tests/**', 'node_modules/**']
    }
  })
);
