# 🥊 GUÍA DE DEFENSA Y EXPOSICIÓN — PRIMER AVANCE (SPRINT 1)
**Proyecto:** BoxControl — Sistema de Gestión de Membresías para Gimnasio de Boxeo  
**Asignatura:** Aplicaciones Web y Móviles (6to Semestre)  
**Equipo de Desarrollo (Grupo 4):** Chachalo Joseph, Jiron Jonathan, Paredes Robert  
**Hito Evaluado:** Sprint 1 — Cimientos Arquitectónicos, BD MySQL, Seguridad JWT y Sucursales (20% de avance)

---

## 🚀 1. Preparación Previa (Antes de que el Docente te atienda)
1. Abre **XAMPP Control Panel** y asegúrate de que **MySQL** esté iniciado (`Port: 3306`).
2. Haz doble clic en el archivo:
   👉 `c:\SEXTO SEMESTRE\WEB Y MOVIL\boxcontrol\iniciar_todo.bat`
   * Esto levantará el Backend (puerto 4000) y el Frontend Web (puerto 5173).
   * Se abrirán automáticamente dos pestañas en tu navegador:
     1. **Aplicación Web:** `http://localhost:5173`
     2. **Documentación Swagger UI:** `http://localhost:4000/api-docs`
3. En una tercera pestaña, abre **phpMyAdmin:** `http://localhost/phpmyadmin` y selecciona la base de datos `boxcontrol_db`.
4. Ten a mano el documento formal del informe:
   * [Informe_Primer_Avance_BoxControl.pdf](file:///c:/SEXTO%20SEMESTRE/WEB%20Y%20MOVIL/Informe_Primer_Avance_BoxControl.pdf)

---

## 🎙️ 2. Guion de Exposición Paso a Paso (10 Minutos)

### Minuto 0 a 2: Introducción y Contexto del Negocio
* *"Buenos días/tardes, Ingeniero(a). Somos el Grupo 4 conformado por Joseph Chachalo, Jonathan Jiron y Robert Paredes. Nuestro proyecto es **BoxControl**, una solución tecnológica para el club de boxeo **'Guante Dorado'**, que actualmente opera con dos sucursales (Sede Norte y Sede Sur)."*
* *"El problema de partida es que el gimnasio lleva el control de membresías, cobros y aforo en cuadernos físicos, lo que genera descontrol en clientes activos, cobros tardíos y falta de reportes."*
* *"Para este **Primer Avance (Sprint 1)**, nos comprometimos a entregar los cimientos completos del sistema: la base de datos relacional íntegra, la API REST en Node.js/Express con seguridad JWT y control de roles, la documentación interactiva en Swagger y la aplicación Web administrativa basada en los mockups oficiales."*

---

### Minuto 2 a 4: Demostración de la Base de Datos en MySQL (phpMyAdmin)
* *Abre la pestaña de phpMyAdmin con `boxcontrol_db`.*
* *"Hemos implementado el modelo relacional completo con 9 tablas bajo motor InnoDB, garantizando integridad referencial:"*
  1. **`roles`:** Define los 3 niveles de acceso: `ADMINISTRADOR`, `RECEPCIONISTA` y `CLIENTE`.
  2. **`sucursales` (RF-W10):** Las dos sedes (Norte y Sur) con sus datos de contacto y estado.
  3. **`usuarios` (RF-W01):** Cuentas protegidas con contraseñas hasheadas en `bcrypt`.
  4. **`clientes`:** Perfiles con cédula ecuatoriana y campo para el código QR dinámico.
  5. **`tipos_membresia` (RF-W03):** Planes sembrados (Mensual Boxeo $45, Trimestral $120, Pase 10 Clases $35).
  6. **`membresias`, `pagos`, `asistencias` y `contenidos_ia`:** Tablas estructuradas para los siguientes sprints.
* *Muestra la tabla `usuarios` y señala que las contraseñas están hasheadas con salt de 10 rondas de bcrypt, nunca en texto plano.*

---

### Minuto 4 a 7: Demostración de la API REST en Swagger UI (`http://localhost:4000/api-docs`)
* *Abre la pestaña de Swagger UI.*
* *"Toda la API REST está desacoplada y documentada con estándares OpenAPI 3.0 mediante Swagger UI:"*
  1. **Probar Login (`POST /api/auth/login`):**
     * Despliega el endpoint, dale a **Try it out**.
     * Ingresa:
       ```json
       {
         "email": "admin@boxcontrol.com",
         "password": "Admin123*"
       }
       ```
     * Dale a **Execute**. Muestra la respuesta HTTP `200 OK`, el **Token JWT emitido** y el payload del usuario con su rol.
     * Copia el token JWT generado.
  2. **Autorizar en Swagger:**
     * Sube y haz clic en el botón verde **Authorize** (arriba a la derecha).
     * Pega el token y dale a **Authorize**. Ahora Swagger está autenticado.
  3. **Probar Sucursales (`GET /api/sucursales`):**
     * Ejecuta `GET /api/sucursales` y muestra que devuelve las 2 sucursales directamente desde MySQL.

---

### Minuto 7 a 9: Demostración de la Web Administrativa (`http://localhost:5173`)
* *Abre la pestaña de la Web.*
* **Pantalla de Login:**
  * Señala que sigue al 100% el diseño del mockup `01-login-web.svg` de Guante Dorado.
  * Muestra el botón *"INGRESAR AL RING"*.
  * Puedes usar el botón de acceso rápido **"Admin General"** (`admin@boxcontrol.com` / `Admin123*`).
* **Dashboard Operativo:**
  * Al ingresar, muestra el layout con Sidebar (menú de Operación y Configuración).
  * Muestra el avatar con iniciales "JC" y rol "ADMIN GENERAL".
  * Muestra los KPIs (142 Socios Activos, 18 Por Vencer, $5,840 Ingresos, 64 Asistencias).
  * Muestra el filtro de sucursales en el Topbar (`TODAS`, `NORTE`, `SUR`) que recalcula las cifras.
* **Módulo de Sucursales:**
  * Haz clic en **"Sucursales"** en el Sidebar.
  * Muestra las cards de **Sede Norte** y **Sede Sur** (Mockup `08-sucursales.svg`).
  * Muestra cómo el botón **"INACTIVAR / ACTIVAR"** cambia el estado en tiempo real en la base de datos MySQL mediante la API.
  * Haz clic en **"+ NUEVA SUCURSAL"**, crea una sucursal de prueba (ej: `Sucursal Cumbayá`) y muestra cómo se agrega inmediatamente a la pantalla y a la base de datos.

---

### Minuto 9 a 10: Conclusión y Proyección al Sprint 2
* *"Con este primer avance dejamos cerrado el **Sprint 1 (20% del proyecto)** con los requerimientos **RF-W01 (Auth y Roles)** y **RF-W10 (Sucursales)** totalmente operativos."*
* *"Para el **Sprint 2 (Semanas 3 y 4)**, sobre esta base implementaremos la gestión de Clientes (RF-W02), el catálogo de tipos de membresía (RF-W03), la asignación de vigencias (RF-W04) y el registro de pagos (RF-W05)."*
* *"Quedamos atentos a sus preguntas o retroalimentación."*

---

## ❓ 3. Preguntas Típicas del Docente y Cómo Responderlas

**P: ¿Por qué eligieron Sequelize en lugar de consultas SQL puras (`mysql2`)?**  
*R:* *"Sequelize nos permite trabajar con modelos orientados a objetos, gestionar relaciones complejas entre tablas con validaciones automáticas, aplicar hooks de seguridad para hashear contraseñas antes de guardar y prevenir de forma nativa inyecciones SQL."*

**P: ¿Cómo aseguran que un recepcionista de la Sede Norte no modifique datos de la Sede Sur?**  
*R:* *"El token JWT lleva en su payload el `rol` y el `sucursalId` del usuario. En nuestros middlewares del backend (`verificarToken` y `esAdmin`), interceptamos las peticiones y filtramos las consultas para que los recepcionistas solo operen sobre su propia sede, mientras que el Administrador General tiene alcance global."*

**P: ¿Dónde se conectará la aplicación móvil?**  
*R:* *"La App Móvil en React Native (Expo) consumirá exactamente estos mismos endpoints REST. En el Sprint 3 conectaremos el login móvil a `/api/auth/login` y generaremos el código QR dinámico con la cédula y token del cliente para el control de asistencia."*

---

## 🔑 4. Credenciales de Acceso Rápido
* **Administrador General:** `admin@boxcontrol.com` | `Admin123*`
* **Recepcionista Sede Norte:** `recepcion.norte@boxcontrol.com` | `Recep123*`
* **Recepcionista Sede Sur:** `recepcion.sur@boxcontrol.com` | `Recep123*`
