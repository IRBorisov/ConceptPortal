# Run local server
Param(
    [switch] $freshStart
)

$backend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\backend"
$frontend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\frontend"

$djangoSrc = "$backend\manage.py"
$initialData = "fixtures/InitialData.json"

function RunServer() {
	BackendRun
	FrontendRun
    Start-Sleep -Seconds 1
    Start-Process "http://localhost:8000"
    Start-Process "http://localhost:3000"
}

function BackendRun() {
	Set-Location $backend
    if ($freshStart) {
        FlushData
        DoMigrations
        PrepareStatic -clearPrevious
        AddInitialData
    } else {
        DoMigrations
        PrepareStatic
    }
    Invoke-Expression "cmd /c start powershell -Command { `$Host.UI.RawUI.WindowTitle = 'django'; Set-Location '$backend'; uv run python manage.py runserver }"
}

function FrontendRun() {
	Set-Location $frontend
    & npm install
    Invoke-Expression "cmd /c start powershell -Command { `$Host.UI.RawUI.WindowTitle = 'react'; & npm run dev }"
}

function FlushData {
    & uv run python $djangoSrc flush --noinput
    $dbPath = "$backend\db.sqlite3"
    if (Test-Path -Path $dbPath -PathType Leaf) {
	    Remove-Item $dbPath
    }
}

function AddInitialData {
    if (Test-Path -Path $initialData -PathType Leaf) {
        & uv run python $djangoSrc flush --noinput
        & uv run python $djangoSrc loaddata $initialData
    } else {
        $env:DJANGO_SUPERUSER_USERNAME = 'admin'
        $env:DJANGO_SUPERUSER_PASSWORD = '1234'
        $env:DJANGO_SUPERUSER_EMAIL = 'admin@admin.com'
        & uv run python $djangoSrc createsuperuser --noinput
    }
}

function DoMigrations {
    & uv run python $djangoSrc makemigrations
    & uv run python $djangoSrc migrate
}

function PrepareStatic([switch]$clearPrevious) {
    if ($clearPrevious) {
        & uv run python $djangoSrc collectstatic --noinput --clear
    } else {
        & uv run python $djangoSrc collectstatic --noinput
    }
}

RunServer
