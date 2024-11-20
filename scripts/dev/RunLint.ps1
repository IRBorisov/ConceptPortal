# Run linters

$backend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\backend"
$frontend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\frontend"

function RunLinters() {
  LintBackend
  LintFrontend
}

function LintBackend() {
  $pylint = "$backend\venv\Scripts\pylint.exe"
  $mypy = "$backend\venv\Scripts\mypy.exe"

  Set-Location $backend
  $env:DJANGO_SETTINGS_MODULE = "project.settings"
  & $pylint project apps
  & $mypy project apps
}

function LintFrontend() {
  Set-Location $frontend
  & npm run lint
}

RunLinters