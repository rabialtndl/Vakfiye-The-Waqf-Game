import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import paket from './package.json' with { type: 'json' }

// Gömülü paket: tek dosya (vakfiye-oyun.js), stiller içinde. Web (/tr/oyun) ve mobil uygulama (Oyun sekmesi) bunu yükler.
// npm run build:gomulu  →  dist-gomulu/vakfiye-oyun.js
export default defineConfig({
  plugins: [react()],
  publicDir: false,
  define: { 'process.env.NODE_ENV': '"production"', __SURUM__: JSON.stringify(paket.version) },
  build: {
    outDir: 'dist-gomulu',
    emptyOutDir: true,
    lib: { entry: 'src/gomulu.tsx', name: 'VakfiyeOyunPaketi', formats: ['iife'], fileName: () => 'vakfiye-oyun.js' },
    cssCodeSplit: false,
  },
})
