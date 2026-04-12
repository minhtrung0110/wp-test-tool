import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        external: ['electron-store']
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    publicDir: resolve('assets'),
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer')
      }
    },
    plugins: [
      tailwindcss()
    ],
    build: {
      rollupOptions: {
        input: {
          index: resolve('src/renderer/index.html'),
          splash: resolve('src/renderer/splash.html')
        }
      }
    }
  }
})
