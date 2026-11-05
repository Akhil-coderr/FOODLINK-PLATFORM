import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-hot-toast': path.resolve(__dirname, './src/utils/notification.jsx'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://foodlink-platform.onrender.com',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'https://foodlink-platform.onrender.com',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'https://foodlink-platform.onrender.com',
        ws: true,
      },
    },
  },
});
