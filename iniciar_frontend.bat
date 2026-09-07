@echo off
title BoxControl - Frontend Web Administrativo
color 0E
echo =========================================================
echo    BOXCONTROL - GUANTE DORADO CLUB DE BOXEO
echo    Frontend Web Administrativo (React + Vite)
echo    Grupo 4: Chachalo, Jiron, Paredes
echo =========================================================
echo.
cd /d "%~dp0frontend-web"
echo Iniciando entorno de desarrollo Vite...
npm run dev
pause
