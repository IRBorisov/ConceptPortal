 # Run coverage analysis
Set-Location $PSScriptRoot\backend

$pylint = "$PSScriptRoot\backend\venv\Scripts\pylint.exe"
$mypy = "$PSScriptRoot\backend\venv\Scripts\mypy.exe"

& $pylint cctext project apps
& $mypy cctext project apps