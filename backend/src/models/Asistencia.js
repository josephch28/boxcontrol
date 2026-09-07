const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Asistencia = sequelize.define('Asistencia', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'cliente_id',
  },
  sucursalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'sucursal_id',
  },
  fechaHora: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'fecha_hora',
  },
  metodo: {
    type: DataTypes.ENUM('QR_SCAN', 'MANUAL'),
    defaultValue: 'QR_SCAN',
  }
}, {
  tableName: 'asistencias',
  timestamps: false,
});

module.exports = Asistencia;
