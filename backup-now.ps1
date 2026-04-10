# Manual Backup Script for MyMorning (Windows PowerShell)
# Usage: .\backup-now.ps1

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupDir = ".\backups"

Write-Host "=== Starting Manual Database Backup ===" -ForegroundColor Cyan
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

# Check if the backup container is running
$Container = docker ps --filter "name=mm_db_backup" --format "{{.Names}}"
if ($Container) {
    Write-Host "Using existing backup container..."
    docker exec mm_db_backup sh -c "pg_dump -U postgres postgres > /backups/manual_backup_$Timestamp.sql"
} else {
    Write-Host "Running standalone backup container..."
    docker run --rm `
      --network deliveryfooddelivery_backend-net `
      -v "$(Get-Location):/host" `
      -e PGPASSWORD=root `
      postgres:15-alpine `
      pg_dump -h db -U postgres postgres | Out-File -FilePath "$BackupDir\manual_backup_$Timestamp.sql"
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Backup saved to $BackupDir\manual_backup_$Timestamp.sql" -ForegroundColor Green
} else {
    Write-Error "ERROR: Backup failed! Check if database container is running."
}
