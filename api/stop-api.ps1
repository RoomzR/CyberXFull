# Останавливает все запущенные экземпляры CyberX.WebApi
Get-Process -Name "CyberX.WebApi" -ErrorAction SilentlyContinue | Stop-Process -Force

Get-CimInstance Win32_Process -Filter "Name='dotnet.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -like '*CyberX.WebApi*' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

Start-Sleep -Seconds 1
$left = @(Get-Process -Name "CyberX.WebApi" -ErrorAction SilentlyContinue)
if ($left.Count -gt 0) {
  Write-Host "Не удалось остановить: $($left.Id -join ', ')" -ForegroundColor Red
  exit 1
}
Write-Host "API остановлен." -ForegroundColor Green
