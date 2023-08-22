const roleModel = require("../models/role.model")



class RoleService {
    // static findRoleByName  =  async(name) =>{
    //     return 
    // }

    static createRole = async({name}) => {
        return await roleModel.create({name})
    }
}

module.exports = RoleService