# ====== Create database backup ==========
# WARNING! DO NOT RUN THIS FILE AUTOMATICALLY FROM REPOSITORY LOCATION!
# Create a copy in secure location @production host. Update backup scripts from repository manually
# ========================================
BACKUP_LOCATION="/home/prod/backup"
POSTGRE_USER="portal-admin"
POSTGRE_DB="portal-db"
CONTAINER_DB="portal-db"
CONTAINER_BACK="portal-backend"

DATE_FORMATTED=$(date '+%Y-%m-%d')
DESTINATION="${BACKUP_LOCATION}/${DATE_FORMATTED}"

ensure_location() {
  rm -rf $DESTINATION
  mkdir -p $DESTINATION
}

dump_postgre() {
  DB_DUMP_FILE="${DESTINATION}/${DATE_FORMATTED}-db.dump"
  docker exec $CONTAINER_DB pg_dump \
    --username=$POSTGRE_USER \
    --exclude-table=django_migrations \
    --format=custom \
    --dbname=$POSTGRE_DB \
	> $DB_DUMP_FILE
}

dump_django() {
  DATA_DUMP_FILE="${DESTINATION}/${DATE_FORMATTED}-data.json"
  docker exec $CONTAINER_BACK \
    python3.12 manage.py dumpdata \
      --indent=2 \
      --exclude=admin.LogEntry \
      --exclude=sessions \
      --exclude=contenttypes \
      --exclude=auth.permission \
      > $DATA_DUMP_FILE
  gzip --force $DATA_DUMP_FILE
}

create_backup() {
  ensure_location
  dump_postgre
  dump_django

  green="\033[0;32m"
  noColor='\033[0m'
  echo -e "${green}Backup created at: ${DESTINATION}${noColor}"
}

create_backup
