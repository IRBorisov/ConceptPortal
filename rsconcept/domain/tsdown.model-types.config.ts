import { defineConfig } from 'tsdown';

const dependencies = ['@lezer/common', '@lezer/lr'];

export default defineConfig({
  entry: ['scripts/model-types.ts'],
  format: ['esm'],
  dts: false,
  deps: { alwaysBundle: dependencies, onlyBundle: dependencies },
  outDir: '../backend/build/model-types',
  outExtensions: () => ({ js: '.mjs' })
});
