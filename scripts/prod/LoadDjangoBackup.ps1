# ====== Load database backup from Django dumpdata ==========
# WARNING! DO NOT RUN THIS FILE AUTOMATICALLY FROM REPOSITORY LOCATION!
# ========================================

# Input params
$dataArchive = "D:\DEV\backup\portal\2023-09-01\2023-09-01-data.json.gz"
$target = "local-portal-backend"

function LoadDjangoBackup() {
  $local_archiveDump = "/home/app/web/backup/db-restore.json.gz"
  $local_dataDump = "/home/app/web/backup/db-restore.json"
  & docker cp ${dataArchive} ${target}:$local_archiveDump
  & docker exec $target gzip --decompress --force $local_dataDump
  docker exec $target `
    python manage.py loaddata $local_dataDump
  & docker exec $target rm $local_dataDump
}

LoadDjangoBackup