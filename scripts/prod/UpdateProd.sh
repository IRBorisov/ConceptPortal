COMPOSE_FILE="docker-compose-prod.yml"
BACKUP_SCRIPT="./scripts/prod/CreateBackup.sh"

git reset --hard
git pull

/bin/bash "${BACKUP_SCRIPT}"

docker compose --file "${COMPOSE_FILE}" up --build --detach
docker image prune --all --force
sleep 5
docker compose --file "${COMPOSE_FILE}" restart