import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      server: {
        host: true, // Allow external connections
        allowedHosts: [
          'localhost',
          '.loca.lt', // Allow all localtunnel subdomains
          '.ngrok.io', // Allow ngrok domains
          '.ngrok-free.app', // Allow new ngrok domains
          '.cloudflare.com', // Allow cloudflare tunnels
          '.trycloudflare.com', // Allow cloudflare quick tunnels
        ]
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
