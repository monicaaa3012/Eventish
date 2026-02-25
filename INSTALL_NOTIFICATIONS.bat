@echo off
echo ========================================
echo Installing Notification Dependencies
echo ========================================
echo.

cd backend
echo Installing expo-server-sdk...
call npm install expo-server-sdk
echo.

echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Restart your backend server
echo 2. Test on a physical device (not simulator)
echo 3. Check NOTIFICATION_SETUP.md for full guide
echo.
pause
