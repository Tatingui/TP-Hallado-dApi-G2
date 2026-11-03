@echo off
setlocal enabledelayedexpansion

echo ===============================================
echo   Hallado Backend - Arranque rapido
echo ===============================================
echo.

cd /d "%~dp0"

REM --- 1. Regla de firewall (solo la primera vez, no falla si ya existe) ---
netsh advfirewall firewall show rule name="Backend Hallado 8081" >nul 2>&1
if errorlevel 1 (
    echo Agregando regla de firewall para el puerto 8081...
    netsh advfirewall firewall add rule name="Backend Hallado 8081" dir=in action=allow protocol=TCP localport=8081 >nul 2>&1
    if errorlevel 1 (
        echo [AVISO] No se pudo agregar la regla de firewall.
        echo Si tenes problemas de conexion, ejecuta este .bat como administrador.
        echo.
    ) else (
        echo Regla de firewall agregada.
        echo.
    )
) else (
    echo Regla de firewall ya existe. OK.
    echo.
)

REM --- 2. Credenciales de email (cuenta compartida del equipo) ---
set MAIL_USERNAME=rondauade@gmail.com
set MAIL_PASSWORD=ukpblecflriqfyyd

REM --- 3. Levantar el backend ---
echo Levantando el backend...
echo Para frenarlo: Ctrl+C
echo.
echo ===============================================
echo.

call .\mvnw.cmd spring-boot:run -Dmaven.test.skip=true
