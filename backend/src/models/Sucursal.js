const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sucursal = sequelize.define('Sucursal', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  direccion: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  encargado: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Por asignar',
  },
  horario: {
    type: DataTypes.STRING(150),
    allowNull: true,
    defaultValue: 'L-V · 06:00 - 22:00 | S · 07:00 - 20:00',
  },
  capacidad: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 40,
  },
  estado: {
    type: DataTypes.ENUM('ACTIVA', 'INACTIVA'),
    defaultValue: 'ACTIVA',
  }
}, {
  tableName: 'sucursales',
});

module.exports = Sucursal;
