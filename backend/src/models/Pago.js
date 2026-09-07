const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pago = sequelize.define('Pago', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  membresiaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'membresia_id',
  },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'cliente_id',
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  metodoPago: {
    type: DataTypes.ENUM('EFECTIVO', 'TRANSFERENCIA', 'TARJETA'),
    defaultValue: 'EFECTIVO',
    field: 'metodo_pago',
  },
  referencia: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  sucursalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'sucursal_id',
  },
  registradoPor: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'registrado_por',
  },
  fechaPago: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'fecha_pago',
  }
}, {
  tableName: 'pagos',
  timestamps: false,
});

module.exports = Pago;
