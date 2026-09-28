const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContenidoIA = sequelize.define('ContenidoIA', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  tipo: {
    type: DataTypes.ENUM('RUTINA', 'ALIMENTACION'),
    allowNull: false,
  },
  titulo: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  nivel: {
    type: DataTypes.ENUM('PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'),
    defaultValue: 'PRINCIPIANTE',
  },
  estado: {
    type: DataTypes.ENUM('BORRADOR', 'PUBLICADO', 'RECHAZADO'),
    defaultValue: 'BORRADOR',
  },
  creadoPor: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'creado_por',
  },
}, {
  tableName: 'contenidos_ia',
  timestamps: true,
  underscored: true,
});

module.exports = ContenidoIA;
