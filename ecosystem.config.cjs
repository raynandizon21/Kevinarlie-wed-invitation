// Run `npm run build` before starting: KA-invitation-web serves the built dist/ via `vite preview`.
module.exports = {
  apps: [
    {
      name: 'KA-invitation-web',
      cwd: __dirname,
      script: 'node_modules/.bin/vite',
      args: 'preview --port 2213 --host 127.0.0.1 --strictPort',
      env: {
        NODE_ENV: 'production',
        RSVP_API_PORT: '3002',
      },
      autorestart: true,
      max_memory_restart: '300M',
    },
    {
      name: 'KA-invitation-admin',
      cwd: __dirname,
      script: 'node_modules/.bin/vite',
      args: 'preview --port 2214 --host 127.0.0.1 --strictPort',
      env: {
        NODE_ENV: 'production',
        RSVP_API_PORT: '3002',
        ADMIN_ONLY: 'true',
      },
      autorestart: true,
      max_memory_restart: '300M',
    },
    {
      name: 'KA-invitation-api',
      cwd: __dirname,
      script: 'node_modules/.bin/tsx',
      args: 'src/server/index.ts',
      env: {
        NODE_ENV: 'production',
        RSVP_API_PORT: '3002',
        RSVP_API_HOST: '127.0.0.1',
      },
      autorestart: true,
      max_memory_restart: '300M',
    },
  ],
};
