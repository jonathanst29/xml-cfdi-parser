import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/XML-CFDI-Parser/',
  plugins: [react()],
  resolve: {
    alias: {
      'opentype.js/dist/opentype.module.js': 'opentype.js/dist/opentype.mjs',
    },
  },
})
