const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verificarToken, esAdminORecepcionista, restringirSucursalRecepcionista } = require('../middlewares/authMiddleware');

router.use(verificarToken, esAdminORecepcionista, restringirSucursalRecepcionista);

/**
 * @swagger
 * /api/dashboard/metrics:
 *   get:
 *     summary: Obtener indicadores clave (KPIs), vencimientos y gráfico de ingresos para el panel
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: string
 *         description: Filtrar métricas por sucursal ('TODAS', '1', '2')
 *     responses:
 *       200:
 *         description: Métricas completas para el dashboard
 */
router.get('/metrics', dashboardController.getDashboardMetrics);

module.exports = router;
