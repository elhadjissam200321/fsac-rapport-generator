import base44 from '@base44/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error',
  plugins: [
    base44({
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: true
    }),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['fsac-logo.jpg', 'watermark.png'],
      manifest: {
        name: 'Générateur Page de Garde FSAC',
        short_name: 'FSAC Rapport',
        description: 'Générateur de page de garde académique pour la FSAC',
        theme_color: '#1a3a6e',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'fsac-logo.jpg',
            sizes: '192x192 512x512',
            type: 'image/jpg'
          }
        ]
      }
    })
  ]
});