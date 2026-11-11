#!/usr/bin/env bash
# Back up the RSVP database (rsvps, admins, admin_sessions) into backups/.
#   npm run db:backup          (also runs daily from cron)
# Each run writes:
#   backups/rsvp-YYYY-MM-DD_HHMM.sql.gz   full dump, used by db-restore.sh
#   backups/rsvp-YYYY-MM-DD_HHMM.csv      the RSVP list, readable in Excel / Google Sheets
# Backups older than KEEP_DAYS are removed.
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a

KEEP_DAYS="${KEEP_DAYS:-60}"
OUT=backups
mkdir -p "$OUT"; chmod 700 "$OUT"
STAMP=$(date +%F_%H%M)

# Credentials go through a private temp file, never the command line
CNF=$(mktemp); trap 'rm -f "$CNF"' EXIT; chmod 600 "$CNF"
printf '[client]\nhost=%s\nport=%s\nuser=%s\npassword="%s"\n' \
  "${DB_HOST:-localhost}" "${DB_PORT:-3306}" "$DB_USER" "$DB_PASSWORD" > "$CNF"

umask 077
mysqldump --defaults-extra-file="$CNF" --single-transaction --no-tablespaces \
  "$DB_NAME" rsvps admins admin_sessions | gzip > "$OUT/rsvp-$STAMP.sql.gz.tmp"
mv "$OUT/rsvp-$STAMP.sql.gz.tmp" "$OUT/rsvp-$STAMP.sql.gz"

mysql --defaults-extra-file="$CNF" -B "$DB_NAME" -e \
  "SELECT id, name, contact, isAttending AS attending, source, timestamp, IF(active=1,'active','archived') AS status
   FROM rsvps ORDER BY id" \
  | awk -F'\t' 'BEGIN{OFS=","} {for(i=1;i<=NF;i++){gsub(/"/,"\"\"",$i); if($i=="NULL")$i=""; $i="\"" $i "\""} print}' \
  > "$OUT/rsvp-$STAMP.csv"

find "$OUT" -name 'rsvp-*' -mtime +"$KEEP_DAYS" -delete
echo "Backup saved: $OUT/rsvp-$STAMP.sql.gz and .csv ($(($(wc -l < "$OUT/rsvp-$STAMP.csv") - 1)) RSVPs)"
