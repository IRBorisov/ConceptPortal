 # Run coverage analysis
Set-Location $PSScriptRoot\backend

$coverageExec = "$PSScriptRoot\backend\venv\Scripts\coverage.exe"
$djangoSrc = "$PSScriptRoot\backend\manage.py"
$exclude = '*/venv/*,*/tests/*,*/migrations/*,*__init__.py,manage.py,apps.py,urls.py,settings.py'

& $coverageExec run --omit=$exclude $djangoSrc test
& $coverageExec report
& $coverageExec html

Start-Process "file:///$PSScriptRoot\backend\htmlcov\index.html"