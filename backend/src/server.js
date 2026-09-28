const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const sucursalRoutes = require('./routes/sucursalRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const tipoMembresiaRoutes = require('./routes/tipoMembresiaRoutes');
const membresiaRoutes = require('./routes/membresiaRoutes');
const pagoRoutes = require('./routes/pagoRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const contenidoIARoutes = require('./routes/contenidoIARoutes');
const asistenciaRoutes = require('./routes/asistenciaRoutes');

const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./docs/swagger');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentación Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rutas Principales de BoxControl (Ecosistema Completo)
app.use('/api/auth', authRoutes);
app.use('/api/sucursales', sucursalRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/tipos-membresia', tipoMembresiaRoutes);
app.use('/api/membresias', membresiaRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/contenido-ia', contenidoIARoutes);
app.use('/api/asistencias', asistenciaRoutes);

// Endpoint de verificación de estado (Healthcheck)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    project: 'BoxControl API REST',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    materia: 'Aplicaciones Web y Móviles',
    grupo: 'Grupo 4 - Chachalo, Jiron, Paredes',
    modules: [
      'auth',
      'sucursales',
      'clientes',
      'tipos-membresia',
      'membresias',
      'pagos',
      'dashboard',
      'reportes',
      'contenido-ia',
      'asistencias',
    ],
  });
});

// Ruta raíz con landing de bienvenida
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>BoxControl API</title>
        <style>
          body { font-family: Arial, sans-serif; background: #0b0b0d; color: #f5efe0; padding: 40px; text-align: center; }
          .card { background: #141418; max-width: 650px; margin: auto; padding: 36px; border-radius: 8px; border: 1px solid #2a2a31; box-shadow: 0 4px 30px rgba(0,0,0,0.8); }
          h1 { color: #e8b84a; font-size: 32px; letter-spacing: 2px; margin-bottom: 6px; }
          p { color: #b8b8be; line-height: 1.6; }
          .status { color: #4ade80; font-weight: bold; }
          .badges { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin: 20px 0; }
          .badge { background: #1b1b21; border: 1px solid #3a3a42; color: #e8b84a; padding: 6px 12px; font-family: monospace; font-size: 11px; }
          a { display: inline-block; margin-top: 15px; padding: 12px 24px; background: #e8b84a; color: #1a1206; text-decoration: none; font-weight: bold; letter-spacing: 1px; }
          a:hover { background: #d4a538; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🥊 BOXCONTROL API REST</h1>
          <p>Sistema de Gestión de Membresías para Gimnasio de Boxeo "Guante Dorado"</p>
          <p><strong>Materia:</strong> Aplicaciones Web y Móviles — 6to Semestre</p>
          <p>Estado del Servidor: <span class="status">● ONLINE Y SINCRONIZADO</span></p>
          <div class="badges">
            <span class="badge">AUTH JWT</span>
            <span class="badge">SUCURSALES</span>
            <span class="badge">CLIENTES</span>
            <span class="badge">MEMBRESÍAS</span>
            <span class="badge">COBROS</span>
            <span class="badge">DASHBOARD</span>
            <span class="badge">REPORTES PDF</span>
            <span class="badge">CONTENIDO IA</span>
            <span class="badge">ACCESO QR</span>
          </div>
          <a href="/api-docs" target="_blank">EXPLORAR DOCUMENTACIÓN SWAGGER UI 📖</a>
        </div>
      </body>
    </html>
  `);
});

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada en BoxControl API.`,
  });
});

// Iniciar servidor
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✓ Conexión establecida exitosamente con MySQL (boxcontrol_db).');

    app.listen(PORT, () => {
      console.log(`\n==================================================`);
      console.log(`🥊 SERVIDOR BOXCONTROL INICIADO CON ÉXITO`);
      console.log(`==================================================`);
      console.log(`• URL Base:       http://localhost:${PORT}`);
      console.log(`• Swagger UI:     http://localhost:${PORT}/api-docs`);
      console.log(`• Health Check:   http://localhost:${PORT}/api/health`);
      console.log(`==================================================\n`);
    });
  } catch (error) {
    console.error('✗ Error al conectar con la base de datos MySQL:', error);
    process.exit(1);
  }
}

startServer();
