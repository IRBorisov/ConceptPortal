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

function UpdateDomain() {
  Set-Location $domain
  & npm update
}

function UpdateFrontend() {
  Set-Location $frontend
  & npm update
}

function UpdateRstool() {
  Set-Location $rstool
  & npm update
}

function UpdateRstoolMcp() {
  Set-Location $rstoolMcp
  & npm update
}

UpdateDependencies
