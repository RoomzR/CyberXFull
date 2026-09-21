@echo off
cd /d "%~dp0"
call "%~dp0stop-api.bat"
if errorlevel 1 exit /b 1
echo.
echo Building...
dotnet build src\CyberX.WebApi\CyberX.WebApi.csproj
if errorlevel 1 (
  echo BUILD FAILED.
  exit /b 1
)
echo.
echo Starting API on http://0.0.0.0:5006  (localhost + LAN, for dedicated server)
echo For club server cfg use your PC LAN IP, not localhost — see admin GSI cfg modal.
echo.
dotnet run --project src\CyberX.WebApi --no-build
