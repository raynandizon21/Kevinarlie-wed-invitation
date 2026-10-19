import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';

// Serve the RSVP admin panel at a clean /admin URL (the file itself is admin.html)
function adminCleanUrl(): Plugin {
  const rewrite = (req: { url?: string }, _res: unknown, next: () => void) => {
    if (req.url === '/admin' || req.url === '/admin/' || req.url?.startsWith('/admin?')) {
      req.url = req.url.replace(/^\/admin\/?/, '/admin.html');
    }
    next();
  };
  return {
    name: 'admin-clean-url',
    configureServer: (server) => void server.middlewares.use(rewrite),
    configurePreviewServer: (server) => void server.middlewares.use(rewrite),
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const apiPort = env.RSVP_API_PORT || '3002';

  return {
    plugins: [react(), tailwindcss(), adminCleanUrl()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // RSVP API (src/server/index.ts)
      proxy: {
        '/api': {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true,
        },
        // Socket.IO (realtime RSVP updates for the admin panel)
        '/socket.io': {
          target: `http://localhost:${apiPort}`,
          ws: true,
          changeOrigin: true,
        },
      },
    },
    build: {
      rollupOptions: {
        // Invitation + RSVP admin panel (/admin.html)
        input: {
          main: path.resolve(__dirname, 'index.html'),
          admin: path.resolve(__dirname, 'admin.html'),
        },
      },
    },
  };
});
