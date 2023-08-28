# Initialize database !
# FOR DEVELOPEMENT BUILDS ONLY!
$container= Read-Host -Prompt "Enter backend container name: "

docker exec -it $container python manage.py loaddata fixtures/InitialData.json

docker exec `
    -e DJANGO_SUPERUSER_USERNAME=admin `
    -e DJANGO_SUPERUSER_PASSWORD=1234 `
    -e DJANGO_SUPERUSER_EMAIL=admin@admin.com `
    -it $container python manage.py createsuperuser --noinput

pause