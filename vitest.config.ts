import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'dom',
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts'],
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: [
            'src/lib/pdf.test.ts',
            'src/lib/firebase/**/*.test.ts',
            'src/services/**/*.test.ts',
          ],
        },
      },
      {
        test: {
          name: 'node',
          environment: 'node',
          include: [
            'src/lib/pdf.test.ts',
            'src/lib/firebase/**/*.test.ts',
            'src/services/**/*.test.ts',
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
