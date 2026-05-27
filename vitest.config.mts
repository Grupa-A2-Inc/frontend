import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    include: ['__tests__/**/*.{test,spec}.{ts,tsx}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts', 'components/**/*.tsx', 'hooks/**/*.ts'],
      exclude: [
        '**/*.d.ts',
        '**/types.ts',
        'lib/auth/dashboardAccess.ts',
      ],
      thresholds: { statements: 84, branches: 84, functions: 84, lines: 84 },
      reporter: ['text', 'lcov', 'html'],
    },
  },
})
