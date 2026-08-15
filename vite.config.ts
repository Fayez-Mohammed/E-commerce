import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://bestwallshop.runasp.net',
        changeOrigin: true,
        secure: false,
      },
      '/hubs': {
        target: 'https://bestwallshop.runasp.net',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
      '/images': {
        target: 'https://bestwallshop.runasp.net',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
