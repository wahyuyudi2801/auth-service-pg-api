const express = require('express');
const ctrl    = require('./department.controller');
const authenticate = require('../../shared/middlewares/authenticate');
const authorize = require('../../shared/middlewares/authorize');

const router = express.Router();

router.get('/', authenticate,    ctrl.index);   
router.get('/:id', authenticate, ctrl.show);   
router.post('/', authenticate,   ctrl.store);  
router.put('/:id', authenticate, ctrl.update); 
router.delete('/:id', authenticate, authorize.roles(['ADMIN', 'MANAGER']), ctrl.destroy); 

module.exports = router;