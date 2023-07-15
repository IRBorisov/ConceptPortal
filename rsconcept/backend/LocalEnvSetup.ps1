# Script creates venv and installs dependencies + imports
Set-Location $PSScriptRoot

$envPath = "$PSScriptRoot\venv"
$python = "$envPath\Scripts\python.exe"

if (Test-Path -Path $envPath) {
    Write-Host "Removing previous env: $envPath`n" -ForegroundColor DarkGreen
    Remove-Item $envPath -Recurse -Force
}

Write-Host "Creating python env: $envPath`n" -ForegroundColor DarkGreen
& 'python' -m venv $envPath
& $python -m pip install --upgrade pip
& $python -m pip install -r requirements_dev.txt

$wheel = Get-Childitem -Path import\*win*.whl -Name
if (-not $wheel) {
    Write-Error 'Missing import wheel'
    Exit 1
}

Write-Host "Installing wheel: $wheel`n" -ForegroundColor DarkGreen
& $python -m pip install -I import\$wheel