git pull
docker compose -f "docker-compose-prod.yml" up --build -d
docker system prune -a -f
