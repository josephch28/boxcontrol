# 🥊 GUÍA DE SUSTENTACIÓN Y PRESENTACIÓN TÉCNICA — BOXCONTROL
## Para la Defensa del Proyecto ante el Ingeniero / Docente

> **Ecosistema:** BoxControl — Sistema de Gestión Integral para Gimnasios de Boxeo con Múltiples Sedes  
> **Asignatura:** Aplicaciones Web y Móviles (6to Semestre)  
> **Lema Institucional:** *"Pelea sin papel"*  
> **Equipo (Grupo 4):** Joseph Chachalo, Jonathan Jiron, Robert Paredes  

---

## 🎯 1. Discurso de Apertura y Justificación (1-2 Minutos)

> *"Estimado Ingeniero, actualmente la mayoría de academias y clubes de boxeo en nuestro medio gestionan a sus socios, cobros y aforo en cuadernos de papel o en hojas de cálculo no centralizadas.*  
> *Esto provoca pérdidas económicas por socios con cuotas vencidas que siguen entrenando, descuadres de caja entre sucursales, falta de control en el aforo máximo y nula trazabilidad contable.*  
>  
> *Para resolver esta problemática desarrollamos **BoxControl**, una plataforma web y móvil multi-tenant que centraliza y digitaliza el ciclo completo: desde el registro del socio con validación de cédula ecuatoriana, emisión de carnets digitales con código QR, control de acceso automatizado en tiempo real, caja y cobros con recibos foliados, hasta reportes financieros auditables con exportación a PDF oficial y generación de rutinas de boxeo mediante Inteligencia Artificial."*

---

## 🏗️ 2. Arquitectura de Software y Decisiones de Ingeniería

Cuando el docente pregunte sobre la **arquitectura del sistema**, destaca los siguientes puntos clave:

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND WEB (SPA)                      │
│        React 18 + Vite + Tailwind CSS + Lucide Icons        │
│   • AuthContext (JWT)  • Axios Interceptors  • ErrorBoundary│
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON (REST API)
┌──────────────────────────────▼──────────────────────────────┐
│                      BACKEND API REST                        │
│             Node.js + Express + Swagger OpenAPI 3.0          │
│   • verificarToken (JWT)      • esAdmin / esAdminORecep     │
│   • restringirSucursalRecepcionista (Aislamiento de Sede)   │
│   • Sequelize ORM (Manejo de Transacciones ACID)            │
└──────────────────────────────┬──────────────────────────────┘
                               │ TCP / MySQL Protocol
┌──────────────────────────────▼──────────────────────────────┐
│                    BASE DE DATOS RELACIONAL                  │
│                     MySQL 8.0 (XAMPP)                       │
│    9 Tablas Normalizadas (3FN) con Índices y Claves Foráneas│
└─────────────────────────────────────────────────────────────┘
```

1. **Patrón de Arquitectura:** Cliente-Servidor desacoplado mediante **API RESTful**.
2. **Seguridad Robusta:**
   - Autenticación sin estado (**Stateless**) mediante **JSON Web Tokens (JWT)** firmados con algoritmo HS256.
   - Encriptación unidireccional de contraseñas con **bcryptjs** (hashing con saltos criptográficos).
   - Control de Acceso Basado en Roles (**RBAC**) a nivel de rutas y middlewares.
3. **Integridad Transaccional (ACID):**
   - El registro de un nuevo socio con pago inicial y la asignación de membresías utilizan **`sequelize.transaction()`**. Si alguna operación secundaria falla, se ejecuta un `rollback` inmediato, impidiendo registros huérfanos o inconsistencias contables.
4. **Diseño de Interfaz y Usabilidad:**
   - Cumplimiento de pautas **WCAG AA** en contraste de color (paleta oscura institucional *Dark Charcoal & Gold*: `#0B0B0D`, `#1B1B21`, `#E8B84A`, texto `#F5EFE0`).
   - Validaciones en tiempo real con feedback visual inmediato (verde/rojo) antes de permitir el envío de formularios.

---

## 🚀 3. Guión de Demostración en Vivo (Flujo Recomendado Paso a Paso)

Sigue este orden cronológico durante la presentación para mostrar el impacto visual y técnico de la aplicación:

### Paso 1: Autenticación y Control de Roles (RBAC)
1. **Entrar como Administrador:**
   - Credenciales: `admin@boxcontrol.com` / `Admin123*` (puedes usar los botones de acceso rápido).
   - **Qué resaltar al docente:**
     - En la barra superior (**Topbar**), el administrador tiene el selector global de sedes (`TODAS | NORTE | SUR`).
     - En el menú lateral (**Sidebar**), tiene acceso visible a la sección **CONFIGURACIÓN** (`Membresías` y `Sucursales`).
2. **Cerrar sesión y entrar como Recepcionista:**
   - Credenciales: `recepcion.sur@boxcontrol.com` / `Recep123*`.
   - **Qué resaltar al docente:**
     - El selector de sedes desaparece y se convierte en un **badge fijo e inmutable**: `[●] SEDE SUR - BOXING CLUB`.
     - La sección **CONFIGURACIÓN** desaparece por completo del Sidebar.
     - *Explicación técnica:* El backend cuenta con el middleware `restringirSucursalRecepcionista` que intercepta cualquier petición y fuerza `req.query.sucursalId = 2`, haciendo imposible la fuga de datos o la manipulación entre sedes incluso por herramientas como Postman.

---

### Paso 2: Dashboard Gerencial y Analítica en Tiempo Real
1. Iniciar sesión como `admin@boxcontrol.com`.
2. Mostrar los **4 KPIs principales**:
   - **Socios Activos:** Conteo consolidado y desglose en vivo por sede (Norte y Sur).
   - **Membresías por Vencer:** Alerta temprana de socios que vencen en los próximos 7 días para gestión de cobranza.
   - **Ingresos del Mes:** Total acumulado con porcentaje de variación respecto al mes anterior.
   - **Check-ins Hoy y Aforo:** Porcentaje de capacidad ocupada en cada sede con barras de progreso dinámicas.
3. Mostrar el **Gráfico de Ingresos Diarios**:
   - Curva de tendencia SVG interactiva, tooltips al pasar el cursor y desglose por sede.
   - *Detalle técnico para impresionar al docente:* Mencionar que el cálculo fue blindado contra desfases de zona horaria (`UTC-5`), evitando que los cobros nocturnos se salten de día.
4. Mostrar la tabla de **Últimos Ingresos en Vivo** (registro instantáneo de accesos).

---

### Paso 3: Gestión de Socios (Módulo Clientes)
1. Navegar a **Clientes**.
2. Probar los **Filtros Dinámicos**:
   - Pestañas rápidas: `TODOS | ACTIVOS | POR VENCER | NUEVOS`.
   - Buscador universal (filtra en tiempo real por nombre, apellido, cédula, correo o teléfono).
3. Abrir el modal **+ NUEVO SOCIO** y demostrar las **validaciones en tiempo real**:
   - **Cédula Ecuatoriana:** Escribir una cédula inválida (ej. `1712345670`). El sistema calculará el dígito verificador mediante el algoritmo **Módulo 10** y mostrará error en rojo. Escribir una cédula válida (ej. `1723456789`) y se marcará con un visto verde.
   - **Validación de Unicidad:** Si se ingresa una cédula o correo ya registrado en la base de datos, el backend lo rechaza evitando duplicados.
   - **Planes Activos:** Mostrar que solo se despliegan planes y sedes activas (los planes desactivados quedan excluidos).
4. Guardar un socio y mostrar cómo el sistema genera automáticamente su **código QR único** (`GD-SOCIO-{cedula}-{hash}`) y carnet digital listo para control de acceso.
5. Hacer clic en **"VER PERFIL"** de cualquier socio para mostrar la vista de detalle:
   - Resumen histórico de pagos, asistencias registradas y botón para **editar datos personales** o **renovar membresía**.

---

### Paso 4: Módulo de Caja y Registro de Cobros (Pagos)
1. Navegar a **Pagos / Caja**.
2. Mostrar el resumen financiero superior: Total cobrado, transacciones y ticket promedio.
3. Hacer clic en **+ REGISTRAR COBRO**:
   - **Buscador de Socios en Tiempo Real:** Demostrar que no es un `<select>` convencional que colapsa con cientos de socios, sino un componente autocompletable con búsqueda por nombre o cédula.
   - Seleccionar un plan: Mostrar cómo el monto y la vigencia en días se autocalculan.
   - Seleccionar método de pago: `EFECTIVO`, `TRANSFERENCIA` o `TARJETA`.
4. Al guardar el cobro:
   - Se emite de inmediato un **Recibo de Caja Foliado** oficial (`R-0000XX`) con opción a imprimir en formato voucher/térmico.
   - El socio pasa automáticamente a estado **ACTIVO** y su vigencia se actualiza en el acto.

---

### Paso 5: Control de Acceso y Asistencia (Simulación de Molinete / Puerta)
1. En la barra superior, hacer clic en el botón dorado **CHECK-IN RÁPIDO** (ícono de código QR).
2. **Caso 1 — Socio Activo (Acceso Concedido):**
   - Usar el botón de prueba rápida con un socio activo (ej. `1723456789`).
   - Se muestra pantalla verde de **¡ACCESO CONCEDIDO!**, su foto/iniciales, plan actual, días restantes de entrenamiento y hora exacta de entrada.
3. **Caso 2 — Doble Marcación Accidental (Debounce de Seguridad):**
   - Volver a escanear al mismo socio inmediatamente.
   - El sistema notifica que ya registró su ingreso hace un momento y **no duplica el registro en la base de datos**, protegiendo la exactitud del aforo.
4. **Caso 3 — Socio Vencido o No Registrado (Acceso Denegado):**
   - Ingresar la cédula de un socio vencido (ej. `1712345678` - Carlos Mendoza).
   - Se muestra pantalla roja de **ACCESO DENEGADO (HTTP 403)** informando la fecha exacta en que caducó su plan y mostrando un botón directo para **"COBRAR EN CAJA"**.

---

### Paso 6: Reportes Financieros Oficiales y Exportación PDF (RF-W09)
1. Navegar a **Reportes**.
2. Mostrar la selección de períodos predefinidos (`ESTE MES | ÚLTIMOS 30 DÍAS | ÚLTIMOS 90 DÍAS`) y rango de fechas personalizado.
3. Filtrar por sede o ver el consolidado general.
4. Mostrar el **gráfico SVG interactivo de ingresos diarios** y el desglose de ingresos por tipo de membresía.
5. Hacer clic en el botón dorado **EXPORTAR REPORTE OFICIAL (PDF)**:
   - El sistema genera en el navegador mediante `jsPDF` y `jsPDF-AutoTable` un documento PDF con estándar corporativo.
   - **Detalles del PDF para destacar:**
     - Cabecera oscura con membrete oficial del club *"Guante Dorado"*.
     - Metadatos de auditoría: fecha y hora de emisión, usuario cajero y versión del software.
     - Bloques de resumen financiero (recaudación total, socios nuevos vs renovaciones, tasa de retención).
     - Tabla foliada con alineación numérica exacta en margen derecho para valores monetarios.

---

### Paso 7: Motor de Inteligencia Artificial para Boxeo (Contenido IA)
1. Navegar a **Contenido IA**.
2. Generar una **Rutina de Entrenamiento**:
   - Nivel: `INTERMEDIO` o `AVANZADO`.
   - Focos de entrenamiento: Seleccionar `Fuerza y Potencia` + `Cardio / Resistencia`.
   - Duración: `45 minutos`.
   - Instrucciones especiales: *"Énfasis en contragolpes y ganchos al cuerpo"*.
3. Hacer clic en **GENERAR RUTINA**:
   - El motor experto genera al instante la rutina desglosada en rounds cronometrados (calentamiento con comba, shadow boxing táctico, series en saco pesado de 100lb, circuito de core y vuelta a la calma con gasto calórico estimado).
4. Cambiar a pestaña **Nutrición Deportiva** para generar pautas alimenticias orientadas al peso y corte de categoría.

---

### Paso 8: Documentación de la API en Swagger
1. Abrir una nueva pestaña en `http://localhost:4000/api-docs`.
2. Mostrar la documentación interactiva OpenAPI 3.0:
   - Endpoints agrupados por tags: `Autenticación`, `Dashboard`, `Clientes`, `Membresías`, `Pagos y Cobros`, `Asistencias`, `Reportes`, `Sucursales`, `Contenido IA`.
   - Esquemas de request/response y seguridad Bearer JWT documentados.

---

## ❓ 4. Posibles Preguntas del Ingeniero y Respuestas Maestras

| Posible Pregunta del Docente | Respuesta Técnica Recomendada |
| :--- | :--- |
| **1. "¿Cómo garantizan que un recepcionista de una sede no consulte ni cobre socios de la otra sede usando herramientas como Postman?"** | *"Implementamos seguridad multicapa: en el frontend ocultamos los controles, pero la verdadera restricción está en el backend con el middleware `restringirSucursalRecepcionista`. Este middleware lee el `sucursalId` criptográficamente firmado en el token JWT del usuario y sobreescribe cualquier parámetro enviado en la URL (`query`) o en el cuerpo (`body`), forzando siempre la sede asignada al recepcionista."* |
| **2. "¿Cómo evitan que la base de datos quede inconsistente si se cae la conexión mientras se registra un socio y su pago inicial?"** | *"Utilizamos transacciones gestionadas con Sequelize (`sequelize.transaction()`). La creación del usuario, del registro de cliente, de la membresía y del pago inicial se ejecutan dentro del mismo bloque transaccional. Si ocurre un fallo en cualquiera de las 4 operaciones, se dispara un `transaction.rollback()` automático, garantizando integridad referencial y atomicidad (ACID)."* |
| **3. "¿Qué algoritmo utilizaron para validar las cédulas de los socios?"** | *"Implementamos el algoritmo oficial del Registro Civil de Ecuador (Módulo 10). Valida que los dos primeros dígitos correspondan a una provincia válida (01 a 24 o 30), que el tercer dígito sea menor a 6 (personas naturales), aplica los coeficientes alternados `[2, 1, 2, 1...]` sobre los primeros 9 dígitos, resta de la decena superior inmediata y verifica que coincida exactamente con el décimo dígito verificador."* |
| **4. "¿Qué sucede cuando se desactiva una sucursal o un plan de membresía?"** | *"No realizamos eliminación física (`DELETE`) para preservar la integridad histórica y contable. Aplicamos borrado lógico (`estado = 'INACTIVA'`). Una vez desactivada, los controladores y los formularios del frontend filtran automáticamente el registro: no aparece para nuevas afiliaciones ni cobros, y el control de acceso rechaza ingresos a sedes inactivas."* |
| **5. "¿Cómo evitaron que los cobros de la noche se computaran en el día equivocado en los gráficos?"** | *"Detectamos que al utilizar `toISOString()`, en la zona horaria de Ecuador (UTC-5) cualquier transacción posterior a las 19:00 UTC pasaba a tener la fecha del día siguiente. Lo solucionamos implementando un helper de formateo de fecha local `formatLocalDate` basado en `getFullYear()`, `getMonth()` y `getDate()`, asegurando que la fecha contable siempre coincida con el día calendario de la sede."* |

---

## 🔑 5. Tabla Rápida de Credenciales para la Presentación

| Perfil | Email | Contraseña | Rol y Permisos |
| :--- | :--- | :--- | :--- |
| **Admin General** | `admin@boxcontrol.com` | `Admin123*` | Control total, consolidados, sedes y membresías |
| **Recep. Sede Norte** | `recepcion.norte@boxcontrol.com` | `Recep123*` | Operación restringida a Sede Norte |
| **Recep. Sede Sur** | `recepcion.sur@boxcontrol.com` | `Recep123*` | Operación restringida a Sede Sur |

---

## 💡 6. Cierre de la Presentación
> *"Con esto demostramos que BoxControl no es solo un prototipo visual, sino un sistema integral con base de datos normalizada, seguridad por roles en el backend, integridad contable y una experiencia de usuario diseñada específicamente para la operación real de un club deportivo."*
