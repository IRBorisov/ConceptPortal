# Update dependencies

$root = Resolve-Path -Path "$PSScriptRoot\..\.."
$backend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\backend"

function UpdateDependencies() {
  UpdateNode
  UpdateBackend
}

function UpdateBackend() {
  Set-Location $backend
  & uv sync --upgrade
}

function UpdateNode() {
  Set-Location $root
  & pnpm update -r
}

UpdateDependencies

Read-Host "Press Enter to close"
