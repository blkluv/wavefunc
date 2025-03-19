import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'
import dotenv from 'dotenv'

export default defineConfig(({ mode }) => {
    // Load environment variables from .env files
    const env =
        mode === 'production'
            ? dotenv.config({ path: './.env.production' }).parsed || {}
            : dotenv.config({ path: '../../.env' }).parsed || {}

    // Get all environment variables from the process
    const processEnv = process.env || {}

    // Combine environment variables, prioritizing process.env
    const combinedEnv = { ...env, ...processEnv }

    // Filter out PUBLIC_ variables
    const publicEnvVars = Object.fromEntries(Object.entries(combinedEnv).filter(([key]) => key.startsWith('PUBLIC_')))

    // Set defaults for important variables if they're missing
    const API_HOST = publicEnvVars.PUBLIC_HOST || 'localhost'
    const API_PORT = parseInt(publicEnvVars.PUBLIC_API_PORT || '3001')
    const WEB_PORT = parseInt(publicEnvVars.PUBLIC_WEB_PORT || '8080')

    console.log('Building with environment variables:', publicEnvVars)

    return {
        plugins: [TanStackRouterVite({ target: 'react', autoCodeSplitting: true }), react(), tailwindcss()],
        resolve: {
            alias: {
                '@': resolve(__dirname, './src'),
            },
        },
        define: {
            // Expose all PUBLIC_ variables to import.meta.env
            ...Object.fromEntries(
                Object.entries(publicEnvVars).map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)]),
            ),
        },
        server: {
            port: WEB_PORT,
            host: API_HOST,
            strictPort: true,
            hmr: {
                port: API_PORT,
                host: API_HOST,
            },
        },
        clearScreen: false,
        logLevel: 'info',
        build: {
            sourcemap: mode !== 'production',
            rollupOptions: {
                output: {
                    manualChunks: {
                        react: ['react', 'react-dom'],
                        tanstack: ['@tanstack/react-router', '@tanstack/react-query'],
                        nostr: ['@nostr-dev-kit/ndk', 'nostr-tools'],
                    },
                },
            },
        },
    }
})
