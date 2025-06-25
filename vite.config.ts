import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // Performance optimizations
    hmr: {
      overlay: false, // Disable error overlay for faster reloads
    },
    // Optimize for faster development
    watch: {
      usePolling: false, // Use native file watching
      interval: 100, // Polling interval if needed
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Optimize build performance
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          ui: ['framer-motion', 'lucide-react'],
        },
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'framer-motion',
      'lucide-react',
      'react-hot-toast',
      'zustand',
      'date-fns',
    ],
  },
  // Improve development experience
  esbuild: {
    target: 'es2020',
  },
})

