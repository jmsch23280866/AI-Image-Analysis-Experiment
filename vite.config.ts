import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: The 'base' must be set to './' or your repo name for GitHub Pages
  // to correctly load assets from a subdirectory.
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});