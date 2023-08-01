 # Run tests
Set-Location $PSScriptRoot\backend

$pyExec = "$PSScriptRoot\backend\venv\Scripts\python.exe"
$djangoSrc = "$PSScriptRoot\backend\manage.py"

& $pyExec $djangoSrc check
& $pyExec $djangoSrc test

Set-Location $PSScriptRoot\frontend

& npm test