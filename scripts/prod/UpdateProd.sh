COMPOSE_FILE="docker-compose-prod.yml"
BACKUP_SCRIPT="./scripts/prod/CreateBackup.sh"

git fetch --all
git reset --hard origin/main

/bin/bash "${BACKUP_SCRIPT}"

docker compose --file "${COMPOSE_FILE}" up --build --detach
docker image prune --all --force

# Use this command to restart containers if something went wrong
# docker compose --file "docker-compose-prod.yml" restart