const swaggerJsDoc = require('swagger-jsdoc');
const path = require('path');

const getRoutePath = (filename) => path.join(__dirname, '../routes', filename).replace(/\\/g, '/');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BoxControl API REST',
      version: '1.0.0',
      description: 'Documentación interactiva de la API REST de BoxControl — Sistema de Gestión de Membresías para Gimnasio de Boxeo "Guante Dorado".\n\n**Materia:** Aplicaciones Web y Móviles (6to Semestre)\n\n**Equipo Grupo 4:** Chachalo Joseph, Jiron Jonathan, Paredes Robert.',
      contact: {
        name: 'BoxControl Team - Grupo 4',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Servidor Local de Desarrollo (Node.js + Express)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Introduce tu token JWT obtenido en /api/auth/login.',
        },
      },
    },
  },
  apis: [
    getRoutePath('*.js'),
    getRoutePath('authRoutes.js'),
    getRoutePath('sucursalRoutes.js'),
    getRoutePath('clienteRoutes.js'),
    getRoutePath('tipoMembresiaRoutes.js'),
    getRoutePath('membresiaRoutes.js'),
    getRoutePath('pagoRoutes.js'),
    getRoutePath('dashboardRoutes.js'),
    getRoutePath('reporteRoutes.js'),
    getRoutePath('contenidoIARoutes.js'),
    getRoutePath('asistenciaRoutes.js'),
  ],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;
