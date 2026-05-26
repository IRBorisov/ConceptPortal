# Run tests

$backend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\backend"
$domain = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\domain"
$frontend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\frontend"
$rstool = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\rstool"
$rstoolMcp = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\rstool-mcp"

function RunTests() {
  TestBackend
  TestDomain
  TestFrontend
  TestRstool
  TestRstoolMcp
}

function TestBackend() {
  $djangoSrc = "$backend\manage.py"

  Set-Location $backend
  & uv run python $djangoSrc check
  & uv run python $djangoSrc test
}

function TestDomain() {
  Set-Location $domain
  & npm run typecheck
  & npm test
}

function TestFrontend() {
  Set-Location $frontend
  & npm run typecheck
  & npm test
}

function TestRstool() {
  Set-Location $rstool
  & npm run typecheck
  & npm test
}

function TestRstoolMcp() {
  Set-Location $rstoolMcp
  & npm run typecheck
  & npm test
}

RunTests
