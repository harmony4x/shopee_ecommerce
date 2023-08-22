'use strict';

const AccessService = require("../services/access.service");

const { CREATED, OK, SucessResponse } = require("../core/sucess.response");
const { findByEmail } = require("../services/shop.service");
const { BadRequestError, AuthFailureError } = require("../core/error.response");

const brypt = require("bcrypt")

class AccessController {

    handlerRefreshToken = async (req, res, next) => {
        
        new SucessResponse({
            message: 'Get Token Successfully',
            metadata: await AccessService.handlerRefreshToken(req.body.refreshToken)

        }).send(res)
    }

    logout = async (req, res, next) => {

        new SucessResponse({
            message: 'Logout Successfully',
            metadata: await AccessService.logout(req.keyStore)

        }).send(res)
    }

    login = async (req, res, next) => {
        new SucessResponse({
            metadata: await AccessService.login(req.body)

        }).send(res)
    }

    signUp = async (req, res, next) => {

        new CREATED({
            message: 'Registered OK',
            metadata: await AccessService.signUp(req.body)
        }).send(res)
        // return res.status(201).json(await AccessService.signUp(req.body))


    }


}

module.exports = new AccessController();