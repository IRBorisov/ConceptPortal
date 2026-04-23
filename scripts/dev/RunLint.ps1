# Run linters

$backend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\backend"
$frontend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\frontend"

function RunLinters() {
  LintBackend
  LintFrontend
}

function LintBackend() {
  Set-Location $backend
  $env:DJANGO_SETTINGS_MODULE = "project.settings"
  & uv run pylint project apps
  & uv run mypy project apps --show-traceback
}

function LintFrontend() {
  Set-Location $frontend
  & npm run lint
}

RunLinters
