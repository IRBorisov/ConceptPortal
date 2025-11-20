import { defineConfig, mergeConfig } from 'vitest/config';
import config from './vite.config';

export default mergeConfig(
  typeof config === 'function' ? config({ mode: process.env.NODE_ENV || 'test' }) : config,
  defineConfig({
    test: {
      watch: false,
      exclude: ['tests/**', 'node_modules/**']
    }
  })
);
