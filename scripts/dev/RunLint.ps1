# Run coverage analysis
$backend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\backend"

function RunLinters() {
  BackendLint
}

function BackendLint() {
  $pylint = "$backend\venv\Scripts\pylint.exe"
  $mypy = "$backend\venv\Scripts\mypy.exe"

  Set-Location $backend
  & $pylint cctext project apps
  & $mypy cctext project apps
}

RunLinters