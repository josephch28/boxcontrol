@echo off
title BoxControl - Servidor Backend API REST
color 0B
echo =========================================================
echo    BOXCONTROL - SISTEMA DE GESTION DE MEMBRESIAS
echo    Servidor Backend API REST (Node.js + Express)
echo    Grupo 4: Chachalo, Jiron, Paredes
echo =========================================================
echo.
cd /d "%~dp0backend"
echo Iniciando servidor en puerto 4000...
node src/server.js
pause
