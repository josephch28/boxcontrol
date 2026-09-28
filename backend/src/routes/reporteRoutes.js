const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const { verificarToken, esAdminORecepcionista, restringirSucursalRecepcionista } = require('../middlewares/authMiddleware');

router.use(verificarToken, esAdminORecepcionista, restringirSucursalRecepcionista);

/**
 * @swagger
 * /api/reportes/ingresos:
 *   get:
 *     summary: Generar reporte financiero de ingresos por sucursal y rango de fechas
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: string
 *         description: ID de sucursal o 'TODAS'
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *         description: Fecha inicial YYYY-MM-DD
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *         description: Fecha final YYYY-MM-DD
 *     responses:
 *       200:
 *         description: Resumen financiero, desglose por plan, gráfico diario y transacciones
 */
router.get('/ingresos', reporteController.getReporteIngresos);

module.exports = router;
