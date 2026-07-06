# Backend load tests (k6). Requires a running docker stack and k6 on PATH.
#
# Prerequisites:
#   1. Start prod-like stack:  docker compose -f docker-compose-prod-local.yml up --build -d
#      Or dev stack:           docker compose -f docker-compose-dev.yml up --build -d
#   2. Load sample data (dev container name or prod-local backend):
#        docker exec -it local-portal-backend python3.12 manage.py loaddata ./fixtures/InitialData.json
#      Or create superuser admin/1234 if the DB is empty.
#   3. Install k6: https://k6.io/docs/get-started/installation/
#
# Usage:
#   .\scripts\dev\load-test\RunLoadTest.ps1
#   .\scripts\dev\load-test\RunLoadTest.ps1 -Scenario rsform-details
#   .\scripts\dev\load-test\RunLoadTest.ps1 -Stack dev -Scenario mixed-read
#   .\scripts\dev\load-test\RunLoadTest.ps1 -Vus 10 -Duration 1m -Scenario library-list

Param(
    [ValidateSet('library-list', 'rsform-details', 'mixed-read')]
    [string] $Scenario = 'library-list',

    [ValidateSet('prod-local', 'dev')]
    [string] $Stack = 'prod-local',

    [string] $Username = 'admin',
    [string] $Password = '1234',
    [int] $RsformId = 34,

    [int] $Vus = 0,
    [string] $Duration = '',
    [switch] $SkipProbe
)

$loadTestDir = $PSScriptRoot
$scenarioFile = Join-Path $loadTestDir "scenarios\$Scenario.js"
$script:TrustAllCertsPolicyAdded = $false

function Enable-LocalTlsBypass {
    if ($script:TrustAllCertsPolicyAdded) {
        return
    }
    add-type @"
using System.Net;
using System.Security.Cryptography.X509Certificates;
public class PortalLoadTestTrustAllCertsPolicy : ICertificatePolicy {
    public bool CheckValidationResult(
        ServicePoint srvPoint, X509Certificate certificate,
        WebRequest request, int certificateProblem) { return true; }
}
"@
    [System.Net.ServicePointManager]::CertificatePolicy = New-Object PortalLoadTestTrustAllCertsPolicy
    $script:TrustAllCertsPolicyAdded = $true
}

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

function Get-StackBaseUrl([string] $stackId) {
    switch ($stackId) {
        'dev' { return 'http://localhost:8002' }
        default { return 'https://localhost:8001' }
    }
}

function Test-BackendReachable([string] $baseUrl) {
    $probeUrl = "$baseUrl/users/api/auth"
    $skipCert = $baseUrl.StartsWith('https://')

    try {
        if ($skipCert) {
            Enable-LocalTlsBypass
        }

        $response = Invoke-WebRequest -Uri $probeUrl -Method Get -UseBasicParsing -TimeoutSec 10
        return $response.StatusCode
    } catch {
        if ($_.Exception.Response) {
            return [int]$_.Exception.Response.StatusCode
        }
        throw
    }
}

function Test-Login([string] $baseUrl, [string] $user, [string] $pass) {
    $loginUrl = "$baseUrl/users/api/login"
    $body = @{ username = $user; password = $pass } | ConvertTo-Json
    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

    if ($baseUrl.StartsWith('https://')) {
        Enable-LocalTlsBypass
    }

    $response = Invoke-WebRequest `
        -Uri $loginUrl `
        -Method Post `
        -Body $body `
        -ContentType 'application/json' `
        -WebSession $session `
        -UseBasicParsing `
        -TimeoutSec 15

    if ($response.StatusCode -ne 202) {
        throw "Login failed with status $($response.StatusCode)"
    }

    $libraryUrl = "$baseUrl/api/library"
    $library = Invoke-WebRequest `
        -Uri $libraryUrl `
        -Method Get `
        -WebSession $session `
        -UseBasicParsing `
        -TimeoutSec 15

    if ($library.StatusCode -ne 200) {
        throw "Authenticated library request failed with status $($library.StatusCode)"
    }
}

Assert-K6Installed

if (-not (Test-Path -Path $scenarioFile)) {
    Write-Error "Scenario not found: $scenarioFile"
    exit 1
}

$baseUrl = Get-StackBaseUrl $Stack
$insecureTls = if ($Stack -eq 'dev') { 'false' } else { 'true' }

if (-not $SkipProbe) {
    Write-Host "Probing $baseUrl ..." -ForegroundColor DarkGreen
    try {
        $status = Test-BackendReachable $baseUrl
        Write-Host "Backend reachable (GET /users/api/auth -> $status)" -ForegroundColor DarkGreen
    } catch {
        Write-Error @"
Cannot reach backend at $baseUrl.
Start the stack first, e.g.:
  docker compose -f docker-compose-prod-local.yml up --build -d
Original error: $($_.Exception.Message)
"@
        exit 1
    }

    Write-Host "Checking login as $Username ..." -ForegroundColor DarkGreen
    try {
        Test-Login $baseUrl $Username $Password
        Write-Host "Login and authenticated read OK" -ForegroundColor DarkGreen
    } catch {
        Write-Error @"
Login probe failed for $Username at $baseUrl.
Ensure the superuser exists (admin / 1234) or pass -Username / -Password.
Original error: $($_.Exception.Message)
"@
        exit 1
    }
}

$k6Args = @(
    'run',
    $scenarioFile,
    '-e', "PORTAL_LOAD_STACK=$Stack",
    '-e', "PORTAL_LOAD_BASE_URL=$baseUrl",
    '-e', "PORTAL_LOAD_INSECURE_TLS=$insecureTls",
    '-e', "PORTAL_LOAD_USERNAME=$Username",
    '-e', "PORTAL_LOAD_PASSWORD=$Password",
    '-e', "PORTAL_LOAD_RSFORM_ID=$RsformId"
)

if ($Vus -gt 0 -and $Duration) {
    $k6Args += @('--vus', "$Vus", '--duration', $Duration)
}

Write-Host "`nRunning k6 scenario '$Scenario' against $baseUrl`n" -ForegroundColor Cyan
$k6Exe = Get-K6Executable
& $k6Exe @k6Args
exit $LASTEXITCODE
