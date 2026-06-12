# Update dependencies

$backend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\backend"
$domain = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\domain"
$frontend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\frontend"
$rstool = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\rstool"
$rstoolMcp = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\rstool-mcp"

function UpdateDependencies() {
  UpdateDomain
  UpdateRstool
  UpdateRstoolMcp
  UpdateBackend
  UpdateFrontend
}

function UpdateBackend() {
  Set-Location $backend
  & uv sync --upgrade
}

function UpdateNpmProject() {
  param([string]$Path)
  Set-Location $Path
  # --save: bump direct dependency versions in package.json within existing semver ranges
  & npm update --save
}

function UpdateDomain() {
  UpdateNpmProject $domain
}

function UpdateFrontend() {
  UpdateNpmProject $frontend
}

function UpdateRstool() {
  UpdateNpmProject $rstool
}

function UpdateRstoolMcp() {
  UpdateNpmProject $rstoolMcp
}

UpdateDependencies

Read-Host "Press Enter to close"
