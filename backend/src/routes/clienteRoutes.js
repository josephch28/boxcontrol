const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { verificarToken, esAdminORecepcionista, restringirSucursalRecepcionista } = require('../middlewares/authMiddleware');

router.use(verificarToken, esAdminORecepcionista, restringirSucursalRecepcionista);

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Listar socios con filtros (búsqueda, sucursal, estado)
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre, apellido, cédula, teléfono o email
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: string
 *         description: ID de sucursal o 'TODAS'
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [TODOS, ACTIVOS, VENCIDOS, NUEVOS]
 *         description: Estado de membresía
 *     responses:
 *       200:
 *         description: Lista de socios obtenida con éxito
 */
router.get('/', clienteController.getClientes);

/**
 * @swagger
 * /api/clientes/{id}:
 *   get:
 *     summary: Obtener perfil completo de un socio, membresías, asistencias y pagos
 *     tags: [Clientes]
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
 *         description: Perfil detallado del socio
 *       404:
 *         description: Socio no encontrado
 */
router.get('/:id', clienteController.getClienteById);

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     summary: Registrar nuevo socio con carnet digital QR único
 *     tags: [Clientes]
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
 *               - apellido
 *               - email
 *               - cedula
 *               - sucursalOrigenId
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               cedula:
 *                 type: string
 *               sucursalOrigenId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Socio registrado con éxito
 */
router.post('/', clienteController.createCliente);

/**
 * @swagger
 * /api/clientes/{id}:
 *   put:
 *     summary: Actualizar datos de un socio
 *     tags: [Clientes]
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
 *         description: Socio actualizado con éxito
 */
router.put('/:id', clienteController.updateCliente);

/**
 * @swagger
 * /api/clientes/{id}:
 *   delete:
 *     summary: Alternar estado activo/inactivo de un socio
 *     tags: [Clientes]
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
 *         description: Estado modificado con éxito
 */
router.delete('/:id', clienteController.deleteCliente);

module.exports = router;
