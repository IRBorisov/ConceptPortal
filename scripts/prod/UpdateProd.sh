git reset --hard
git pull
/bin/bash ./scripts/prod/CreateBackup.sh
docker compose --file "docker-compose-prod.yml" up --build --detach
docker image prune --all --force