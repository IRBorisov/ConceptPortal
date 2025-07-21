COMPOSE_FILE="docker-compose-prod.yml"
BACKUP_SCRIPT="./scripts/prod/CreateBackup.sh"

git fetch --all
git reset --hard origin/main

/bin/bash "${BACKUP_SCRIPT}"

docker compose --file "${COMPOSE_FILE}" up --build --detach
docker compose --file "${COMPOSE_FILE}" restart
docker compose --file "${COMPOSE_FILE}" restart nginx

# Use this to prune caches
# docker system prune -a -f

# Use this command to restart containers if something went wrong
# docker compose --file "docker-compose-prod.yml" restart