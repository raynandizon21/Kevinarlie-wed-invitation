#!/usr/bin/env bash
# Restore the RSVP database from a backup made by db-backup.sh.
#   npm run db:restore                         (uses the newest backup)
#   npm run db:restore -- backups/rsvp-2026-11-11_0300.sql.gz
# Replaces the rsvps, admins and admin_sessions tables with the backup's copy.
# The current data is backed up first, so a wrong restore can be undone.
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a

FILE="${1:-$(ls -1t backups/rsvp-*.sql.gz 2>/dev/null | head -1)}"
[ -n "$FILE" ] && [ -f "$FILE" ] || { echo "No backup found (looked in backups/)." >&2; exit 1; }

echo "Restore $FILE into database '$DB_NAME'?"
echo "This replaces the current rsvps, admins and admin_sessions tables."
read -r -p "Type YES to continue: " ok
[ "$ok" = "YES" ] || { echo "Cancelled."; exit 1; }

CNF=$(mktemp); trap 'rm -f "$CNF"' EXIT; chmod 600 "$CNF"
printf '[client]\nhost=%s\nport=%s\nuser=%s\npassword="%s"\n' \
  "${DB_HOST:-localhost}" "${DB_PORT:-3306}" "$DB_USER" "$DB_PASSWORD" > "$CNF"

# The database itself may be gone
mysql --defaults-extra-file="$CNF" -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4"
# Keep a copy of what's there now (skipped if the tables are missing)
bash scripts/db-backup.sh >/dev/null 2>&1 && echo "Current data backed up first." || true

gunzip -c "$FILE" | mysql --defaults-extra-file="$CNF" "$DB_NAME"
echo "Restored. RSVPs now: $(mysql --defaults-extra-file="$CNF" -N "$DB_NAME" -e 'SELECT COUNT(*) FROM rsvps')"
echo "Restart the API so it reconnects: pm2 restart KA-invitation-api"
