git pull
/bin/bash ./scripts/prod/CreateBackup.sh
docker compose -f "docker-compose-prod.yml" up --build -d
docker image prune -a -f