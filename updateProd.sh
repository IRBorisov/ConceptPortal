git pull
docker compose -f "docker-compose-prod.yml" up --build -d
docker iamge prune -a -f
