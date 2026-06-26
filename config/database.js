const config = require('./index'); 

const dbConfig = {
  username: config.db.user,
  password: config.db.password,
  database: config.db.name,
  host:     config.db.host,
  port:     config.db.port,
  dialect:  config.db.dialect || 'postgres',
  pool:     config.db.pool
};

module.exports = {
  development: dbConfig,
  test:        dbConfig,
  production:  dbConfig
};