# ====== Load database backup ==========
# WARNING! DO NOT RUN THIS FILE AUTOMATICALLY FROM REPOSITORY LOCATION!
# ========================================

# Input params
$dataDump = "D:\DEV\backup\portal\2023-09-01\2023-09-01-db.dump"
$target = "local-portal-db"
$pgUser = "portal-admin"
$pgDB = "portal-db"

function LoadPostgreBackup() {
  PostgreLoad
}

function PostgreLoad() {
  $local_dbDump = "/home/db-restore.dump"
  & docker cp ${dataDump} ${target}:$local_dbDump
  docker exec --interactive $target `
    pg_restore `
    --username=$pgUser `
    --dbname=$pgDB `
    --clean `
    $local_dbDump 
  & docker exec $target rm $local_dbDump
}

LoadPostgreBackup