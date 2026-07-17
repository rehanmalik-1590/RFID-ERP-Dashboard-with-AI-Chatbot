import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: './',
  server: {
    port: 2000,
    host: true
  },
plugins: [
  tailwindcss(),
  react()
],
  build: {
  outDir: 'docs',
  sourcemap: false,
  chunkSizeWarningLimit: 1000,
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom', '@mui/material', '@mui/icons-material'],
        recharts: ['recharts'],
        mui: ['@mui/x-data-grid', '@mui/x-date-pickers']
      }
    }
  }
}
});