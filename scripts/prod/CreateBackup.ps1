# ====== Create database backup ==========
# WARNING! DO NOT RUN THIS FILE AUTOMATICALLY FROM REPOSITORY LOCATION!
# Create a copy in secure location @production host. Update backup scripts from repository manually
# ========================================

# Input params
$backupLocation = "D:\DEV\backup\portal"

$containerDB = "dev-portal-db"
$containerBackend = "dev-portal-backend"
$pgUser = "portal-admin"
$pgDB = "portal-db"

# Internal params
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
$_date = Get-Date
$_formatDate = $_date.ToString("yyyy-MM-dd")

$destination = "{0}\{1}" -f $backupLocation, $_formatDate

function CreateBackup() {
  EnsureLocationIsReady
  PostgreDump
  DjangoDump
  Write-Host "Backup saved to $destination" -ForegroundColor DarkGreen
}

function EnsureLocationIsReady() {
  if (Test-Path -Path $destination) {
    Write-Host "Removing previous unfinished backup: $destination`n" -ForegroundColor DarkRed
    Remove-Item $destination -Recurse -Force
  }
  New-Item -ItemType Directory -Path $destination | Out-Null
  if (Test-Path -Path $archive -PathType Leaf) {
    Write-Host "Removing previous backup: $archive`n" -ForegroundColor DarkRed
  }
}

function PostgreDump() {
  $host_dbDump = "$destination\$_formatDate-db.dump"
  $local_dbDump = "/home/$_formatDate-db.dump"
  & docker exec $containerDB `
    pg_dump `
    --username=$pgUser `
    --exclude-table=django_migrations `
    --format=custom `
    --dbname=$pgDB `
    --file=$local_dbDump 
  & docker cp ${containerDB}:${local_dbDump} $host_dbDump
  & docker exec $containerDB rm $local_dbDump
}

function DjangoDump() {
  $host_dataDump = "$destination\$_formatDate-data.json.gz"
  $local_dataDump = "/home/app/web/backup/$_formatDate-data.json"
  $local_archiveDump = "/home/app/web/backup/$_formatDate-data.json.gz"
  & docker exec $containerBackend `
    python manage.py dumpdata `
      --indent=2 `
      --exclude=admin.LogEntry `
      --exclude=sessions `
      --exclude=contenttypes `
      --exclude=auth.permission `
      --output=$local_dataDump
  & docker exec $containerBackend gzip --force $local_dataDump
  & docker cp ${containerBackend}:${local_archiveDump} $host_dataDump
  & docker exec $containerBackend rm $local_archiveDump
}

CreateBackup