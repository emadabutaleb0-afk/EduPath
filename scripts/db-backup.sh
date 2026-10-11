#!/usr/bin/env bash
# =============================================================================
# EduPath PostgreSQL Automated Backup Script
# Creates a compressed timestamped SQL dump of the EduPath database
# =============================================================================

set -e

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/edupath_backup_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "📦 Starting EduPath database backup to ${BACKUP_FILE}..."

if [ -n "${DATABASE_URL}" ]; then
  pg_dump "${DATABASE_URL}" | gzip > "${BACKUP_FILE}"
elif [ -n "${CONTAINER_NAME:-edupath-postgres}" ]; then
  docker exec -t "${CONTAINER_NAME:-edupath-postgres}" pg_dump -U "${POSTGRES_USER:-edupath_admin}" "${POSTGRES_DB:-edupath}" | gzip > "${BACKUP_FILE}"
else
  echo "❌ Error: Neither DATABASE_URL nor running postgres container found."
  exit 1
fi

echo "✅ Backup completed successfully: ${BACKUP_FILE}"
