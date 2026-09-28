const express = require('express');
const router = express.Router();
const membresiaController = require('../controllers/membresiaController');
const { verificarToken, esAdminORecepcionista, restringirSucursalRecepcionista } = require('../middlewares/authMiddleware');

router.use(verificarToken, esAdminORecepcionista, restringirSucursalRecepcionista);

/**
 * @swagger
 * /api/membresias:
 *   get:
 *     summary: Listar asignaciones de membresía
 *     tags: [Membresías]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de membresías asignadas
 */
router.get('/', membresiaController.getMembresias);

/**
 * @swagger
 * /api/membresias/proximas-a-vencer:
 *   get:
 *     summary: Listar membresías que vencen en los próximos 7 días con filtro de sucursal
 *     tags: [Membresías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: string
 *       - in: query
 *         name: dias
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista ordenada por urgencia de vencimiento
 */
router.get('/proximas-a-vencer', membresiaController.getProximasAVencer);

/**
 * @swagger
 * /api/membresias/asignar:
 *   post:
 *     summary: Asignar o renovar membresía a un socio con cálculo de vigencia
 *     tags: [Membresías]
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
 *             properties:
 *               clienteId:
 *                 type: integer
 *               tipoMembresiaId:
 *                 type: integer
 *               sucursalId:
 *                 type: integer
 *               fechaInicio:
 *                 type: string
 *     responses:
 *       201:
 *         description: Membresía asignada con éxito
 */
router.post('/asignar', membresiaController.asignarMembresia);

/**
 * @swagger
 * /api/membresias/{id}:
 *   put:
 *     summary: Actualizar datos de una membresía (fechas, plan, estado)
 *     tags: [Membresías]
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
 *         description: Membresía actualizada
 */
router.put('/:id', membresiaController.updateMembresia);

module.exports = router;
