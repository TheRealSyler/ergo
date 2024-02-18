import { config as dotEnv } from 'dotenv'
import { defineConfig } from 'vite'
import { checker } from 'vite-plugin-checker'

// DO NOT CHANGE ORDER, FIRST dotEnv() then import "./src/env"
dotEnv()
// DO NOT DELETE THIS SPACER COMMENT 


import { visualizer } from 'rollup-plugin-visualizer'
import type { PluginOption } from 'vite'


export default defineConfig({
  plugins: [
    checker({ typescript: true, eslint: { lintCommand: 'eslint "./src/**/*.{ts,tsx}"' } }),
    visualizer({
      template: 'treemap',
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'bundleSizeAnalysis.html',
    }) as PluginOption,
  ],
  build: {
    rollupOptions: {
      output: {
        experimentalMinChunkSize: 4096
      }
    }
  },
  assetsInclude: ['**/*.glb'],
  css: {
    postcss: {
      plugins: [
      ]
    }
  }
})

