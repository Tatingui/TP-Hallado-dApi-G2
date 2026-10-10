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

REM --- 2. Buscar adb.exe ---
set "ADB_EXE="

where adb.exe >nul 2>&1
if %errorlevel%==0 (
    set "ADB_EXE=adb.exe"
    goto :adb_encontrado
)

set "ADB_PATH=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
if exist "!ADB_PATH!" (
    set "ADB_EXE=!ADB_PATH!"
    goto :adb_encontrado
)

echo [AVISO] No se encontro adb.exe.
echo El backend va a arrancar igual, pero vas a tener que correr
echo manualmente:  adb reverse tcp:8081 tcp:8081
echo.
goto :skip_adb

:adb_encontrado
REM --- 3. Esperar a que el emulador este listo y configurar adb reverse ---
echo Esperando al emulador de Android...
set "ADB_OK=0"
for /L %%i in (1,1,30) do (
    if !ADB_OK!==0 (
        "!ADB_EXE!" devices 2>nul | findstr /r /c:"emulator.*device" >nul 2>&1
        if !errorlevel!==0 (
            "!ADB_EXE!" reverse tcp:8081 tcp:8081 >nul 2>&1
            if !errorlevel!==0 (
                echo adb reverse configurado. OK.
                echo.
                set "ADB_OK=1"
            )
        )
        if !ADB_OK!==0 (
            timeout /t 2 /nobreak >nul
        )
    )
)
if !ADB_OK!==0 (
    echo [AVISO] No se detecto el emulador despues de 60 segundos.
    echo Cuando el emulador este corriendo, ejecuta manualmente:
    echo   adb reverse tcp:8081 tcp:8081
    echo.
)

:skip_adb

REM --- 4. Credenciales de email (cuenta compartida del equipo) ---
set MAIL_USERNAME=rondauade@gmail.com
set MAIL_PASSWORD=ukpblecflriqfyyd

REM --- 5. Levantar el backend ---
echo Levantando el backend...
echo Para frenarlo: Ctrl+C
echo.
echo ===============================================
echo.

call .\mvnw.cmd spring-boot:run -Dmaven.test.skip=true
