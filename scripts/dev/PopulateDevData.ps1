# Initialize database !
# FOR DEVELOPEMENT BUILDS ONLY!
$container= Read-Host -Prompt "Enter backend container name: "

function PopulateDevData() {
    ImportInitialData
}

function ImportInitialData() {
    docker exec `
        -it $container `
        python3.12 manage.py loaddata ./fixtures/InitialData.json
}

PopulateDevData
pause