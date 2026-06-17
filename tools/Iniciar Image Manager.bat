@echo off
cd /d "%~dp0.."
python tools\image-manager.py
if errorlevel 1 (
    echo.
    echo La app cerro con un error.
    echo Contacta a Samuel: +57 304 353 8450
    pause
)
