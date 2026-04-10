#!/bin/bash
# Script to help find where the 17 items are stored
echo "=== Searching for Postgres Data ==="

echo "1. Checking host-bind path /var/lib/mymorning/pgdata..."
if [ -d "/var/lib/mymorning/pgdata/base" ]; then
    echo "Found data in /var/lib/mymorning/pgdata (Size: $(du -sh /var/lib/mymorning/pgdata | cut -f1))"
else
    echo "Path /var/lib/mymorning/pgdata is EMPTY or missing."
fi

echo ""
echo "2. Checking relative path ./pgdata_v2..."
if [ -d "./pgdata_v2/base" ]; then
    echo "Found data in ./pgdata_v2 (Size: $(du -sh ./pgdata_v2 | cut -f1))"
else
    echo "Path ./pgdata_v2 is EMPTY or missing."
fi

echo ""
echo "3. Checking Docker Named Volumes..."
docker volume ls | grep postgres

echo ""
echo "=== Recommendation ==="
echo "If your data is in ./pgdata_v2, you should update docker-compose.yml to use it."
echo "If your data is in a named volume, you should use that volume name."
