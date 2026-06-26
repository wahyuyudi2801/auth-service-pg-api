const { DataTypes } = require('sequelize');
const { sequelize } = require('../../db');

const Role = sequelize.define('Role', {
  role_id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },
  role_code: {
    type:      DataTypes.STRING(50),
    allowNull: false,
    unique:    true,
    comment:   'e.g. ADMIN, MANAGER, USER',
  },
  role_name: {
    type:      DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type:      DataTypes.STRING(255),
    allowNull: true,
  },
  is_active: {
    type:         DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull:    false,
  },
}, {
  schema:    'account',
  tableName:  'roles',
  timestamps: true,
  updatedAt:  'updated_at',
  createdAt:  'created_at',
});

module.exports = Role;
