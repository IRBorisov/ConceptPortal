import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const frontendSrc = fileURLToPath(new URL('../frontend/src', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': frontendSrc
    }
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'examples/**/*.test.ts']
  }
});
