const swaggerJsDoc = require('swagger-jsdoc');
const path = require('path');

// En Windows, swagger-jsdoc (glob) requiere forward slashes ('/')
const routesGlob = path.join(__dirname, '../routes/*.js').replace(/\\/g, '/');
const authFile = path.join(__dirname, '../routes/authRoutes.js').replace(/\\/g, '/');
const sucursalFile = path.join(__dirname, '../routes/sucursalRoutes.js').replace(/\\/g, '/');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BoxControl API REST',
      version: '1.0.0',
      description: 'Documentación oficial de la API de BoxControl — Sistema de Gestión de Membresías para Gimnasio de Boxeo.\n\n**Materia:** Aplicaciones Web y Móviles (6to Semestre)\n\n**Grupo 4:** Chachalo Joseph, Jiron Jonathan, Paredes Robert.',
      contact: {
        name: 'Soporte Técnico Grupo 4',
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
          description: 'Introduce tu token JWT sin comillas ni prefijos.',
        },
      },
    },
  },
  apis: [routesGlob, authFile, sucursalFile],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;
