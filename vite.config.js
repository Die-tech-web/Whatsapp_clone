import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    target: 'es2015',
    jsxFactory: 'createElement',
    jsxFragment: 'Fragment'
  },
  build: {
    target: 'es2015'
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2015'
    }
  }
})