# Run coverage analysis

$backend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\backend"

function RunCoverage() {
  BackendCoverage
}

function BackendCoverage() {
  Set-Location $backend

  $coverageExec = "$backend\venv\Scripts\coverage.exe"
  $djangoSrc = "$backend\manage.py"
  $exclude = '*/venv/*,*/tests/*,*/migrations/*,*__init__.py,manage.py,apps.py,urls.py,settings.py'

  & $coverageExec run --omit=$exclude $djangoSrc test
  & $coverageExec report
  & $coverageExec html

  Start-Process "$backend\htmlcov\index.html"
}

RunCoverage