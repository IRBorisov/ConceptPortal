# ====== Create database backup ==========
BACKUP_LOCATION="/home/prod/backup"
POSTGRE_USER="portal-admin"
POSTGRE_DB="portal-db"
CONTAINER_DB="portal-db"
CONTAINER_BACK="portal-backend"

# Folders for each month and weekday
DATE_FORMATTED=$(date '+%Y-%m-%d')
CURRENT_MONTH=$(date '+%Y-%m')
CURRENT_WEEKDAY=$(date '+%A')    # Monday, Tuesday, etc.

DESTINATION_MONTH="${BACKUP_LOCATION}/month/${CURRENT_MONTH}"
DESTINATION_WEEKDAY="${BACKUP_LOCATION}/weekday/${CURRENT_WEEKDAY}"

ensure_location() {
  # Always overwrite current month's backup and current day-of-week backup
  rm -rf "$DESTINATION_MONTH"
  mkdir -p "$DESTINATION_MONTH"
  rm -rf "$DESTINATION_WEEKDAY"
  mkdir -p "$DESTINATION_WEEKDAY"
}

dump_postgre() {
  DB_DUMP_FILE_MONTH="${DESTINATION_MONTH}/${CURRENT_MONTH}-db.dump"
  DB_DUMP_FILE_WEEKDAY="${DESTINATION_WEEKDAY}/${CURRENT_WEEKDAY}-db.dump"
  docker exec $CONTAINER_DB pg_dump \
    --username=$POSTGRE_USER \
    --exclude-table=django_migrations \
    --format=custom \
    --dbname=$POSTGRE_DB \
	> $DB_DUMP_FILE_MONTH

  # Copy also for weekday slot
  cp "$DB_DUMP_FILE_MONTH" "$DB_DUMP_FILE_WEEKDAY"
}

dump_django() {
  DATA_DUMP_FILE_MONTH="${DESTINATION_MONTH}/${CURRENT_MONTH}-data.json"
  DATA_DUMP_FILE_WEEKDAY="${DESTINATION_WEEKDAY}/${CURRENT_WEEKDAY}-data.json"
  docker exec $CONTAINER_BACK \
    python3.12 manage.py dumpdata \
      --indent=2 \
      --exclude=admin.LogEntry \
      --exclude=sessions \
      --exclude=contenttypes \
      --exclude=auth.permission \
      > $DATA_DUMP_FILE_MONTH
  gzip --force "$DATA_DUMP_FILE_MONTH"

  # Copy gzipped file also for weekday slot
  DATA_DUMP_FILE_MONTH_GZ="${DATA_DUMP_FILE_MONTH}.gz"
  cp "$DATA_DUMP_FILE_MONTH_GZ" "${DATA_DUMP_FILE_WEEKDAY}.gz"
}

create_backup() {
  ensure_location
  dump_postgre
  dump_django

  green="\033[0;32m"
  noColor='\033[0m'
  echo -e "${green}Monthly backup created at: ${DESTINATION_MONTH}${noColor}"
  echo -e "${green}Weekday backup created at: ${DESTINATION_WEEKDAY}${noColor}"
}

create_backup
