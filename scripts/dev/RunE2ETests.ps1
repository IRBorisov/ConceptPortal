# Run tests

$frontend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\frontend"

function RunTests() {
  TestFrontend
}

function TestFrontend() {
  Set-Location $frontend
  & npm run test:e2e
}

RunTests