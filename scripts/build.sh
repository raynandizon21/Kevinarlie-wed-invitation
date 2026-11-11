#!/usr/bin/env bash
# npm run build — nginx serves dist/ directly, so the site is updated without downtime:
#   1. build into .dist-next/ (the live dist/ is untouched while Vite runs)
#   2. copy the new hashed assets in first, then the html/icons (rsync replaces each file atomically)
#   3. old assets stay 7 days so visitors with the previous page still load; then they're pruned
# No restart needed afterwards (only `pm2 restart KA-invitation-api` for src/server changes).
set -euo pipefail
cd "$(dirname "$0")/.."

npx vite build --outDir .dist-next --emptyOutDir
mkdir -p dist/assets
rsync -a .dist-next/assets/ dist/assets/
rsync -a --delete --exclude /assets/ .dist-next/ dist/

# Prune assets that are no longer part of the build and are over a week old
find dist/assets -type f -mtime +7 | while read -r f; do
  [ -e ".dist-next/assets/$(basename "$f")" ] || rm -f "$f"
done
rm -rf .dist-next
echo "dist/ updated (live)."
