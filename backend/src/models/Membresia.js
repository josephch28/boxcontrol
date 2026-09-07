const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Membresia = sequelize.define('Membresia', {
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
  tipoMembresiaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'tipo_membresia_id',
  },
  sucursalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'sucursal_id',
  },
  fechaInicio: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'fecha_inicio',
  },
  fechaFin: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'fecha_fin',
  },
  estado: {
    type: DataTypes.ENUM('ACTIVA', 'VENCIDA', 'CANCELADA'),
    defaultValue: 'ACTIVA',
  }
}, {
  tableName: 'membresias',
});

module.exports = Membresia;
