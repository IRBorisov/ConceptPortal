# ====== Create database backup ==========
# WARNING! DO NOT RUN THIS FILE AUTOMATICALLY FROM REPOSITORY LOCATION!
# Create a copy in secure location @production host. Update backup scripts from repository manually
# ========================================

backupLocation="/home/prod/backup"
pgUser="portal-admin"
pgDB="portal-db"
containerDB="portal-db"
containerBackend="portal-backend"

dateFmt=$(date '+%Y-%m-%d')
destination="$backupLocation/$dateFmt"

EnsureLocation()
{
  rm -rf $destination
  mkdir $destination
}

PostgreDump()
{
  dbDump="$destination/$dateFmt-db.dump"
  docker exec $containerDB pg_dump \
    --username=$pgUser \
    --exclude-table=django_migrations \
    --format=custom \
    --dbname=$pgDB \
	> $dbDump
}

DjangoDump()
{
  dataDump="$destination/$dateFmt-data.json"
  docker exec $containerBackend \
    python manage.py dumpdata \
      --indent=2 \
      --exclude=admin.LogEntry \
      --exclude=sessions \
      --exclude=contenttypes \
      --exclude=auth.permission \
      > $dataDump
  gzip --force $dataDump
}

EnsureLocation
PostgreDump
DjangoDump

green="\033[0;32m"
noColor='\033[0m'
echo -e "${green}Backup created at: ${destination}${noColor}"