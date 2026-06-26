const { DataTypes } = require('sequelize');
const { sequelize } = require('../../db');

const UserToken = sequelize.define('UserToken', {
  token_id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },
  user_id: {
    type:      DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'user_id' },
  },
  token_type: {
    type:      DataTypes.ENUM('REFRESH', 'ACCESS_JTI'),
    allowNull: false,
    comment:   'REFRESH=refresh token, ACCESS_JTI=jti dari JWT',
  },
  token_value: {
    type:      DataTypes.STRING(500),
    allowNull: false,
    comment:   'UUID untuk refresh token, JTI untuk access token',
  },
  device_info: {
    type:      DataTypes.STRING(255),
    allowNull: true,
  },
  ip_address: {
    type:      DataTypes.STRING(45),
    allowNull: true,
  },
  expires_at: {
    type:      DataTypes.DATE,
    allowNull: false,
  },
  is_revoked: {
    type:         DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull:    false,
  },
  revoked_at: {
    type:      DataTypes.DATE,
    allowNull: true,
  },
  revoked_by: {
    type:      DataTypes.STRING(50),
    allowNull: true,
    comment:   'LOGOUT | ADMIN | PASSWORD_CHANGE',
  },
}, {
  schema:    'account',
  tableName:  'user_tokens',
  timestamps: true,
  createdAt:  'created_at',
  updatedAt:  false,
});

module.exports = UserToken;
