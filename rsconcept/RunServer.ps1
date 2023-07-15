 # Run local server
Param(
    [switch] $freshStart
)

$pyExec = "$PSScriptRoot\backend\venv\Scripts\python.exe"
$djangoSrc = "$PSScriptRoot\backend\manage.py"

function RunServer() {
	RunBackend
	RunFrontend
    Start-Sleep -Seconds 1
    Start-Process "http://127.0.0.1:8000/"
}

function RunBackend() {
	Set-Location $PSScriptRoot\backend
    if ($freshStart) {
        FlushData
        DoMigrations
        PrepareStatic -clearPrevious
        AddAdmin
    } else {
        DoMigrations
        PrepareStatic
    }
    Invoke-Expression "cmd /c start powershell -Command { `$Host.UI.RawUI.WindowTitle = 'django'; & $pyExec $djangoSrc runserver }"
}

function RunFrontend() {
	Set-Location $PSScriptRoot\frontend
    Invoke-Expression "cmd /c start powershell -Command { `$Host.UI.RawUI.WindowTitle = 'react'; & npm run start }"
}

function FlushData {
    & $pyExec $djangoSrc flush --no-input
	Remove-Item $PSScriptRoot\backend\db.sqlite3
}

function AddAdmin {
    $env:DJANGO_SUPERUSER_USERNAME = 'admin'
    $env:DJANGO_SUPERUSER_PASSWORD = '1234'
    $env:DJANGO_SUPERUSER_EMAIL = 'admin@admin.com'
    & $pyExec $djangoSrc  createsuperuser --noinput
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