#!/bin/bash
# Run this ONCE on the server to migrate existing postgres data to the host-bind path
# so old data is not lost when switching to the new docker-compose.yml

set -e

echo "=== MyMorning Data Migration ==="
echo "This moves existing postgres data to /var/lib/mymorning/pgdata"
echo ""

# Create the new directory
sudo mkdir -p /var/lib/mymorning/pgdata

# Check if old named volume exists and has data
if docker volume inspect mymorning_postgres_data_backup &>/dev/null 2>&1; then
  echo "Old volume found — skipping (already migrated)"
elif docker volume inspect deliveryfoodapp_postgres_data &>/dev/null 2>&1; then
  echo "Migrating data from named volume to host path..."
  # Stop containers first
  docker-compose down
  
  # Copy data from named volume to host path
  docker run --rm \
    -v deliveryfoodapp_postgres_data:/source:ro \
    -v /var/lib/mymorning/pgdata:/dest \
    alpine sh -c "cp -av /source/. /dest/"
    
  echo "Migration complete!"
else
  echo "No existing named volume found — fresh start, no migration needed"
fi

# Set correct ownership for postgres (uid 70 in alpine image)
sudo chown -R 999:999 /var/lib/mymorning/pgdata 2>/dev/null || true

echo ""
echo "=== Done! Now run: docker-compose up -d --build ==="
