@echo off
REM ===============================================================
REM  Hallado - Arranque diario
REM  Abre dos ventanas: el backend (Spring Boot, puerto 8081) y
REM  Metro (Expo, puerto 8082), y abre la app en el emulador.
REM  Requiere haber corrido instalar.bat al menos una vez.
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

echo Abriendo Metro en una ventana nueva...
start "Hallado - Metro" cmd /k "npm start -- --android"

echo.
echo Listo. Para frenar todo, cerra las dos ventanas.
echo Si la app no se abre sola, abri "TPReactNative" en el emulador.
endlocal
