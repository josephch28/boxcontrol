const sequelize = require('../config/database');
const Rol = require('./Rol');
const Sucursal = require('./Sucursal');
const Usuario = require('./Usuario');
const Cliente = require('./Cliente');
const TipoMembresia = require('./TipoMembresia');
const Membresia = require('./Membresia');
const Pago = require('./Pago');
const Asistencia = require('./Asistencia');
const ContenidoIA = require('./ContenidoIA');

// Asociaciones de Usuario y Rol
Rol.hasMany(Usuario, { foreignKey: 'rol_id', as: 'usuarios' });
Usuario.belongsTo(Rol, { foreignKey: 'rol_id', as: 'rol' });

// Asociaciones de Usuario y Sucursal
Sucursal.hasMany(Usuario, { foreignKey: 'sucursal_id', as: 'empleados' });
Usuario.belongsTo(Sucursal, { foreignKey: 'sucursal_id', as: 'sucursal' });

// Asociaciones de Cliente y Usuario
Usuario.hasOne(Cliente, { foreignKey: 'usuario_id', as: 'cliente' });
Cliente.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Asociaciones de Cliente y Sucursal Origen
Sucursal.hasMany(Cliente, { foreignKey: 'sucursal_origen_id', as: 'clientesRegistrados' });
Cliente.belongsTo(Sucursal, { foreignKey: 'sucursal_origen_id', as: 'sucursalOrigen' });

// Asociaciones de Membresías
Cliente.hasMany(Membresia, { foreignKey: 'cliente_id', as: 'membresias' });
Membresia.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

TipoMembresia.hasMany(Membresia, { foreignKey: 'tipo_membresia_id', as: 'membresias' });
Membresia.belongsTo(TipoMembresia, { foreignKey: 'tipo_membresia_id', as: 'tipoMembresia' });

Sucursal.hasMany(Membresia, { foreignKey: 'sucursal_id', as: 'membresias' });
Membresia.belongsTo(Sucursal, { foreignKey: 'sucursal_id', as: 'sucursal' });

// Asociaciones de Pagos
Membresia.hasMany(Pago, { foreignKey: 'membresia_id', as: 'pagos' });
Pago.belongsTo(Membresia, { foreignKey: 'membresia_id', as: 'membresia' });

Cliente.hasMany(Pago, { foreignKey: 'cliente_id', as: 'pagos' });
Pago.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

Sucursal.hasMany(Pago, { foreignKey: 'sucursal_id', as: 'pagos' });
Pago.belongsTo(Sucursal, { foreignKey: 'sucursal_id', as: 'sucursal' });

Usuario.hasMany(Pago, { foreignKey: 'registrado_por', as: 'pagosRegistrados' });
Pago.belongsTo(Usuario, { foreignKey: 'registrado_por', as: 'cajero' });

// Asociaciones de Asistencias
Cliente.hasMany(Asistencia, { foreignKey: 'cliente_id', as: 'asistencias' });
Asistencia.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

Sucursal.hasMany(Asistencia, { foreignKey: 'sucursal_id', as: 'asistencias' });
Asistencia.belongsTo(Sucursal, { foreignKey: 'sucursal_id', as: 'sucursal' });

// Asociaciones de Contenido IA
Usuario.hasMany(ContenidoIA, { foreignKey: 'creado_por', as: 'contenidosCreados' });
ContenidoIA.belongsTo(Usuario, { foreignKey: 'creado_por', as: 'autor' });

module.exports = {
  sequelize,
  Rol,
  Sucursal,
  Usuario,
  Cliente,
  TipoMembresia,
  Membresia,
  Pago,
  Asistencia,
  ContenidoIA,
};
