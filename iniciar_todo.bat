@echo off
title BoxControl - Lanzador del Sistema Completo
color 0A
echo ===================================================================
echo    🥊 INICIANDO SISTEMA BOXCONTROL (PRIMER AVANCE)
echo    Asignatura: Aplicaciones Web y Moviles
echo    Grupo 4: Chachalo Joseph, Jiron Jonathan, Paredes Robert
echo ===================================================================
echo.
echo [1/3] Verificando que MySQL este activo en XAMPP...
echo [2/3] Levantando Servidor Backend (Node.js + Express en puerto 4000)...
start "BoxControl Backend API" cmd /k "cd /d %~dp0backend && node src/server.js"

echo Esperando 3 segundos a que el servidor inicialice...
timeout /t 3 /nobreak >nul

echo [3/3] Levantando Frontend Web (React + Vite)...
start "BoxControl Frontend Web" cmd /k "cd /d %~dp0frontend-web && npm run dev"

echo.
echo Abriendo Swagger UI y Aplicacion Web en el navegador...
timeout /t 2 /nobreak >nul
start http://localhost:4000/api-docs
start http://localhost:5173

echo.
echo ===================================================================
echo    Todo listo para la presentacion de manana!
echo    - Frontend Web: http://localhost:5173
echo    - Swagger UI:   http://localhost:4000/api-docs
echo ===================================================================
echo.
pause
