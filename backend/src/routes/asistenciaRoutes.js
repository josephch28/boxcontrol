const express = require('express');
const router = express.Router();
const asistenciaController = require('../controllers/asistenciaController');
const { verificarToken, esAdminORecepcionista, restringirSucursalRecepcionista } = require('../middlewares/authMiddleware');

router.use(verificarToken, esAdminORecepcionista, restringirSucursalRecepcionista);

/**
 * @swagger
 * /api/asistencias:
 *   get:
 *     summary: Listar ingresos presenciales recientes con filtro de sucursal
 *     tags: [Control de Asistencia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: string
 *       - in: query
 *         name: clienteId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de asistencias
 */
router.get('/', asistenciaController.getAsistencias);

/**
 * @swagger
 * /api/asistencias/checkin:
 *   post:
 *     summary: Validar acceso presencial mediante escaneo QR o cédula (RF-M03)
 *     tags: [Control de Asistencia]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigoQr:
 *                 type: string
 *                 example: GD-SOCIO-1723456789
 *               cedula:
 *                 type: string
 *                 example: 1723456789
 *               sucursalId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Acceso autorizado y registrado en MySQL
 *       403:
 *         description: Membresía vencida o no activa (acceso denegado)
 *       404:
 *         description: Socio no encontrado
 */
router.post('/checkin', asistenciaController.registrarAsistencia);

module.exports = router;
