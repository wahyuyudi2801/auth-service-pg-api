const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('dependent', {
    dependent_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    relationship: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'employee_id'
      }
    }
  }, {
    sequelize,
    tableName: 'dependents',
    schema: 'hr',
    timestamps: false,
    indexes: [
      {
        name: "dependents_pkey",
        unique: true,
        fields: [
          { name: "dependent_id" },
        ]
      },
    ]
  });
};
