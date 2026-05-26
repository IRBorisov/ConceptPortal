import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const domainSrc = fileURLToPath(new URL('../domain/src', import.meta.url));
const rstoolSrc = fileURLToPath(new URL('../rstool/src', import.meta.url));
const rstoolIndex = fileURLToPath(new URL('../rstool/src/index.ts', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@rsconcept/domain': domainSrc,
      '@rsconcept/rstool': rstoolIndex,
      '@rsconcept/rstool/': `${rstoolSrc}/`
    }
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts']
  }
});
