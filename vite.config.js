import { defineConfig } from 'vite';
import { resolve } from 'path';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          rapier: ['@dimforge/rapier3d'],
          gsap: ['gsap'],
          howler: ['howler']
        }
      }
    },
    target: 'esnext',
    modulePreload: {
      polyfill: false
    }
  },
  server: {
    port: 3000,
    open: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  plugins: [
    wasm(),
    topLevelAwait()
  ],
  optimizeDeps: {
    include: ['three', 'gsap', 'howler'],
    exclude: ['@dimforge/rapier3d']
  },
  worker: {
    format: 'es'
  }
});