import { fileURLToPath } from 'node:url';

const frontendModules = fileURLToPath(new URL('../../rsconcept/frontend/node_modules', import.meta.url));

export default {
  root: fileURLToPath(new URL('.', import.meta.url)),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('../../rsconcept/frontend/src', import.meta.url))
    },
    modules: [frontendModules, 'node_modules']
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    testTimeout: 20000,
    deps: {
      moduleDirectories: ['node_modules', frontendModules]
    }
  }
};
