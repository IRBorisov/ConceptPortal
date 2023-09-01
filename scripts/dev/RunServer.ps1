# Run local server
Param(
    [switch] $freshStart
)

$backend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\backend"
$frontend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\frontend"

$pyExec = "$backend\venv\Scripts\python.exe"
$djangoSrc = "$backend\manage.py"
$initialData = "fixtures/InitialData.json"

function RunServer() {
	BackendRun
	FrontendRun
    Start-Sleep -Seconds 1
    Start-Process "http://localhost:8000/"
    Start-Process "http://localhost:3000/"
}

function BackendRun() {
	Set-Location $backend
    if ($freshStart) {
        FlushData
        DoMigrations
        PrepareStatic -clearPrevious
        AddInitialData
        AddAdmin
    } else {
        DoMigrations
        PrepareStatic
    }
    Invoke-Expression "cmd /c start powershell -Command { `$Host.UI.RawUI.WindowTitle = 'django'; & $pyExec $djangoSrc runserver }"
}

function FrontendRun() {
	Set-Location $frontend
    & npm install
    Invoke-Expression "cmd /c start powershell -Command { `$Host.UI.RawUI.WindowTitle = 'react'; & npm run dev }"
}

function FlushData {
    & $pyExec $djangoSrc flush --noinput
    $dbPath = "$backend\db.sqlite3"
    if (Test-Path -Path $dbPath -PathType Leaf) {
	    Remove-Item $dbPath
    }
}

function AddInitialData {
    & $pyExec manage.py loaddata $initialData
}
function AddAdmin {
    $env:DJANGO_SUPERUSER_USERNAME = 'admin'
    $env:DJANGO_SUPERUSER_PASSWORD = '1234'
    $env:DJANGO_SUPERUSER_EMAIL = 'admin@admin.com'
    & $pyExec $djangoSrc createsuperuser --noinput
}

function DoMigrations {
    & $pyExec $djangoSrc makemigrations
    & $pyExec $djangoSrc migrate
}

function PrepareStatic([switch]$clearPrevious) {
    if ($clearPrevious) {
        & $pyExec $djangoSrc collectstatic --noinput --clear
    } else {
        & $pyExec $djangoSrc collectstatic --noinput
    }
}

RunServer