const { DataTypes } = require('sequelize');
const { sequelize } = require('../../db');

const User = sequelize.define('User', {
  user_id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },
  username: {
    type:      DataTypes.STRING(100),
    allowNull: false,
    unique:    true,
  },
  email: {
    type:      DataTypes.STRING(150),
    allowNull: false,
    unique:    true,
    validate:  { isEmail: true },
  },
  password_hash: {
    type:      DataTypes.STRING(255),
    allowNull: false,
    comment:   'Argon2id hash',
  },
  full_name: {
    type:      DataTypes.STRING(200),
    allowNull: true,
  },
  phone_number: {
    type:      DataTypes.STRING(20),
    allowNull: true,
  },
  profile_picture_url: {
    type:      DataTypes.STRING(500),
    allowNull: true,
  },
  is_active: {
    type:         DataTypes.BOOLEAN,
    defaultValue: false,  // false = belum verify email
    allowNull:    false,
  },
  is_email_verified: {
    type:         DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull:    false,
  },
  email_verified_at: {
    type:      DataTypes.DATE,
    allowNull: true,
  },
  failed_attempts: {
    type:         DataTypes.INTEGER,
    defaultValue: 0,
    allowNull:    false,
  },
  locked_until: {
    type:      DataTypes.DATE,
    allowNull: true,
  },
  last_login_at: {
    type:      DataTypes.DATE,
    allowNull: true,
  },
  last_login_ip: {
    type:      DataTypes.STRING(45),
    allowNull: true,
  },
  deleted_at: {
    type:      DataTypes.DATE,
    allowNull: true,
  },
}, {
  schema:    'account',
  tableName:  'users',
  timestamps: true,
  createdAt:  'created_at',
  updatedAt:  'updated_at',
  // Soft delete — baris tidak benar-benar dihapus, deleted_at diisi
  paranoid:   false, // kita manage deleted_at manual supaya lebih fleksibel
});

module.exports = User;
