# Production backend load test (k6). Anonymous reads only — no login.
#
# Scenarios:
#   library-random            — random GET /api/library/{id} + /api/library/active each iteration
#   library-details-bombard   — GET /api/library/active once, then hammer /api/rsforms/{id}/details
#   auth-bombard              — hammer GET /users/api/auth (~130 B, no setup)
#
# Prerequisites:
#   Install k6: https://k6.io/docs/get-started/installation/
#
# Usage:
#   .\scripts\dev\load-test\RunProdLoadTest.ps1
#   .\scripts\dev\load-test\RunProdLoadTest.ps1 -Scenario library-details-bombard
#   .\scripts\dev\load-test\RunProdLoadTest.ps1 -Scenario auth-bombard -Vus 80 -Duration 2m
#   .\scripts\dev\load-test\RunProdLoadTest.ps1 -SchemaIdMin 1 -SchemaIdMax 400 -SkipProbe

Param(
    [ValidateSet('library-random', 'library-details-bombard', 'library-metadata-bombard', 'auth-bombard')]
    [string] $Scenario = 'library-random',

    [string] $BaseUrl = 'https://api.portal.acconcept.ru',

    [int] $SchemaIdMin = 1,
    [int] $SchemaIdMax = 800,

    [int] $Vus = 0,
    [string] $Duration = '',
    [switch] $SkipProbe
)

$loadTestDir = $PSScriptRoot
$scenarioFile = Join-Path $loadTestDir "scenarios\$Scenario.js"

function Get-K6Executable {
    $cmd = Get-Command k6 -ErrorAction SilentlyContinue
    if ($cmd) {
        return $cmd.Source
    }

    $candidates = @(
        "$env:ProgramFiles\k6\k6.exe",
        "${env:ProgramFiles(x86)}\k6\k6.exe",
        "$env:ProgramFiles\GrafanaLabs\k6\k6.exe",
        "$env:LOCALAPPDATA\Microsoft\WinGet\Links\k6.exe",
        'C:\ProgramData\chocolatey\bin\k6.exe'
    )

    foreach ($path in $candidates) {
        if ($path -and (Test-Path -Path $path)) {
            return $path
        }
    }

    return $null
}

function Assert-K6Installed {
    if (-not (Get-K6Executable)) {
        Write-Error @"
k6 is not on PATH. Install it first:
  winget install k6 --source winget
  choco install k6
  https://k6.io/docs/get-started/installation/
"@
        exit 1
    }
}

function Test-ProductionReachable([string] $baseUrl, [string] $probePath) {
    $probeUrl = "$baseUrl$probePath"
    $response = Invoke-WebRequest -Uri $probeUrl -Method Get -UseBasicParsing -TimeoutSec 15
    return $response.StatusCode
}

if ($Scenario -eq 'library-random' -and $SchemaIdMin -gt $SchemaIdMax) {
    Write-Error "SchemaIdMin ($SchemaIdMin) must be <= SchemaIdMax ($SchemaIdMax)"
    exit 1
}

Assert-K6Installed

if (-not (Test-Path -Path $scenarioFile)) {
    Write-Error "Scenario not found: $scenarioFile"
    exit 1
}

$probePath = if ($Scenario -eq 'auth-bombard') { '/users/api/auth' } else { '/api/library/active' }
$probeLabel = if ($Scenario -eq 'auth-bombard') { 'GET /users/api/auth' } else { 'GET /api/library/active' }

if (-not $SkipProbe) {
    Write-Host "Probing $BaseUrl (anonymous $probeLabel) ..." -ForegroundColor DarkGreen
    try {
        $status = Test-ProductionReachable $BaseUrl $probePath
        Write-Host "Production API reachable (status $status)" -ForegroundColor DarkGreen
    } catch {
        Write-Error @"
Cannot reach production API at $BaseUrl.
Original error: $($_.Exception.Message)
"@
        exit 1
    }
}

$k6Args = @(
    'run',
    $scenarioFile,
    '-e', 'PORTAL_LOAD_STACK=production',
    '-e', "PORTAL_LOAD_BASE_URL=$BaseUrl",
    '-e', 'PORTAL_LOAD_INSECURE_TLS=false'
)

if ($Scenario -eq 'library-random') {
    $k6Args += @(
        '-e', "PORTAL_LOAD_SCHEMA_ID_MIN=$SchemaIdMin",
        '-e', "PORTAL_LOAD_SCHEMA_ID_MAX=$SchemaIdMax"
    )
}

if ($Vus -gt 0 -and $Duration) {
    $k6Args += @('--vus', "$Vus", '--duration', $Duration)
}

$scenarioDesc = switch ($Scenario) {
    'library-details-bombard' {
        'GET /api/library/active once, then /api/rsforms/{id}/details from that list'
    }
    'library-metadata-bombard' {
        'GET /api/library/active once, then GET /api/library/{id} metadata from that list (~500 B)'
    }
    'auth-bombard' {
        'GET /users/api/auth only (~130 B, returns anonymous csrfToken)'
    }
    default {
        "random schema ids: $SchemaIdMin..$SchemaIdMax + /api/library/active each iteration"
    }
}

Write-Host @"

Running k6 scenario '$Scenario' against $BaseUrl
  $scenarioDesc
  auth: none (anonymous)

"@ -ForegroundColor Cyan

$k6Exe = Get-K6Executable
& $k6Exe @k6Args
exit $LASTEXITCODE
