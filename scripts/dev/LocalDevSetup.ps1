# Create venv and install dependencies for each project independently

$backend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\backend"
$domain = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\domain"
$frontend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\frontend"
$rstool = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\rstool"
$rstoolMcp = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\rstool-mcp"
$envPath = "$backend\.venv"

function LocalDevelopmentSetup() {
    DomainSetup
    FrontendSetup
    RstoolSetup
    RstoolMcpSetup
    BackendSetup
}

function DomainSetup() {
    Set-Location $domain
    Write-Host "Installing domain dependencies`n" -ForegroundColor DarkGreen
    & npm install
}

function FrontendSetup() {
    Set-Location $frontend
    Write-Host "Installing frontend dependencies`n" -ForegroundColor DarkGreen
    & npm install
}

function RstoolSetup() {
    Set-Location $rstool
    Write-Host "Installing rstool dependencies`n" -ForegroundColor DarkGreen
    & npm install
}

function RstoolMcpSetup() {
    Set-Location $rstoolMcp
    Write-Host "Installing rstool-mcp dependencies`n" -ForegroundColor DarkGreen
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
