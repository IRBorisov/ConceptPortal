# Create venv and install dependencies + imports

$backend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\backend"
$frontend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\frontend"
$rstool = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\rstool"
$envPath = "$backend\.venv"

function LocalDevelopmentSetup() {
    FrontendSetup
    RstoolSetup
    BackendSetup
}

function FrontendSetup() {
    Set-Location $frontend
    & npm install
}

function RstoolSetup() {
    Set-Location $rstool
    Write-Host "Installing rstool dependencies (requires frontend deps)`n" -ForegroundColor DarkGreen
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