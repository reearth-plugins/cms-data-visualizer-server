import path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['tests/setup.ts'],
    include: [
      'tests/**/*.test.ts',
      '**/?(*.)+(spec|test).ts'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.d.ts'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: 'coverage',
      include: [
        'src/**/*.ts',
        'api/**/*.ts'
      ],
      exclude: [
        'src/**/*.d.ts',
        'tests/**',
        '**/node_modules/**',
        'coverage/**'
      ]
    },
    testTimeout: 10000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});