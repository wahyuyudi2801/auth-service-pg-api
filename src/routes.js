const express = require('express');
const authRoutes = require('./modules/auth/index');
const departmentRoutes = require('./modules/departments/index');

// tambah route lain di sini, contoh:
//const employeesRoutes   = require('./employeesRoutes');

// src/routes.js

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/departments', departmentRoutes);


module.exports = router;
