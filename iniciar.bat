@echo off
REM ===============================================================
REM  Hallado - Arranque diario para Expo Go
REM  Abre dos ventanas: el backend (Spring Boot, puerto 8081) y
REM  Metro (Expo Go, puerto 8082) con código QR compatible.
REM ===============================================================

setlocal
cd /d "%~dp0"

if not exist "node_modules" (
    echo [ERROR] Falta instalar el proyecto. Corre primero instalar.bat.
    pause
    exit /b 1
)

echo Abriendo el backend en una ventana nueva...
start "Hallado - Backend" cmd /k "backend\start-backend.bat"

echo Abriendo Metro para Expo Go en una ventana nueva...
start "Hallado - Metro" cmd /k "npx expo start --go --port 8082"

echo.
echo Listo. Para frenar todo, cerra las dos ventanas.
echo Escanea el codigo QR de Metro con la app Expo Go en tu celular.
endlocal
