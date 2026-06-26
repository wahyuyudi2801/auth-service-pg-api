// src/shared/utils/models/OtpCode.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../db');

const OtpCode = sequelize.define('OtpCode', {
  otp_id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },
  user_id: {
    type:      DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'user_id' },
  },
  otp_hash: {
    type:      DataTypes.STRING(255),
    allowNull: false,
    comment:   'Argon2id hash dari OTP plain text',
  },
  purpose: {
    type:      DataTypes.ENUM(
      'EMAIL_VERIFY',
      'PASSWORD_RESET',
      'TWO_FACTOR',
      'PIN_SETUP',
      'PIN_RESET'
    ),
    allowNull: false,
  },
  expires_at: {
    type:      DataTypes.DATE,
    allowNull: false,
  },
  attempts: {
    type:         DataTypes.INTEGER,
    defaultValue: 0,
    allowNull:    false,
  },
  max_attempts: {
    type:         DataTypes.INTEGER,
    defaultValue: 3,
    allowNull:    false,
  },
  is_used: {
    type:         DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull:    false,
  },
  used_at: {
    type:      DataTypes.DATE,
    allowNull: true,
  },
}, {
  schema:    'account',
  tableName:  'otp_codes',
  timestamps: true,
  createdAt:  'created_at',
  updatedAt:  false,
});

module.exports = OtpCode;
