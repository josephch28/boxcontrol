const jwt = require('jsonwebtoken');
const { Usuario, Rol, Sucursal } = require('../models');

// Middleware para verificar JWT
const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado. Token no proporcionado o formato inválido.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'BoxControl_Super_Secret_Key_2026_Grupo4');

    const usuario = await Usuario.findByPk(decoded.id, {
      include: [
        { model: Rol, as: 'rol', attributes: ['id', 'nombre'] },
        { model: Sucursal, as: 'sucursal', attributes: ['id', 'nombre'] },
      ],
      attributes: { exclude: ['password'] },
    });

    if (!usuario || usuario.estado !== 'ACTIVO') {
      return res.status(401).json({
        success: false,
        message: 'Usuario no válido, inexistente o inactivo.',
      });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'El token de autenticación ha expirado.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token de autenticación inválido.',
      error: error.message,
    });
  }
};

// Middleware para verificar rol Administrador (RF-W01)
const esAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol?.nombre !== 'ADMINISTRADOR') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de ADMINISTRADOR.',
    });
  }
  next();
};

// Middleware para Administrador o Recepcionista
const esAdminORecepcionista = (req, res, next) => {
  const rolNombre = req.usuario?.rol?.nombre;
  if (rolNombre !== 'ADMINISTRADOR' && rolNombre !== 'RECEPCIONISTA') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Rol no autorizado para esta operación.',
    });
  }
  next();
};

module.exports = {
  verificarToken,
  esAdmin,
  esAdminORecepcionista,
};
