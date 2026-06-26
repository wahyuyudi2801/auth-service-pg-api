var DataTypes = require("sequelize").DataTypes;
var _SequelizeMetum = require("./SequelizeMetum");
var _country = require("./country");
var _department = require("./department");
var _dependent = require("./dependent");
var _employee = require("./employee");
var _job = require("./job");
var _location = require("./location");
var _region = require("./region");
var _role_permission = require("./role_permission");
var _user_role = require("./user_role");
var _user = require("./user");

function initModels(sequelize) {
  var SequelizeMetum = _SequelizeMetum(sequelize, DataTypes);
  var country = _country(sequelize, DataTypes);
  var department = _department(sequelize, DataTypes);
  var dependent = _dependent(sequelize, DataTypes);
  var employee = _employee(sequelize, DataTypes);
  var job = _job(sequelize, DataTypes);
  var location = _location(sequelize, DataTypes);
  var region = _region(sequelize, DataTypes);
  var role_permission = _role_permission(sequelize, DataTypes);
  var user_role = _user_role(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);

  permission.belongsToMany(role, { as: 'role_id_roles', through: role_permission, foreignKey: "permission_id", otherKey: "role_id" });
  role.belongsToMany(permission, { as: 'permission_id_permissions', through: role_permission, foreignKey: "role_id", otherKey: "permission_id" });
  role.belongsToMany(user, { as: 'user_id_users', through: user_role, foreignKey: "role_id", otherKey: "user_id" });
  user.belongsToMany(role, { as: 'role_id_roles_user_roles', through: user_role, foreignKey: "user_id", otherKey: "role_id" });
  location.belongsTo(country, { as: "country", foreignKey: "country_id"});
  country.hasMany(location, { as: "locations", foreignKey: "country_id"});
  employee.belongsTo(department, { as: "department", foreignKey: "department_id"});
  department.hasMany(employee, { as: "employees", foreignKey: "department_id"});
  dependent.belongsTo(employee, { as: "employee", foreignKey: "employee_id"});
  employee.hasMany(dependent, { as: "dependents", foreignKey: "employee_id"});
  employee.belongsTo(employee, { as: "manager", foreignKey: "manager_id"});
  employee.hasMany(employee, { as: "employees", foreignKey: "manager_id"});
  employee.belongsTo(job, { as: "job", foreignKey: "job_id"});
  job.hasMany(employee, { as: "employees", foreignKey: "job_id"});
  department.belongsTo(location, { as: "location", foreignKey: "location_id"});
  location.hasMany(department, { as: "departments", foreignKey: "location_id"});
  role_permission.belongsTo(permission, { as: "permission", foreignKey: "permission_id"});
  permission.hasMany(role_permission, { as: "role_permissions", foreignKey: "permission_id"});
  country.belongsTo(region, { as: "region", foreignKey: "region_id"});
  region.hasMany(country, { as: "countries", foreignKey: "region_id"});
  role_permission.belongsTo(role, { as: "role", foreignKey: "role_id"});
  role.hasMany(role_permission, { as: "role_permissions", foreignKey: "role_id"});
  user_role.belongsTo(role, { as: "role", foreignKey: "role_id"});
  role.hasMany(user_role, { as: "user_roles", foreignKey: "role_id"});
  user_role.belongsTo(user, { as: "user", foreignKey: "user_id"});
  user.hasMany(user_role, { as: "user_roles", foreignKey: "user_id"});

  return {
    SequelizeMetum,
    country,
    department,
    dependent,
    employee,
    job,
    location,
    region,
    role_permission,
    user_role,
    user,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
