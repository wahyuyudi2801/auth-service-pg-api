const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_role', {
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    assigned_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    assigned_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'roles',
        key: 'role_id'
      }
    }
  }, {
    sequelize,
    tableName: 'user_roles',
    schema: 'hr',
    timestamps: false,
    indexes: [
      {
        name: "user_roles_pkey",
        unique: true,
        fields: [
          { name: "user_id" },
          { name: "role_id" },
        ]
      },
    ]
  });
};
