COMPOSE_ARGS=(--file docker-compose-prod.yml)
OAUTH_COMPOSE_FILE="${PORTAL_OAUTH_COMPOSE_FILE:-$HOME/.config/concept-portal/oauth/compose.oauth.yml}"
BACKUP_SCRIPT="./scripts/prod/CreateBackup.sh"

if [[ -f "${OAUTH_COMPOSE_FILE}" ]]; then
  COMPOSE_ARGS+=(--file "${OAUTH_COMPOSE_FILE}")
fi

git fetch --all
git reset --hard origin/main

/bin/bash "${BACKUP_SCRIPT}"

docker compose "${COMPOSE_ARGS[@]}" up --build --detach --force-recreate
docker compose "${COMPOSE_ARGS[@]}" restart nginx

# Use this to prune caches
# docker system prune -a -f

# Use this command to restart containers if something went wrong
# docker compose --file "docker-compose-prod.yml" restart

echo "Update finished at: $(date '+%Y-%m-%d %H:%M:%S %Z')"
