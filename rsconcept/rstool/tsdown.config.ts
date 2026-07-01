import { defineConfig } from 'tsdown';

const entryFiles = [
  'src/index.ts',
  'src/models/index.ts',
  'src/models/agent-workflow.ts',
  'src/models/tool-contract.ts',
  'src/models/rstool-agent.ts',
  'src/models/common.ts',
  'src/models/analysis.ts',
  'src/models/constituenta.ts',
  'src/models/diagnostic.ts',
  'src/models/evaluation.ts',
  'src/models/model-value.ts',
  'src/models/session.ts',
  'src/mappers/types.ts',
  'src/mappers/schema-adapter.ts',
  'src/mappers/model-adapter.ts',
  'src/session/session-store.ts',
  'src/wrapper/stdio-wrapper.ts',
  'src/wrapper/client.ts'
];

export default defineConfig({
  entry: entryFiles,
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: false,
  target: 'es2022',
  outDir: 'dist',
  deps: {
    neverBundle: ['@rsconcept/domain']
  },
  outExtensions: () => ({ js: '.js', dts: '.d.ts' })
});
