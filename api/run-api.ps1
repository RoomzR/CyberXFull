# Перезапуск API: сначала стоп, потом сборка и запуск
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

& "$PSScriptRoot\stop-api.ps1"
if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne $null) { exit 1 }

Write-Host "Сборка..." -ForegroundColor Cyan
dotnet build src/CyberX.WebApi/CyberX.WebApi.csproj
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Запуск http://localhost:5006 ..." -ForegroundColor Cyan
dotnet run --project src/CyberX.WebApi --no-build
