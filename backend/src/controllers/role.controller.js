'use strict';

const { CREATED, OK, SucessResponse } = require("../core/sucess.response");
const RoleService = require("../services/role.service");

class RoleController {
    static createRole = async (req,res,next) => {
        new SucessResponse({
            message: 'Create Role Successfully!',
            metadata: await RoleService.createRole(req.body)

        }).send(res)
    }
}

module.exports = RoleController