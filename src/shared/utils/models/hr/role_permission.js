const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('role_permission', {
    granted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    granted_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'roles',
        key: 'role_id'
      }
    },
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'permissions',
        key: 'permission_id'
      }
    }
  }, {
    sequelize,
    tableName: 'role_permissions',
    schema: 'hr',
    timestamps: false,
    indexes: [
      {
        name: "role_permissions_pkey",
        unique: true,
        fields: [
          { name: "role_id" },
          { name: "permission_id" },
        ]
      },
    ]
  });
};
