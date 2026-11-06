import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/bin/server.ts', 'src/bin/http-server.ts', 'src/bin/session-index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  target: 'es2022',
  outDir: 'dist',
  deps: {
    neverBundle: ['@modelcontextprotocol/sdk', '@rsconcept/rstool', '@rsconcept/domain']
  },
  outExtensions: () => ({ js: '.js', dts: '.d.ts' })
});
