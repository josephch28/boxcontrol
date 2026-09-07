const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TipoMembresia = sequelize.define('TipoMembresia', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  duracionDias: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'duracion_dias',
  },
  estado: {
    type: DataTypes.ENUM('ACTIVA', 'INACTIVA'),
    defaultValue: 'ACTIVA',
  }
}, {
  tableName: 'tipos_membresia',
});

module.exports = TipoMembresia;
