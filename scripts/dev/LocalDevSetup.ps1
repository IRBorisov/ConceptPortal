# Create venv and install dependencies + imports

$backend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\backend"
$frontend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\frontend"
$envPath = "$backend\.venv"

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
    SyncBackendDeps
}

function ClearPrevious() {
    if (Test-Path -Path $envPath) {
        Write-Host "Removing previous env: $envPath`n" -ForegroundColor DarkGreen
        Remove-Item $envPath -Recurse -Force
    }
}

function SyncBackendDeps() {
    Write-Host "Syncing backend env with uv lockfile`n" -ForegroundColor DarkGreen
    & uv sync --frozen
}

LocalDevelopmentSetup