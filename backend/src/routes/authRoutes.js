const express = require('express');
const router = express.Router();
const { login, getPerfil } = require('../controllers/authController');
const { verificarToken } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión de usuario (Administrador / Recepcionista / Cliente)
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@boxcontrol.com
 *               password:
 *                 type: string
 *                 example: Admin123*
 *     responses:
 *       200:
 *         description: Login exitoso, retorna Token JWT y datos del usuario
 *       401:
 *         description: Credenciales incorrectas
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del perfil del usuario
 *       401:
 *         description: Token no provisto o inválido
 */
router.get('/profile', verificarToken, getPerfil);

module.exports = router;
