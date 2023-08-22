const express = require('express');

const router = express.Router();
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/authUtils');
const RoleController = require('../../controllers/role.controller');


// authentication
router.use(authentication)

// 
router.post('/admin/create-role', asyncHandler(RoleController.createRole))
