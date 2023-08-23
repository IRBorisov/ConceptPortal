git pull
docker compose -f "docker-compose-prod.yml" up --build --no-cache -d
docker image prune -f