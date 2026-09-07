const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const sucursalRoutes = require('./routes/sucursalRoutes');
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

// Rutas Principales
app.use('/api/auth', authRoutes);
app.use('/api/sucursales', sucursalRoutes);

// Endpoint de verificación de estado (Healthcheck)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    project: 'BoxControl API REST',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    materia: 'Aplicaciones Web y Móviles',
    grupo: 'Grupo 4 - Chachalo, Jiron, Paredes',
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>BoxControl API</title>
        <style>
          body { font-family: Arial, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; text-align: center; }
          .card { background: #1e293b; max-width: 600px; margin: auto; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
          h1 { color: #38bdf8; margin-bottom: 10px; }
          a { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
          a:hover { background: #1d4ed8; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🥊 BoxControl API REST</h1>
          <p>Sistema de Gestión de Membresías para Gimnasio de Boxeo</p>
          <p><strong>Materia:</strong> Aplicaciones Web y Móviles — Grupo 4</p>
          <p>Estado del Servidor: <span style="color: #4ade80;">● ONLINE</span></p>
          <a href="/api-docs" target="_blank">Explorar Documentación en Swagger UI 📖</a>
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
