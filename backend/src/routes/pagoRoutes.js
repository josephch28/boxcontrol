const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pagoController');
const { verificarToken, esAdminORecepcionista, restringirSucursalRecepcionista } = require('../middlewares/authMiddleware');

router.use(verificarToken, esAdminORecepcionista, restringirSucursalRecepcionista);

/**
 * @swagger
 * /api/pagos:
 *   get:
 *     summary: Listar cobros y pagos con filtros por sede, socio y rango de fechas
 *     tags: [Pagos y Cobros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: string
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de transacciones
 */
router.get('/', pagoController.getPagos);

/**
 * @swagger
 * /api/pagos/cliente/{clienteId}:
 *   get:
 *     summary: Visualizar historial de pagos de un socio específico
 *     tags: [Pagos y Cobros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Historial de cobros del cliente
 */
router.get('/cliente/:clienteId', pagoController.getHistorialPagosCliente);

/**
 * @swagger
 * /api/pagos:
 *   post:
 *     summary: Registrar cobro/pago de membresía en caja
 *     tags: [Pagos y Cobros]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clienteId
 *               - tipoMembresiaId
 *               - sucursalId
 *               - monto
 *             properties:
 *               clienteId:
 *                 type: integer
 *               tipoMembresiaId:
 *                 type: integer
 *               sucursalId:
 *                 type: integer
 *               monto:
 *                 type: number
 *               metodoPago:
 *                 type: string
 *                 enum: [EFECTIVO, TRANSFERENCIA, TARJETA]
 *               referencia:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cobro registrado exitosamente y recibo emitido
 */
router.post('/', pagoController.registrarPago);

module.exports = router;
