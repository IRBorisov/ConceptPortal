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
    Start-Process "http://localhost:8000/"
    Start-Process "http://localhost:3000/"
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
    & npm install
    Invoke-Expression "cmd /c start powershell -Command { `$Host.UI.RawUI.WindowTitle = 'react'; & npm run dev }"
}

function FlushData {
    & $pyExec $djangoSrc flush --no-input\
    $dbPath = "$PSScriptRoot\backend\db.sqlite3"
    if (Test-Path -Path $dbPath -PathType Leaf) {
	    Remove-Item $dbPath
    }
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