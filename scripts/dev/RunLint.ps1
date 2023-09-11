# Run coverage analysis
$backend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\backend"

function RunLinters() {
  BackendLint
}

function BackendLint() {
  $pylint = "$backend\venv\Scripts\pylint.exe"
  $mypy = "$backend\venv\Scripts\mypy.exe"

  Set-Location $backend
  $env:DJANGO_SETTINGS_MODULE = "project.settings"
  & $pylint cctext project apps
  & $mypy cctext project apps
}

RunLinters