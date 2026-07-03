# Create venv and install dependencies for each project independently

$root = Resolve-Path -Path "$PSScriptRoot\..\.."
$backend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\backend"
$envPath = "$backend\.venv"

function LocalDevelopmentSetup() {
    NodeSetup
    BackendSetup
}

function NodeSetup() {
    Set-Location $root
    Write-Host "Installing workspace dependencies`n" -ForegroundColor DarkGreen
    & pnpm install
    Write-Host "Building @rsconcept/domain`n" -ForegroundColor DarkGreen
    & pnpm --filter @rsconcept/domain run build
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
