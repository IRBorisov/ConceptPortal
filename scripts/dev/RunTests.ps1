# Run tests

$backend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\backend"
$frontend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\frontend"
$rstool = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\rstool"

function RunTests() {
  TestBackend
  TestFrontend
  TestRstool
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

function TestRstool() {
  Set-Location $rstool
  & npm run typecheck
  & npm test
}

RunTests
