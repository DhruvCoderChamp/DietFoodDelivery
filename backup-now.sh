#!/bin/bash
# Manual Backup Script for MyMorning
# Usage: ./backup-now.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"

echo "=== Starting Manual Database Backup ==="
mkdir -p $BACKUP_DIR

# Check if the backup container is running
if docker ps | grep -q mm_db_backup; then
    echo "Using existing backup container..."
    docker exec mm_db_backup sh -c "pg_dump -U postgres postgres > /backups/manual_backup_$TIMESTAMP.sql"
else
    echo "Running standalone backup container..."
    docker run --rm \
      --network deliveryfooddelivery_backend-net \
      -v $(pwd)/backups:/backups \
      -e PGPASSWORD=root \
      postgres:15-alpine \
      pg_dump -h db -U postgres postgres > $BACKUP_DIR/manual_backup_$TIMESTAMP.sql
fi

if [ $? -eq 0 ]; then
    echo "SUCCESS: Backup saved to $BACKUP_DIR/manual_backup_$TIMESTAMP.sql"
else
    echo "ERROR: Backup failed! Check if database container is running."
    exit 1
fi
