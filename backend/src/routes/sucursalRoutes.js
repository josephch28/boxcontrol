const express = require('express');
const router = express.Router();
const {
  getSucursales,
  getSucursalById,
  createSucursal,
  updateSucursal,
  deleteSucursal,
} = require('../controllers/sucursalController');
const { verificarToken, esAdmin } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/sucursales:
 *   get:
 *     summary: Listar todas las sucursales del gimnasio (RF-W10)
 *     tags: [Sucursales]
 *     responses:
 *       200:
 *         description: Lista de sucursales
 */
router.get('/', getSucursales);

/**
 * @swagger
 * /api/sucursales/{id}:
 *   get:
 *     summary: Obtener detalle de una sucursal por ID
 *     tags: [Sucursales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos de la sucursal
 *       404:
 *         description: Sucursal no encontrada
 */
router.get('/:id', getSucursalById);

/**
 * @swagger
 * /api/sucursales:
 *   post:
 *     summary: Registrar una nueva sucursal (Solo Administrador)
 *     tags: [Sucursales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - direccion
 *               - telefono
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Sucursal Valles - Cumbayá
 *               direccion:
 *                 type: string
 *                 example: Av. Interoceánica km 12
 *               telefono:
 *                 type: string
 *                 example: 0998877665
 *               email:
 *                 type: string
 *                 example: valles@boxcontrol.com
 *     responses:
 *       201:
 *         description: Sucursal creada
 *       403:
 *         description: Permiso denegado (Requiere rol Admin)
 */
router.post('/', verificarToken, esAdmin, createSucursal);

/**
 * @swagger
 * /api/sucursales/{id}:
 *   put:
 *     summary: Actualizar información de una sucursal (Solo Administrador)
 *     tags: [Sucursales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               direccion:
 *                 type: string
 *               telefono:
 *                 type: string
 *               email:
 *                 type: string
 *               estado:
 *                 type: string
 *                 enum: [ACTIVA, INACTIVA]
 *     responses:
 *       200:
 *         description: Sucursal actualizada
 */
router.put('/:id', verificarToken, esAdmin, updateSucursal);

/**
 * @swagger
 * /api/sucursales/{id}/toggle-estado:
 *   patch:
 *     summary: Activar o inactivar una sucursal (Solo Administrador)
 *     tags: [Sucursales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estado modificado
 */
router.patch('/:id/toggle-estado', verificarToken, esAdmin, deleteSucursal);

module.exports = router;
