# Create venv and install dependencies + imports

$backend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\backend"
$frontend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\frontend"
$envPath = "$backend\venv"
$python = "$envPath\Scripts\python.exe"

function LocalDevelopmentSetup() {
    FrontendSetup
    BackendSetup
}

function FrontendSetup() {
    Set-Location $frontend
    & npm install
}

function BackendSetup() {
    Set-Location $backend

    ClearPrevious
    CreateEnv
    InstallPips
}

function ClearPrevious() {
    if (Test-Path -Path $envPath) {
        Write-Host "Removing previous env: $envPath`n" -ForegroundColor DarkGreen
        Remove-Item $envPath -Recurse -Force
    }
}

function CreateEnv() {
    Write-Host "Creating python env: $envPath`n" -ForegroundColor DarkGreen
    & 'python' -m venv $envPath
}

function InstallPips() {
    & $python -m pip install --upgrade pip
    & $python -m pip install -r requirements-dev.txt --no-warn-script-location
}

LocalDevelopmentSetup