// Sequelize connection untuk PostgreSQL
const { Sequelize } = require('sequelize');
const config        = require('../../../config');

const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.password,
  {
    host:    config.db.host,
    port:    config.db.port,
    dialect: 'postgres',
    pool:    config.db.pool,
    logging: config.app.isDev
      ? (sql) => console.log(`\n[SQL] ${sql}\n`)
      : false,
    define: {
      // Semua model pake snake_case di DB, di JS kita gunakan camelCase 
      underscored:   true,
      timestamps:    true,
      createdAt:     'created_at',
      updatedAt:     'updated_at',
    },
  }
);

const connectDB = async () => {
  await sequelize.authenticate();
  console.log(`PostgreSQL connected — ${config.db.host}:${config.db.port}/${config.db.name}`);
};



const closeDB = async () => {
  await sequelize.close();
  console.log('PostgreSQL connection closed.');
};

module.exports = { sequelize, connectDB, closeDB };
