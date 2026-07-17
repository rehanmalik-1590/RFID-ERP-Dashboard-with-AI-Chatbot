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
    react(),
    tailwindcss()
  ],
  build: {
    outDir: 'docs',  // Changed from 'dist' to 'docs' for GitHub Pages
    sourcemap: false,
  }
});