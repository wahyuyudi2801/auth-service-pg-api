const { DataTypes } = require('sequelize');
const { sequelize } = require('../../db');

const AuditLog = sequelize.define('AuditLog', {
  log_id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },
  user_id: {
    type:      DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'user_id' },
  },
  action: {
    type:      DataTypes.ENUM(
      'LOGIN', 'LOGOUT', 'REGISTER', 'EMAIL_VERIFY',
      'PASSWORD_RESET', 'PASSWORD_CHANGE', 'PIN_SETUP',
      'PIN_VERIFY', 'TOKEN_REFRESH', 'TOKEN_REVOKE',
      'ROLE_ASSIGN', 'ROLE_REMOVE', 'ACCOUNT_LOCK', 'ACCOUNT_UNLOCK'
    ),
    allowNull: false,
  },
  status: {
    type:      DataTypes.ENUM('SUCCESS', 'FAILED', 'BLOCKED'),
    allowNull: false,
  },
  ip_address: {
    type:      DataTypes.STRING(45),
    allowNull: true,
  },
  user_agent: {
    type:      DataTypes.STRING(500),
    allowNull: true,
  },
  detail: {
    type:      DataTypes.STRING(1000),
    allowNull: true,
  },
}, {
  schema:    'account',
  tableName:  'audit_logs',
  timestamps: true,
  createdAt:  'created_at',
  updatedAt:  false,
});

module.exports = AuditLog;
