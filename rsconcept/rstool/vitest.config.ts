import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const domainSrc = fileURLToPath(new URL('../domain/src', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@rsconcept/domain': domainSrc
    }
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'examples/**/*.test.ts']
  }
});
