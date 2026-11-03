@echo off
REM ===============================================================
REM  Hallado - Instalacion
REM  Correr la primera vez, y cada vez que cambien dependencias
REM  nativas (alguien agrego o actualizo una libreria en package.json).
REM  Antes: tener el emulador abierto y haber hecho los pasos de
REM  docs\INSTALACION.md (Android Studio, CMake, rutas largas, MySQL).
REM ===============================================================
setlocal
cd /d "%~dp0"

echo ===============================================
echo   Hallado - Instalacion de la app
echo ===============================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] No se encontro Node.js. Instalalo desde https://nodejs.org ^(version 22.13 o superior^).
    pause
    exit /b 1
)

echo [1/2] Instalando dependencias ^(npm ci^)...
call npm ci
if errorlevel 1 (
    echo.
    echo [ERROR] Fallo npm ci. Cerra Metro, Android Studio y cualquier terminal
    echo que este usando la carpeta del proyecto, y volve a intentar.
    pause
    exit /b 1
)

echo.
echo [2/2] Compilando e instalando la app en el emulador...
echo La primera vez puede tardar entre 10 y 20 minutos.
echo.
call npm run android
if errorlevel 1 (
    echo.
    echo [ERROR] Fallo la compilacion. Revisa la seccion "Problemas frecuentes"
    echo de docs\INSTALACION.md.
    pause
    exit /b 1
)

endlocal
