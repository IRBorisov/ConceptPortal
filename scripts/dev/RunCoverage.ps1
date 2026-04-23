# Run coverage analysis

$backend = Resolve-Path -Path "$PSScriptRoot\..\..\rsconcept\backend"

function RunCoverage() {
  BackendCoverage
}

function BackendCoverage() {
  Set-Location $backend

  $djangoSrc = "$backend\manage.py"
  $exclude = '*/.venv/*,*/venv/*,*/tests/*,*/migrations/*,*__init__.py,shared/*,manage.py,apps.py,urls.py,settings.py,admin.py'

  & uv run coverage run --omit=$exclude $djangoSrc test
  & uv run coverage report
  & uv run coverage html

  Start-Process "$backend\htmlcov\index.html"
}

RunCoverage
