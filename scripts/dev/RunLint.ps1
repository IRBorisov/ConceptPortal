# Run linters

$backend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\backend"
$domain = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\domain"
$frontend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\frontend"

function RunLinters() {
  LintBackend
  LintDomain
  LintFrontend
}

function LintBackend() {
  Set-Location $backend
  $env:DJANGO_SETTINGS_MODULE = "project.settings"
  & uv run pylint project apps
  & uv run mypy project apps --show-traceback
}

function LintDomain() {
  Set-Location $domain
  & npm run lint
}

function LintFrontend() {
  Set-Location $frontend
  & npm run lint
}

RunLinters
