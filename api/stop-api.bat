@echo off
cd /d "%~dp0"
echo Stopping CyberX.WebApi...
taskkill /IM CyberX.WebApi.exe /F >nul 2>&1
for /f "tokens=2" %%p in ('tasklist /FI "IMAGENAME eq dotnet.exe" /FO LIST ^| findstr /I "PID:"') do (
  wmic process where "ProcessId=%%p" get CommandLine 2>nul | findstr /I "CyberX.WebApi" >nul && taskkill /PID %%p /F >nul 2>&1
)
timeout /t 2 /nobreak >nul
tasklist /FI "IMAGENAME eq CyberX.WebApi.exe" 2>nul | find /I "CyberX.WebApi.exe" >nul
if not errorlevel 1 (
  echo ERROR: CyberX.WebApi is still running.
  exit /b 1
)
echo OK: API stopped.
