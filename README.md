# 🥊 BoxControl — Sistema de Gestión de Membresías para Gimnasio de Boxeo

> **"Pelea sin papel."**  
> Plataforma web y móvil para digitalizar y centralizar el control de membresías, cobros, aforo y acceso en un gimnasio de boxeo con dos sucursales.

---

## 📌 Datos de la Asignatura y Equipo
* **Asignatura:** Aplicaciones Web y Móviles (6to Semestre)
* **Equipo de Desarrollo (Grupo 4):**
  * **Chachalo Joseph** — *Scrum Master & Backend Architect*
  * **Jiron Jonathan** — *Product Owner & Frontend Web Lead*
  * **Paredes Robert** — *Mobile Lead & DevOps / QA Lead*
* **Periodo:** 10 Semanas (5 Sprints Scrum de 2 semanas)

---

## 🎯 Descripción del Proyecto
Actualmente, el registro de clientes del gimnasio se realiza de forma manual en cuadernos físicos. Esta modalidad dificulta:
* Conocer con exactitud la cantidad de clientes activos por sede (Sede Norte y Sede Sur).
* Detectar a tiempo membresías vencidas o por vencer para gestionar el cobro oportuno.
* Controlar el ingreso de socios y registrar sus asistencias en tiempo real.
* Generar reportes contables e indicadores para la toma de decisiones.

**BoxControl** resuelve esto mediante un ecosistema digital compuesto por:
1. **API REST Centralizada (Node.js + Express):** Control de acceso por roles (RBAC), seguridad con JWT/bcrypt y documentación interactiva en Swagger UI.
2. **Capa de Persistencia (MySQL en XAMPP):** Base de datos relacional con 9 tablas modeladas con Sequelize ORM.
3. **Plataforma Web Administrativa (React + Vite + Tailwind CSS):** Para recepcionistas y administradores (Gestión de sucursales, clientes, membresías, cobros y dashboard).
4. **Aplicación Móvil para Clientes (React Native Expo):** Carnet digital con código QR único, control de ingreso, consulta de vigencia, notificaciones push e integración de rutinas con OpenAI API.

---

## 🏗️ Arquitectura y Tecnologías
* **Backend:** Node.js, Express, Sequelize ORM, MySQL (XAMPP / phpMyAdmin).
* **Seguridad:** JSON Web Tokens (JWT), bcryptjs (hashing de contraseñas con salt).
* **Documentación API:** Swagger UI (`swagger-ui-express` + `swagger-jsdoc`).
* **Frontend Web:** React 18, Vite, Tailwind CSS, Axios, Lucide React Icons.
* **Móvil (Sprint 3):** React Native, Expo, `react-native-qrcode-svg`, `expo-camera`, Expo Notifications / FCM.
* **Inteligencia Artificial (Sprint 4):** OpenAI API (generación de rutinas de boxeo y planes de nutrición deportiva).

---

## 📁 Estructura del Repositorio
```text
boxcontrol/
├── backend/                    # Servidor API REST (Node.js + Express)
│   ├── src/
│   │   ├── config/database.js  # Conexión Sequelize a MySQL
│   │   ├── controllers/        # Controladores (auth, sucursal, etc.)
│   │   ├── docs/swagger.js     # Configuración Swagger OpenAPI 3.0
│   │   ├── middlewares/        # Middlewares (authMiddleware, roles)
│   │   ├── models/             # Modelos relacionales Sequelize
│   │   ├── routes/             # Rutas y endpoints documentados
│   │   ├── seed.js             # Seeder con datos de prueba
│   │   └── server.js           # Punto de entrada del servidor
│   ├── .env.example            # Plantilla de variables de entorno
│   └── package.json
├── frontend-web/               # SPA Administrativa (React + Vite)
│   ├── src/
│   │   ├── api/axios.js        # Cliente HTTP con interceptores JWT
│   │   ├── components/         # Layout (Sidebar, Topbar, etc.)
│   │   ├── context/            # AuthContext (Estado de autenticación)
│   │   ├── pages/              # Vistas (Login, Dashboard, Sucursales)
│   │   ├── App.jsx
│   │   └── index.css           # Estilos con Tailwind CSS
│   └── package.json
├── database/
│   └── boxcontrol_db.sql       # Script SQL para importar en MySQL
├── docs/                       # Documentación formal del proyecto
│   ├── Propuesta_BoxControl.pdf
│   ├── Planificacion_Proyecto_BoxControl.pdf
│   └── Informe_Primer_Avance_BoxControl.pdf
├── mockups/                    # 16 Mockups en SVG de alta fidelidad
├── iniciar_todo.bat            # Script de 1 clic para iniciar todo
├── iniciar_backend.bat         # Inicia el backend (puerto 4000)
├── iniciar_frontend.bat        # Inicia el frontend (puerto 5173)
└── README.md
```

---

## ⚡ Instalación y Puesta en Marcha

### 1. Requisitos Previos
* Node.js v18 o superior instalado.
* XAMPP (Apache y MySQL activos).

### 2. Base de Datos
1. Abre **XAMPP Control Panel** e inicia el servicio **MySQL**.
2. Abre **phpMyAdmin** (`http://localhost/phpmyadmin`) o tu terminal de MySQL y ejecuta el script:
   ```bash
   mysql -u root < database/boxcontrol_db.sql
   ```
   *(Esto crea la base de datos `boxcontrol_db` con sus 9 tablas y datos iniciales).*

### 3. Backend (API REST)
```bash
cd backend
npm install
npm run seed     # Poblar base de datos con roles, sucursales y usuarios
npm start        # Iniciar servidor en http://localhost:4000
```
* **Swagger UI interactivo:** `http://localhost:4000/api-docs`
* **Healthcheck:** `http://localhost:4000/api/health`

### 4. Frontend Web
```bash
cd frontend-web
npm install
npm run dev      # Iniciar en http://localhost:5173
```

---

## 🔑 Credenciales de Prueba (Seeders)

| Rol | Correo Electrónico | Contraseña | Sucursal Asignada |
| :--- | :--- | :--- | :--- |
| **Administrador General** | `admin@boxcontrol.com` | `Admin123*` | Sede Norte (Acceso Global) |
| **Recepcionista Norte** | `recepcion.norte@boxcontrol.com` | `Recep123*` | Sucursal Norte - Gym Central |
| **Recepcionista Sur** | `recepcion.sur@boxcontrol.com` | `Recep123*` | Sucursal Sur - Boxing Club |

---

## 🗓️ Cronograma de Sprints (10 Semanas)
* **Sprint 1 (Semanas 1-2) — [20%]:** Cimientos Arquitectónicos, BD MySQL, Login JWT y CRUD Sucursales (RF-W01, RF-W10). *(Entregado)*
* **Sprint 2 (Semanas 3-4) — [40%]:** Gestión de Clientes, Tipos de Membresía y Módulo de Cobros (RF-W02, RF-W03, RF-W04, RF-W05, RF-W11).
* **Sprint 3 (Semanas 5-6) — [65%]:** Aplicación Móvil en Expo, Carnet Digital QR y Control de Asistencia (RF-M01, RF-M02, RF-M03, RF-M04, RF-M06).
* **Sprint 4 (Semanas 7-8) — [85%]:** Módulo de IA (OpenAI API), Notificaciones Push de Vencimiento e Historiales (RF-W12, RF-M05, RF-M07, RF-M08).
* **Sprint 5 (Semanas 9-10) — [100%]:** Dashboards Analíticos (Chart.js), Reportes Financieros en PDF, QA Integral y Sustentación Final (RF-W06, RF-W07, RF-W08, RF-W09).

---

## 📜 Licencia
Proyecto desarrollado con fines académicos para la carrera de Ingeniería de Software / Sistemas — 2026.
