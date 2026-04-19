import { defineConfig } from 'vitest/config'
import path from 'node:path'

const alias = { '@': path.resolve(__dirname, 'src') }

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: 'dom',
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts'],
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: [
            'src/lib/pdf.test.ts',
            'src/lib/firebase/**/*.test.ts',
            'src/services/**/*.test.ts',
            'src/app/api/**/*.test.ts',
          ],
        },
      },
      {
        resolve: {
          alias: {
            ...alias,
            // `server-only` throws at import time outside an RSC build; stub
            // it out in the node test project so pdf.ts / admin.ts are
            // importable from vitest.
            'server-only': path.resolve(__dirname, 'vitest.server-only-stub.ts'),
          },
        },
        test: {
          name: 'node',
          environment: 'node',
          include: [
            'src/lib/pdf.test.ts',
            'src/lib/firebase/**/*.test.ts',
            'src/services/**/*.test.ts',
            'src/app/api/**/*.test.ts',
          ],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/services/**', 'src/schemas/**'],
      thresholds: { lines: 80, functions: 80, branches: 75, statements: 80 },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
})
