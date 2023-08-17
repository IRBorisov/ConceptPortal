 # Run coverage analysis
Set-Location $PSScriptRoot\backend

$pylint = "$PSScriptRoot\backend\venv\Scripts\pylint.exe"

& $pylint cctext project apps