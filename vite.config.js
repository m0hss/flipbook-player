import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  assetsInclude: ['**/*.pdf'],
  server: {
    fs: {
      allow: ['..']
    }
  },
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  // Ensure worker files are served with correct MIME type
  define: {
    global: 'globalThis',
  }
})
