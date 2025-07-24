import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'copy-redirects',
      writeBundle() {
        try {
          copyFileSync(
            resolve(__dirname, 'public/_redirects'),
            resolve(__dirname, 'dist/_redirects')
          )
          console.log('_redirects file copied to dist folder')
        } catch (error) {
          console.log('Could not copy _redirects file:', error.message)
        }
      }
    }
  ],
  server: {
    host: '0.0.0.0', // Allow access from any IP
    port: 3000,
    strictPort: true,
    allowedHosts: [
      'myqrapp.loca.lt',
      '.loca.lt' // Allow any loca.lt subdomain
    ],
    // Removed HTTPS for now - using localtunnel for HTTPS
    // Handle SPA routing in development
    historyApiFallback: true
  },
  build: {
    // Ensure _redirects file is copied to dist folder
    rollupOptions: {
      input: {
        main: './index.html'
      }
    },
    // Generate additional files for SPA routing
    generateBundle(options, bundle) {
      // Create a copy of index.html as 404.html for SPA routing fallback
      if (bundle['index.html']) {
        this.emitFile({
          type: 'asset',
          fileName: '404.html',
          source: bundle['index.html'].source
        });
        console.log('Generated 404.html with production asset paths');
      }
    }
  }
})
