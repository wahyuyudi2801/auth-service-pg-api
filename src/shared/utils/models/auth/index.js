// Load semua model & associations-nya (relasi antar tabel)
// Sequelize butuh associations untuk JOIN via include

const { sequelize } = require('../../db');

const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const UserToken = require('./UserToken');
const OtpCode = require('./OtpCode');
const AuditLog = require('./AuditLog');

// ── Junction tables (many-to-many) ────────────────────────

// user_roles — user bisa punya banyak role
const UserRole = sequelize.define('UserRole', {
  expires_at: { type: require('sequelize').DataTypes.DATE, allowNull: true },
  assigned_at: { type: require('sequelize').DataTypes.DATE, defaultValue: require('sequelize').DataTypes.NOW },
  assigned_by: { type: require('sequelize').DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'user_roles',
  timestamps: false,
});

// role_permissions — role bisa punya banyak permission
const RolePermission = sequelize.define('RolePermission', {
  granted_at: { type: require('sequelize').DataTypes.DATE, defaultValue: require('sequelize').DataTypes.NOW },
  granted_by: { type: require('sequelize').DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'role_permissions',
  timestamps: false,
});

// ── Associations ──────────────────────────────────────────

// User ↔ Role (many-to-many via user_roles)
User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: 'user_id',
  otherKey: 'role_id',
  as: 'roles',
});
Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: 'role_id',
  otherKey: 'user_id',
  as: 'users',
});

// Role ↔ Permission (many-to-many via role_permissions)
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions',
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles',
});

// User → UserToken (one-to-many)
User.hasMany(UserToken, { foreignKey: 'user_id', as: 'tokens', onDelete: 'CASCADE' });
UserToken.belongsTo(User, { foreignKey: 'user_id' });

// User → OtpCode (one-to-many)
User.hasMany(OtpCode, { foreignKey: 'user_id', as: 'otpCodes', onDelete: 'CASCADE' });
OtpCode.belongsTo(User, { foreignKey: 'user_id' });

// User → AuditLog (one-to-many, nullable)
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs', onDelete: 'SET NULL' });
AuditLog.belongsTo(User, { foreignKey: 'user_id' });

// ── Sync (development only) ───────────────────────────────
// Production: gunakan migrations
const syncDB = async (force = false) => {
  if (process.env.NODE_ENV === 'development') {
    await sequelize.sync({ alter: true, force });
    console.log('Sequelize sync selesai');
  }
};

module.exports = {
  sequelize,
  syncDB,
  // Models
  User, Role, Permission,
  UserToken, OtpCode, AuditLog,
  // Relations
  UserRole, RolePermission,
};
