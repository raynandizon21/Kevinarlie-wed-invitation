// Only the RSVP API runs under pm2. The site and admin are static files in dist/, served by nginx
// (kevinandarlei.com, admin.kevinandarlei.com); `npm run build` updates them live, no restart.
module.exports = {
  apps: [
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
