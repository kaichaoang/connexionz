#!/usr/bin/env bash
#
# Apply the SQL in db/schema/ and/or db/seed/ to a Postgres database.
#
# Usage:
#   SUPABASE_DB_URL="postgresql://..." bash db/apply.sh [all|schema|seed]
#
# Runs the same way locally and in CI (.github/workflows/deploy-db.yml). Files
# within a directory are applied in filename order (hence the 01_, 02_ prefixes
# in db/schema/). Every file runs in a single transaction with ON_ERROR_STOP, so
# a bad statement aborts that file cleanly instead of leaving it half-applied.

set -euo pipefail

TARGET="${1:-all}"
: "${SUPABASE_DB_URL:?SUPABASE_DB_URL is not set (the Postgres connection string)}"

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

apply_dir() {
  local sub="$1"
  shopt -s nullglob
  local files=("$DIR/$sub"/*.sql)
  if [ ${#files[@]} -eq 0 ]; then
    echo "· nothing to apply in db/$sub"
    return
  fi
  for f in "${files[@]}"; do
    echo "▶ applying db/$sub/$(basename "$f")"
    psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 --single-transaction -f "$f"
  done
}

case "$TARGET" in
  schema) apply_dir schema ;;
  seed)   apply_dir seed ;;
  all)    apply_dir schema; apply_dir seed ;;
  *)
    echo "Unknown target: '$TARGET' (expected: all | schema | seed)" >&2
    exit 1
    ;;
esac

echo "✅ database deploy complete ($TARGET)"
