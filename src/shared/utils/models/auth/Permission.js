const { DataTypes } = require('sequelize');
const { sequelize } = require('../../db');

const Permission = sequelize.define('Permission', {
  permission_id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },
  permission_code: {
    type:      DataTypes.STRING(100),
    allowNull: false,
    unique:    true,
    comment:   'Format: module:action — e.g. dept:read',
  },
  module: {
    type:      DataTypes.STRING(50),
    allowNull: false,
  },
  action: {
    type:      DataTypes.STRING(50),
    allowNull: false,
    comment:   'READ, WRITE, UPDATE, DELETE, APPROVE',
  },
  description: {
    type:      DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  schema:    'account',
  tableName:  'permissions',
  timestamps: true,
  updatedAt:  false,
  createdAt:  'created_at',
});

module.exports = Permission;
