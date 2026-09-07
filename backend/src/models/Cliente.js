const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'usuario_id',
  },
  cedula: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  fechaNacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'fecha_nacimiento',
  },
  genero: {
    type: DataTypes.ENUM('M', 'F', 'OTRO'),
    allowNull: true,
  },
  codigoQr: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    field: 'codigo_qr',
  },
  sucursalOrigenId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'sucursal_origen_id',
  }
}, {
  tableName: 'clientes',
});

module.exports = Cliente;
