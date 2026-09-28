const express = require('express');
const router = express.Router();
const contenidoIAController = require('../controllers/contenidoIAController');
const { verificarToken, esAdmin, esAdminORecepcionista } = require('../middlewares/authMiddleware');

router.use(verificarToken);

/**
 * @swagger
 * /api/contenido-ia:
 *   get:
 *     summary: Listar rutinas y planes de nutrición asistidos por IA con filtro de estado
 *     tags: [Contenido IA]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [TODOS, BORRADOR, PUBLICADO, RECHAZADO]
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [RUTINA, ALIMENTACION]
 *     responses:
 *       200:
 *         description: Lista de contenidos y contadores de estado
 */
router.get('/', esAdminORecepcionista, contenidoIAController.getContenidos);

/**
 * @swagger
 * /api/contenido-ia/generar:
 *   post:
 *     summary: Generar borrador de entrenamiento o nutrición asistido por IA (RF-W12)
 *     tags: [Contenido IA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [RUTINA, ALIMENTACION]
 *               nivel:
 *                 type: string
 *                 enum: [PRINCIPIANTE, INTERMEDIO, AVANZADO]
 *               duracion:
 *                 type: string
 *               foco:
 *                 type: array
 *                 items:
 *                   type: string
 *               instrucciones:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contenido generado en estado BORRADOR para revisión
 */
router.post('/generar', esAdminORecepcionista, contenidoIAController.generarContenido);

/**
 * @swagger
 * /api/contenido-ia/{id}:
 *   put:
 *     summary: Modificar contenido generado durante curaduría del administrador
 *     tags: [Contenido IA]
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
 *         description: Contenido editado con éxito
 */
router.put('/:id', esAdminORecepcionista, contenidoIAController.actualizarContenido);

/**
 * @swagger
 * /api/contenido-ia/{id}/estado:
 *   patch:
 *     summary: Cambiar estado del contenido (PUBLICADO, RECHAZADO, BORRADOR)
 *     tags: [Contenido IA]
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
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [BORRADOR, PUBLICADO, RECHAZADO]
 *     responses:
 *       200:
 *         description: Estado modificado con éxito
 */
router.patch('/:id/estado', esAdminORecepcionista, contenidoIAController.cambiarEstadoContenido);

/**
 * @swagger
 * /api/contenido-ia/{id}:
 *   delete:
 *     summary: Eliminar contenido definitivamente
 *     tags: [Contenido IA]
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
 *         description: Contenido eliminado
 */
router.delete('/:id', esAdmin, contenidoIAController.eliminarContenido);

module.exports = router;
