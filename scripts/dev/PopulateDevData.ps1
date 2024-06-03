# Initialize database !
# FOR DEVELOPEMENT BUILDS ONLY!
$container= Read-Host -Prompt "Enter backend container name: "

$backend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\backend"

function PopulateDevData() {
    ImportInitialData
    CreateAdmin
}

function ImportInitialData() {
    docker exec `
        -it $container `
        python3.12 manage.py loaddata $backend\fixtures\InitialData.json
}

function CreateAdmin() {
    docker exec `
        -e DJANGO_SUPERUSER_USERNAME=admin `
        -e DJANGO_SUPERUSER_PASSWORD=1234 `
        -e DJANGO_SUPERUSER_EMAIL=admin@admin.com `
        -it $container python3.12 manage.py createsuperuser --noinput
}

PopulateDevData
pause