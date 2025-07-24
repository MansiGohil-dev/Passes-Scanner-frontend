import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    host: '0.0.0.0', // Allow access from any IP
    port: 3000,
    strictPort: true,
    allowedHosts: [
      'myqrapp.loca.lt',
      '.loca.lt' // Allow any loca.lt subdomain
    ]
    // Removed HTTPS for now - using localtunnel for HTTPS
  },
  build: {
    // Ensure _redirects file is copied to dist folder
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
})
