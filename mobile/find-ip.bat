@echo off
echo ==========================================
echo Finding Your IP Address for Mobile App
echo ==========================================
echo.

echo Your IP addresses:
echo.
ipconfig | findstr /i "IPv4"

echo.
echo ==========================================
echo Instructions:
echo ==========================================
echo.
echo 1. Look for the IPv4 Address above (usually starts with 192.168.x.x)
echo 2. Copy that IP address
echo 3. Open: Eventish/mobile/config/api.ts
echo 4. Update this line:
echo    const SERVER_URL = 'http://YOUR_IP:5000';
echo.
echo Example:
echo    const SERVER_URL = 'http://192.168.1.100:5000';
echo.
echo 5. Save the file
echo 6. Restart your Expo development server
echo.
echo ==========================================
echo Testing Backend Connection:
echo ==========================================
echo.
echo Testing if backend is running on port 5000...
netstat -ano | findstr :5000

if %errorlevel% equ 0 (
    echo.
    echo Backend is running on port 5000!
) else (
    echo.
    echo WARNING: Backend is NOT running on port 5000!
    echo Please start the backend first:
    echo    cd Eventish/backend
    echo    npm start
)

echo.
pause
