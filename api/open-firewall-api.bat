@echo off
echo Adding Windows Firewall rule for CyberX API port 5006 (inbound)...
net session >nul 2>&1
if errorlevel 1 (
  echo Run this file as Administrator ^(right-click - Run as administrator^)
  pause
  exit /b 1
)
netsh advfirewall firewall delete rule name="CyberX API 5006" >nul 2>&1
netsh advfirewall firewall add rule name="CyberX API 5006" dir=in action=allow protocol=TCP localport=5006
echo Done. Dedicated server can reach http://YOUR_PC_IP:5006
pause
