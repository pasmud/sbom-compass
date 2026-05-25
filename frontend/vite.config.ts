import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 42002,
    proxy: {
      '/api': {
        target: 'http://localhost:42001',
        changeOrigin: true,
      },
    },
  },
});
