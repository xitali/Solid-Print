$ErrorActionPreference = 'Stop'
$TaskRoot = $PSScriptRoot
$TaskNode = Join-Path $TaskRoot 'node_modules\node\bin\node.exe'
if (-not (Test-Path -LiteralPath $TaskNode)) {
    Write-Host 'Najpierw zainstaluj zaleznosci poleceniem npm install w folderze projektu.'
    exit 1
}
$TaskLogs = Join-Path $TaskRoot '.data\logs'
New-Item -ItemType Directory -Path $TaskLogs -Force | Out-Null
function Start-SolidPrintProcess([string] $Name, [string[]] $TaskArguments) {
    $TaskProcess = Start-Process -FilePath $TaskNode -ArgumentList $TaskArguments -WorkingDirectory $TaskRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $TaskLogs "$Name.log") -RedirectStandardError (Join-Path $TaskLogs "$Name.error.log") -PassThru
    Set-Content -LiteralPath (Join-Path $TaskLogs "$Name.pid") -Value $TaskProcess.Id
}
if (-not (Get-NetTCPConnection -LocalPort 55432 -State Listen -ErrorAction SilentlyContinue)) {
    Start-SolidPrintProcess 'services' @('--import','tsx','scripts/local-services.ts')
}
$TaskReady = $false
for ($TaskAttempt = 0; $TaskAttempt -lt 60; $TaskAttempt++) {
    if (Get-NetTCPConnection -LocalPort 55432 -State Listen -ErrorAction SilentlyContinue) { $TaskReady = $true; break }
    Start-Sleep -Seconds 1
}
if (-not $TaskReady) { Write-Host 'Nie uruchomiono bazy. Sprawdz .data\logs\services.error.log.'; exit 1 }
if (-not (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue)) {
    if (-not (Test-Path -LiteralPath (Join-Path $TaskRoot '.next\BUILD_ID'))) { Write-Host 'Najpierw zbuduj strone poleceniem npm run build.'; exit 1 }
    Start-SolidPrintProcess 'website' @('node_modules/next/dist/bin/next','start','--hostname','127.0.0.1')
}
$TaskWorkerFile = Join-Path $TaskLogs 'worker.pid'
$TaskWorkerRunning = $false
if (Test-Path -LiteralPath $TaskWorkerFile) {
    $TaskWorkerId = Get-Content -LiteralPath $TaskWorkerFile
    $TaskWorkerProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $TaskWorkerId" -ErrorAction SilentlyContinue
    if ($TaskWorkerProcess -and $TaskWorkerProcess.CommandLine -like '*scripts/worker.ts*') { $TaskWorkerRunning = $true }
}
if (-not $TaskWorkerRunning) { Start-SolidPrintProcess 'worker' @('--import','tsx','scripts/worker.ts') }
Write-Host 'Strona: http://127.0.0.1:3000'
Write-Host 'Panel:  http://127.0.0.1:3000/admin'
Write-Host 'Logi lokalnych uslug: .data\logs'
