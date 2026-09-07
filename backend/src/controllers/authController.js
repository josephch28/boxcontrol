const jwt = require('jsonwebtoken');
const { Usuario, Rol, Sucursal } = require('../models');

// Iniciar sesión con email y contraseña (RF-W01, RF-M01)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor ingrese email y contraseña.',
      });
    }

    const usuario = await Usuario.findOne({
      where: { email: email.toLowerCase().trim() },
      include: [
        { model: Rol, as: 'rol', attributes: ['id', 'nombre'] },
        { model: Sucursal, as: 'sucursal', attributes: ['id', 'nombre'] },
      ],
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas. Usuario no encontrado.',
      });
    }

    if (usuario.estado !== 'ACTIVO') {
      return res.status(403).json({
        success: false,
        message: 'La cuenta de usuario se encuentra inactiva.',
      });
    }

    const passwordValido = await usuario.compararPassword(password);
    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas. Contraseña incorrecta.',
      });
    }

    // Generar Token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol?.nombre,
        sucursalId: usuario.sucursalId,
      },
      process.env.JWT_SECRET || 'BoxControl_Super_Secret_Key_2026_Grupo4',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso.',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        telefono: usuario.telefono,
        rol: usuario.rol?.nombre,
        sucursal: usuario.sucursal ? {
          id: usuario.sucursal.id,
          nombre: usuario.sucursal.nombre,
        } : null,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al procesar el inicio de sesión.',
      error: error.message,
    });
  }
};

// Obtener perfil del usuario autenticado
const getPerfil = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      usuario: req.usuario,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al consultar perfil.',
      error: error.message,
    });
  }
};

module.exports = {
  login,
  getPerfil,
};
