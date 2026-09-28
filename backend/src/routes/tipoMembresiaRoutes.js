const express = require('express');
const router = express.Router();
const tipoMembresiaController = require('../controllers/tipoMembresiaController');
const { verificarToken, esAdmin, esAdminORecepcionista } = require('../middlewares/authMiddleware');

router.use(verificarToken);

/**
 * @swagger
 * /api/tipos-membresia:
 *   get:
 *     summary: Listar todos los planes de membresía y recuento de socios activos
 *     tags: [Membresías]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de planes de boxeo
 */
router.get('/', esAdminORecepcionista, tipoMembresiaController.getTiposMembresia);

/**
 * @swagger
 * /api/tipos-membresia/{id}:
 *   get:
 *     summary: Obtener detalle de un plan de membresía
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
 *         description: Detalle del plan
 */
router.get('/:id', esAdminORecepcionista, tipoMembresiaController.getTipoMembresiaById);

/**
 * @swagger
 * /api/tipos-membresia:
 *   post:
 *     summary: Crear nuevo plan de boxeo (Solo Administrador)
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
 *               - nombre
 *               - precio
 *               - duracionDias
 *             properties:
 *               nombre:
 *                 type: string
 *               precio:
 *                 type: number
 *               duracionDias:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Plan creado con éxito
 */
router.post('/', esAdmin, tipoMembresiaController.createTipoMembresia);

/**
 * @swagger
 * /api/tipos-membresia/{id}:
 *   put:
 *     summary: Modificar plan de membresía (Solo Administrador)
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
 *         description: Plan actualizado
 */
router.put('/:id', esAdmin, tipoMembresiaController.updateTipoMembresia);

/**
 * @swagger
 * /api/tipos-membresia/{id}/toggle-estado:
 *   patch:
 *     summary: Alternar estado ACTIVA / INACTIVA del plan
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
 *         description: Estado alternado exitosamente
 */
router.patch('/:id/toggle-estado', esAdmin, tipoMembresiaController.toggleEstadoTipoMembresia);

module.exports = router;
