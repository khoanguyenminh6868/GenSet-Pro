@echo off
rem Bat VNeGP Client Agent (neu chua chay) va tai cac file HSMT theo danh sach trong Downloads.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0GenBid-HSMT.ps1" %*
echo.
pause
