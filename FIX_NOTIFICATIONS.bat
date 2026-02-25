@echo off
echo ========================================
echo Notification System Quick Fix
echo ========================================
echo.

echo Step 1: Installing dependencies...
cd backend
call npm install expo-server-sdk
echo.

echo Step 2: Testing notification system...
call node testNotificationSystem.js
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo IMPORTANT: Restart your backend server now!
echo.
echo 1. Stop current backend (Ctrl+C)
echo 2. Run: npm run dev
echo 3. Create a test booking
echo 4. Check backend console for logs
echo.
echo Expected logs:
echo   - Sending booking notification to vendor
echo   - Notification saved to database
echo   - Push notification sent successfully
echo.
pause
