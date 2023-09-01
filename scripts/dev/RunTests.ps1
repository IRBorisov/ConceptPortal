# Run tests

$backend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\backend"
$frontend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\frontend"

function RunTests() {
  TestBackend
  TestFrontend
}

function TestBackend() {
  $pyExec = "$backend\venv\Scripts\python.exe"
  $djangoSrc = "$backend\manage.py"

  Set-Location $backend
  & $pyExec $djangoSrc check
  & $pyExec $djangoSrc test
}

function TestFrontend() {
  Set-Location $frontend
  & npm test
}

RunTests