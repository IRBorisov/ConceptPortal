# Run tests

$backend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\backend"
$frontend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\frontend"

function RunTests() {
  TestBackend
  TestFrontend
}

function TestBackend() {
  $djangoSrc = "$backend\manage.py"

  Set-Location $backend
  & uv run python $djangoSrc check
  & uv run python $djangoSrc test
}

function TestFrontend() {
  Set-Location $frontend
  & npm test
}

RunTests
