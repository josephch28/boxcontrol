# 🥊 BoxControl — Sistema de Gestión de Membresías para Gimnasio de Boxeo

> **"Pelea sin papel."**  
> Plataforma web y móvil integral para digitalizar, automatizar y centralizar el control de membresías, caja y cobros, aforo y acceso en un club de boxeo con múltiples sucursales.

---

## 📌 Datos de la Asignatura y Equipo
* **Institución:** Universidad / Facultad de Ingeniería de Sistemas y Software
* **Asignatura:** Aplicaciones Web y Móviles (6to Semestre)
* **Equipo de Desarrollo (Grupo 4):**
  * **Chachalo Joseph** — *Scrum Master & Backend Architect*
  * **Jiron Jonathan** — *Product Owner & Frontend Web Lead*
  * **Paredes Robert** — *Mobile Lead & DevOps / QA Lead*

---

## 🎯 Descripción del Proyecto
Tradicionalmente, la administración de academias y clubes de boxeo se realiza en cuadernos físicos o planillas manuales, lo que causa pérdidas financieras por socios que entrenan con membresías vencidas, descuadres de caja entre turnos, falta de control en el aforo máximo y ausencia de reportes contables inmediatos.

**BoxControl** resuelve esto a través de un ecosistema digital moderno y robusto compuesto por:
1. **API RESTful Centralizada (Node.js + Express):** Control de acceso basado en roles (**RBAC**), seguridad con **JWT** y **bcryptjs**, transacciones **ACID** con **Sequelize ORM** y documentación interactiva en **Swagger UI** (OpenAPI 3.0).
2. **Capa de Persistencia (MySQL en XAMPP):** Base de datos relacional con 9 tablas normalizadas (3FN), restricciones de clave foránea y borrado lógico para auditoría.
3. **Plataforma Web SPA (React 18 + Vite + Tailwind CSS):** Interfaz para recepcionistas y administradores con validaciones en tiempo real, emisión de recibos y exportación oficial de reportes a PDF.
4. **Control de Acceso Presencial (Check-In con QR / Cédula):** Simulación de torniquete con validación instantánea de vigencia, prevención de doble lectura (*debounce* de 3 min) y bloqueo de usuarios inactivos o morosos.
5. **Motor de Inteligencia Artificial para Boxeo:** Generador experto de rutinas dinámicas por nivel y planes de nutrición deportiva para combate.

---

## 🚀 Módulos y Funcionalidades del Sistema

* **📊 Dashboard Gerencial:** 4 KPIs en tiempo real (Socios activos, Por vencer en 7 días, Ingresos del mes, Asistencias hoy y aforo), gráfico interactivo SVG de recaudación diaria con curva de tendencia y tabla de ingresos en vivo.
* **🥊 Gestión de Socios (Clientes):** Listado con filtros (`ACTIVOS`, `POR VENCER`, `NUEVOS`), buscador universal en tiempo real, validación de cédula ecuatoriana con algoritmo **Módulo 10**, unicidad de correo y generación automática de **carnet digital con código QR único**.
* **💰 Caja y Cobros (Pagos):** Registro de cobros con buscador predictivo en tiempo real de socios (evita selects interminables), cálculo automático de vigencias, emisión de **Recibos de Caja Foliados** (`R-0000XX`) e historial de pagos.
* **🛡️ Control de Acceso y Aforo (Check-In):** Lector rápido de QR o ingreso manual de cédula. Autoriza o deniega el ingreso en milisegundos (`HTTP 200` o `HTTP 403`), mostrando días de vigencia restantes y controlando el aforo de la sede.
* **📈 Reportes Financieros Oficiales (RF-W09):** Filtrado por rangos de fechas (predefinidos o personalizados) y sedes, desglose de ingresos por plan y exportación profesional a **PDF con membrete institucional**, metadatos de auditoría y tablas formateadas (`jsPDF` + `AutoTable`).
* **🏢 Gestión de Sucursales:** Catálogo de sedes (Norte y Sur), horarios, capacidades de aforo y métricas dinámicas de recaudación mensual por sucursal.
* **📋 Catálogo de Membresías:** Planes configurables (Básico, Intermedio, Pro / Competición), duración en días, precios y control de estados activo/inactivo.
* **🤖 Boxing Engine (Contenido IA):** Generación de rutinas de boxeo por rounds estructurados (cuerda, sombras tácticas, sacos de golpeo pesado, core) y pautas nutricionales de corte de peso.
* **🔒 Aislamiento Multi-Tenant (RBAC):**
  - **Administrador:** Visualización global consolidada (`TODAS`), cambio dinámico de sedes y acceso exclusivo al menú de Configuración.
  - **Recepcionista:** Operación fijada a su sede asignada (badge estático, sin permisos para cambiar de sede ni acceder a la configuración de planes o sucursales, forzado a nivel de middleware en el backend).

---

## 🏗️ Arquitectura y Tecnologías

| Capa | Tecnologías Utilizadas |
| :--- | :--- |
| **Frontend Web** | React 18, Vite, Tailwind CSS, Lucide React Icons, Axios, jsPDF, AutoTable |
| **Backend API** | Node.js, Express, Sequelize ORM, JWT (`jsonwebtoken`), `bcryptjs`, CORS |
| **Base de Datos** | MySQL 8.0 (XAMPP / phpMyAdmin), 9 tablas normalizadas |
| **Documentación API** | Swagger UI (`swagger-ui-express`, `swagger-jsdoc`) con OpenAPI 3.0 |
| **Herramientas de Soporte** | Git, GitHub, Scripts BAT de inicio rápido |

---

## 📁 Estructura del Repositorio

```text
boxcontrol/
├── backend/                    # Servidor API REST (Node.js + Express)
│   ├── src/
│   │   ├── config/database.js  # Conexión Sequelize a MySQL
│   │   ├── controllers/        # Controladores (auth, clientes, pagos, asistencias, reportes, etc.)
│   │   ├── docs/swagger.js     # Configuración Swagger OpenAPI 3.0
│   │   ├── middlewares/        # Middlewares (verificarToken, esAdmin, restringirSucursal)
│   │   ├── models/             # Modelos relacionales Sequelize (Usuario, Cliente, Pago, etc.)
│   │   ├── routes/             # Enrutadores de la API REST
│   │   ├── seed.js             # Seeder con datos de prueba realistas
│   │   └── server.js           # Punto de entrada del servidor (puerto 4000)
│   ├── .env.example            # Plantilla de variables de entorno
│   └── package.json
├── frontend-web/               # SPA Administrativa (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── api/axios.js        # Instancia Axios con interceptores JWT y manejo de 401
│   │   ├── components/         # Modales (Check-In, Pagos), Gráficos SVG, Sidebar, Topbar
│   │   ├── context/            # AuthContext (Estado global de sesión y usuario)
│   │   ├── pages/              # Vistas principales (Login, Dashboard, Clientes, Pagos, etc.)
│   │   ├── utils/validators.js # Validadores en tiempo real (Cédula ecuatoriana Módulo 10, etc.)
│   │   ├── App.jsx             # Enrutador principal de vistas y guardas de navegación
│   │   └── index.css           # Estilos globales y paleta de colores institucional
│   └── package.json
├── database/
│   └── boxcontrol_db.sql       # Script SQL completo de estructura y datos iniciales
├── docs/                       # Documentación formal de la asignatura
├── GUIA_PRESENTACION.md        # Guía paso a paso y guión técnico para la sustentación
├── iniciar_todo.bat            # Script de 1 clic para iniciar Backend y Frontend simultáneamente
├── iniciar_backend.bat         # Inicia el servidor backend en http://localhost:4000
├── iniciar_frontend.bat        # Inicia el cliente frontend en http://localhost:5173
└── README.md
```

---

## ⚡ Instalación y Puesta en Marcha

### 1. Requisitos Previos
* **Node.js:** v18.0.0 o superior ([Descargar Node.js](https://nodejs.org/)).
* **XAMPP:** Con módulos Apache y MySQL activos ([Descargar XAMPP](https://www.apachefriends.org/)).

### 2. Configurar la Base de Datos
1. Inicia **MySQL** desde el panel de control de XAMPP.
2. Abre tu terminal en la raíz del proyecto y ejecuta:
   ```bash
   mysql -u root < database/boxcontrol_db.sql
   ```
   *(También puedes importar el archivo `database/boxcontrol_db.sql` directamente desde phpMyAdmin en `http://localhost/phpmyadmin`).*

### 3. Iniciar el Backend (API REST)
```bash
cd backend
npm install
npm run seed       # Poblar la base de datos con cuentas y transacciones de prueba
npm start          # Iniciar servidor en http://localhost:4000
```
* **Swagger UI interactivo:** [http://localhost:4000/api-docs](http://localhost:4000/api-docs)
* **Healthcheck:** [http://localhost:4000/api/health](http://localhost:4000/api/health)

### 4. Iniciar el Frontend Web
En una nueva terminal:
```bash
cd frontend-web
npm install
npm run dev        # Iniciar aplicación en http://localhost:5173
```

> 💡 **Tip:** En Windows puedes hacer doble clic sobre el archivo `iniciar_todo.bat` en la raíz para arrancar ambos servicios automáticamente.

---

## 🔑 Credenciales de Prueba (Para Evaluación y Testeo)

| Rol / Perfil | Correo Electrónico | Contraseña | Sede Asignada | Alcance |
| :--- | :--- | :--- | :--- | :--- |
| **Administrador General** | `admin@boxcontrol.com` | `Admin123*` | Sede Norte | Acceso global a todas las sedes y configuración |
| **Recepcionista Norte** | `recepcion.norte@boxcontrol.com` | `Recep123*` | Sede Norte | Operación fija a Sede Norte (Sin configuración) |
| **Recepcionista Sur** | `recepcion.sur@boxcontrol.com` | `Recep123*` | Sede Sur | Operación fija a Sede Sur (Sin configuración) |

---

## 🎓 Guía para Sustentación ante el Docente
Para preparar la defensa técnica del proyecto con el docente, revisa el archivo dedicado:
👉 **[GUIA_PRESENTACION.md](./GUIA_PRESENTACION.md)**  
*(Contiene el discurso de apertura, justificación de arquitectura, guión de demostración en vivo paso a paso y respuestas a posibles preguntas técnicas del evaluador).*

---

## 📜 Licencia
Proyecto desarrollado con fines académicos para la carrera de Ingeniería de Software / Sistemas — 2026.
Club de Boxeo *"Guante Dorado"* · BoxControl v1.0.
