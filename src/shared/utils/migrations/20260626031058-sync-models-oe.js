'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `CREATE TABLE oe.customers (
        customer_id SERIAL PRIMARY KEY,
        cust_first_name CHARACTER VARYING(20) NOT NULL,
        cust_last_name CHARACTER VARYING(25) NOT NULL,
        cust_street_address CHARACTER VARYING(40),
        cust_postal_code CHARACTER VARYING(12),
        cust_city CHARACTER VARYING(30),
        cust_state_province CHARACTER VARYING(25),
        country_id CHARACTER(2),
        phone_number CHARACTER VARYING(25),
        cust_email CHARACTER VARYING(100) UNIQUE,
        account_mgr_id INTEGER, -- Relasi ke employees(employee_id) di schema hr
        credit_limit NUMERIC(9,2),
        date_of_birth DATE,
        marital_status CHARACTER VARYING(20),
        gender CHARACTER(1),
        income_level CHARACTER VARYING(20),
        FOREIGN KEY (account_mgr_id) REFERENCES hr.employees (employee_id) ON UPDATE CASCADE ON DELETE SET NULL
    );
    `
    );
  },

  async down(queryInterface, Sequelize) {
     await queryInterface.sequelize.query(`drop table oe.customers`);
  }
};
